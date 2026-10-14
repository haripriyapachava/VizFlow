import hashlib
import hmac
import os
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix='/api')

SESSION_COOKIE = 'vizflow_session'
SESSION_DAYS = 14
PASSWORD_ITERATIONS = 600_000
BASE_DIR = Path(__file__).resolve().parent.parent


def database_path():
    configured = os.getenv('DB_URL', 'sqlite:///./vizflow.db')
    if not configured.startswith('sqlite:///'):
        raise RuntimeError('VizFlow authentication currently requires a SQLite DB_URL.')
    raw_path = configured[len('sqlite:///'):]
    path = Path(raw_path)
    return path if path.is_absolute() else BASE_DIR / path


@contextmanager
def connect_database():
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys = ON')
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database():
    with connect_database() as connection:
        connection.executescript(
            '''
            CREATE TABLE IF NOT EXISTS student_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                full_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS student_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_student_sessions_user
                ON student_sessions(user_id);
            CREATE TABLE IF NOT EXISTS student_progress (
                user_id INTEGER NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                active_seconds INTEGER NOT NULL DEFAULT 0,
                visits INTEGER NOT NULL DEFAULT 0,
                last_accessed TEXT NOT NULL,
                PRIMARY KEY (user_id, lesson_id)
            );
            CREATE TABLE IF NOT EXISTS student_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_time TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_student_activity_user_time
                ON student_activity(user_id, event_time);
            CREATE TABLE IF NOT EXISTS student_study_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL,
                active_seconds INTEGER NOT NULL,
                studied_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_student_study_user_time
                ON student_study_logs(user_id, studied_at);
            '''
        )


def _now():
    return datetime.now(timezone.utc).replace(microsecond=0)


def _hash_password(password):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, PASSWORD_ITERATIONS)
    return f'pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}'


def _verify_password(password, stored_hash):
    try:
        algorithm, iterations, salt_hex, digest_hex = stored_hash.split('$', 3)
        if algorithm != 'pbkdf2_sha256':
            return False
        digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), bytes.fromhex(salt_hex), int(iterations))
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _token_hash(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _new_session(user_id):
    token = secrets.token_urlsafe(32)
    expires = _now() + timedelta(days=SESSION_DAYS)
    with connect_database() as connection:
        connection.execute(
            'INSERT INTO student_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
            (_token_hash(token), user_id, expires.isoformat()),
        )
    return token


def _set_session_cookie(response, token):
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=os.getenv('APP_ENV', 'development').lower() == 'production',
        samesite='lax',
        path='/',
    )


def _public_user(row):
    return {'id': row['id'], 'name': row['full_name'], 'email': row['email'], 'role': 'student'}


class StudentRegistration(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError('Enter your full name.')
        return value

    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        value = value.strip().lower()
        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', value):
            raise ValueError('Enter a valid email address.')
        return value


class StudentLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower()


class StudyActivity(BaseModel):
    active_seconds: int = Field(ge=1, le=300)


def _student_from_request(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None

    with connect_database() as connection:
        row = connection.execute(
            '''
            SELECT account.id, account.email, account.full_name
            FROM student_sessions AS session
            JOIN student_accounts AS account ON account.id = session.user_id
            WHERE session.token_hash = ? AND session.expires_at > ?
            ''',
            (_token_hash(token), _now().isoformat()),
        ).fetchone()
    return _public_user(row) if row else None


def current_student(request: Request):
    student = _student_from_request(request)
    if not student:
        raise HTTPException(status_code=401, detail='Please sign in to continue.')
    return student


AuthenticatedStudent = Annotated[dict, Depends(current_student)]


@router.post('/auth/register', status_code=201)
def register(payload: StudentRegistration, response: Response):
    try:
        with connect_database() as connection:
            cursor = connection.execute(
                'INSERT INTO student_accounts (email, full_name, password_hash, created_at) VALUES (?, ?, ?, ?)',
                (payload.email, payload.full_name, _hash_password(payload.password), _now().isoformat()),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError as error:
        if 'student_accounts.email' in str(error).lower() or 'unique constraint' in str(error).lower():
            raise HTTPException(status_code=409, detail='An account with this email already exists.') from error
        raise

    token = _new_session(user_id)
    _set_session_cookie(response, token)
    return {'user': {'id': user_id, 'name': payload.full_name, 'email': payload.email, 'role': 'student'}}


@router.post('/auth/login')
def login(payload: StudentLogin, response: Response):
    with connect_database() as connection:
        row = connection.execute(
            'SELECT id, email, full_name, password_hash FROM student_accounts WHERE email = ? COLLATE NOCASE',
            (payload.email,),
        ).fetchone()
    if not row or not _verify_password(payload.password, row['password_hash']):
        raise HTTPException(status_code=401, detail='Email or password is incorrect.')

    token = _new_session(row['id'])
    _set_session_cookie(response, token)
    return {'user': _public_user(row)}


@router.get('/auth/me')
def me(request: Request):
    return {'user': _student_from_request(request)}


@router.post('/auth/logout')
def logout(request: Request, response: Response, student: AuthenticatedStudent):
    token = request.cookies.get(SESSION_COOKIE)
    with connect_database() as connection:
        connection.execute('DELETE FROM student_sessions WHERE token_hash = ?', (_token_hash(token),))
    response.delete_cookie(SESSION_COOKIE, httponly=True, samesite='lax', path='/')
    return {'message': 'Signed out successfully.'}


@router.get('/progress')
def get_progress(student: AuthenticatedStudent):
    user_id = student['id']
    today = _now().date()
    week_start = today - timedelta(days=6)
    with connect_database() as connection:
        lessons = connection.execute(
            '''
            SELECT lesson_id, completed, active_seconds, visits, last_accessed
            FROM student_progress WHERE user_id = ? ORDER BY last_accessed DESC
            ''',
            (user_id,),
        ).fetchall()
        totals = connection.execute(
            '''
            SELECT COALESCE(SUM(active_seconds), 0) AS total_seconds,
                   COALESCE(SUM(CASE WHEN substr(studied_at, 1, 10) = ? THEN active_seconds ELSE 0 END), 0) AS today_seconds
            FROM student_study_logs WHERE user_id = ?
            ''',
            (today.isoformat(), user_id),
        ).fetchone()
        daily_rows = connection.execute(
            '''
            SELECT substr(studied_at, 1, 10) AS study_date, SUM(active_seconds) AS active_seconds
            FROM student_study_logs
            WHERE user_id = ? AND substr(studied_at, 1, 10) >= ?
            GROUP BY substr(studied_at, 1, 10)
            ''',
            (user_id, week_start.isoformat()),
        ).fetchall()
        history = connection.execute(
            '''
            SELECT lesson_id, event_type, event_time
            FROM student_activity WHERE user_id = ?
            ORDER BY event_time DESC, id DESC LIMIT 20
            ''',
            (user_id,),
        ).fetchall()

    weekly = {row['study_date']: row['active_seconds'] for row in daily_rows}
    return {
        'completedLessons': [row['lesson_id'] for row in lessons if row['completed']],
        'lessons': [
            {
                'lessonId': row['lesson_id'],
                'completed': bool(row['completed']),
                'activeSeconds': row['active_seconds'],
                'visits': row['visits'],
                'lastAccessed': row['last_accessed'],
            }
            for row in lessons
        ],
        'totalStudySeconds': totals['total_seconds'],
        'todayStudySeconds': totals['today_seconds'],
        'weeklyMinutes': [
            weekly.get((week_start + timedelta(days=offset)).isoformat(), 0) // 60
            for offset in range(7)
        ],
        'history': [
            {'lessonId': row['lesson_id'], 'eventType': row['event_type'], 'at': row['event_time']}
            for row in history
        ],
    }


@router.post('/progress/lessons/{lesson_id}/visit', status_code=204)
def record_lesson_visit(lesson_id: str, student: AuthenticatedStudent):
    if not lesson_id or len(lesson_id) > 120:
        raise HTTPException(status_code=422, detail='Invalid lesson identifier.')
    now = _now().isoformat()
    with connect_database() as connection:
        connection.execute(
            '''
            INSERT INTO student_progress (user_id, lesson_id, last_accessed, visits)
            VALUES (?, ?, ?, 1)
            ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                visits = visits + 1, last_accessed = excluded.last_accessed
            ''',
            (student['id'], lesson_id, now),
        )
        connection.execute(
            'INSERT INTO student_activity (user_id, lesson_id, event_type, event_time) VALUES (?, ?, ?, ?)',
            (student['id'], lesson_id, 'lesson_opened', now),
        )


@router.post('/progress/lessons/{lesson_id}/activity', status_code=204)
def record_study_activity(lesson_id: str, payload: StudyActivity, student: AuthenticatedStudent):
    if not lesson_id or len(lesson_id) > 120:
        raise HTTPException(status_code=422, detail='Invalid lesson identifier.')
    now = _now().isoformat()
    with connect_database() as connection:
        connection.execute(
            '''
            INSERT INTO student_progress (user_id, lesson_id, last_accessed, active_seconds)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                active_seconds = active_seconds + excluded.active_seconds,
                last_accessed = excluded.last_accessed
            ''',
            (student['id'], lesson_id, now, payload.active_seconds),
        )
        connection.execute(
            'INSERT INTO student_study_logs (user_id, lesson_id, active_seconds, studied_at) VALUES (?, ?, ?, ?)',
            (student['id'], lesson_id, payload.active_seconds, now),
        )


@router.post('/progress/lessons/{lesson_id}/complete', status_code=204)
def complete_lesson(lesson_id: str, student: AuthenticatedStudent):
    if not lesson_id or len(lesson_id) > 120:
        raise HTTPException(status_code=422, detail='Invalid lesson identifier.')
    now = _now().isoformat()
    with connect_database() as connection:
        existing = connection.execute(
            'SELECT completed FROM student_progress WHERE user_id = ? AND lesson_id = ?',
            (student['id'], lesson_id),
        ).fetchone()
        connection.execute(
            '''
            INSERT INTO student_progress (user_id, lesson_id, completed, last_accessed)
            VALUES (?, ?, 1, ?)
            ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                completed = 1, last_accessed = excluded.last_accessed
            ''',
            (student['id'], lesson_id, now),
        )
        if not existing or not existing['completed']:
            connection.execute(
                'INSERT INTO student_activity (user_id, lesson_id, event_type, event_time) VALUES (?, ?, ?, ?)',
                (student['id'], lesson_id, 'lesson_completed', now),
            )
