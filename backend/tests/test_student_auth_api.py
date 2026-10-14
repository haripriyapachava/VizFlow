import http.cookiejar
import json
import os
import socket
import sqlite3
import sys
import threading
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path

import uvicorn


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))


class StudentAuthApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_directory = tempfile.TemporaryDirectory()
        cls.database_path = Path(cls.temp_directory.name) / 'student-auth-test.db'
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0))
            cls.port = listener.getsockname()[1]
        cls.previous_db_url = os.environ.get('DB_URL')
        os.environ['DB_URL'] = f'sqlite:///{cls.database_path}'
        from app.main import app

        cls.server = uvicorn.Server(uvicorn.Config(app, host='127.0.0.1', port=cls.port, log_level='critical'))
        cls.server_thread = threading.Thread(target=cls.server.run, daemon=True)
        cls.server_thread.start()
        cls.base_url = f'http://127.0.0.1:{cls.port}'
        cls.student_one = cls.make_client()
        cls.student_two = cls.make_client()
        for _ in range(80):
            if not cls.server_thread.is_alive():
                raise RuntimeError('Authentication test server exited before startup.')
            try:
                cls.request(cls.student_one, 'GET', '/api/health')
                break
            except (OSError, urllib.error.URLError):
                time.sleep(0.1)
        else:
            cls.server.should_exit = True
            cls.server_thread.join(timeout=5)
            raise RuntimeError('Authentication test server did not start.')

    @classmethod
    def tearDownClass(cls):
        cls.server.should_exit = True
        cls.server_thread.join(timeout=5)
        if cls.server_thread.is_alive():
            raise RuntimeError('Authentication test server did not shut down cleanly.')
        if cls.previous_db_url is None:
            os.environ.pop('DB_URL', None)
        else:
            os.environ['DB_URL'] = cls.previous_db_url
        cls.temp_directory.cleanup()

    @classmethod
    def make_client(cls):
        cookies = http.cookiejar.CookieJar()
        return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

    @classmethod
    def request(cls, client, method, path, body=None):
        data = None if body is None else json.dumps(body).encode('utf-8')
        request = urllib.request.Request(
            f'{cls.base_url}{path}',
            data=data,
            method=method,
            headers={'Content-Type': 'application/json'} if data is not None else {},
        )
        try:
            with client.open(request, timeout=5) as response:
                raw = response.read()
                return response.status, json.loads(raw) if raw else None
        except urllib.error.HTTPError as error:
            raw = error.read()
            return error.code, json.loads(raw) if raw else None

    def test_signup_login_logout_and_isolated_persistent_progress(self):
        status, registered = self.request(self.student_one, 'POST', '/api/auth/register', {
            'full_name': 'Student One',
            'email': 'student.one@example.edu',
            'password': 'strong-pass-one',
        })
        self.assertEqual(status, 201)
        self.assertEqual(registered['user']['name'], 'Student One')
        status, current = self.request(self.student_one, 'GET', '/api/auth/me')
        self.assertEqual(status, 200)
        self.assertEqual(current['user']['email'], 'student.one@example.edu')

        duplicate_status, _ = self.request(self.student_two, 'POST', '/api/auth/register', {
            'full_name': 'Duplicate',
            'email': 'STUDENT.ONE@example.edu',
            'password': 'another-strong-pass',
        })
        self.assertEqual(duplicate_status, 409)

        invalid_email_status, _ = self.request(self.student_two, 'POST', '/api/auth/register', {
            'full_name': 'Invalid Email',
            'email': 'not-an-email',
            'password': 'another-strong-pass',
        })
        short_password_status, _ = self.request(self.student_two, 'POST', '/api/auth/register', {
            'full_name': 'Short Password',
            'email': 'short.password@example.edu',
            'password': 'short',
        })
        self.assertEqual(invalid_email_status, 422)
        self.assertEqual(short_password_status, 422)

        wrong_password_status, wrong_password = self.request(self.student_two, 'POST', '/api/auth/login', {
            'email': 'student.one@example.edu',
            'password': 'incorrect-password',
        })
        self.assertEqual(wrong_password_status, 401)
        self.assertIn('incorrect', wrong_password['detail'].lower())

        status, _ = self.request(self.student_one, 'POST', '/api/progress/lessons/bubble-sort/visit')
        self.assertEqual(status, 204)
        status, _ = self.request(self.student_one, 'POST', '/api/progress/lessons/bubble-sort/activity', {'active_seconds': 90})
        self.assertEqual(status, 204)
        status, _ = self.request(self.student_one, 'POST', '/api/progress/lessons/bubble-sort/complete')
        self.assertEqual(status, 204)
        status, first_progress = self.request(self.student_one, 'GET', '/api/progress')
        self.assertEqual(status, 200)
        self.assertEqual(first_progress['completedLessons'], ['bubble-sort'])
        self.assertEqual(first_progress['totalStudySeconds'], 90)
        self.assertEqual(first_progress['lessons'][0]['visits'], 1)
        self.assertEqual(first_progress['history'][0]['eventType'], 'lesson_completed')

        status, _ = self.request(self.student_one, 'POST', '/api/auth/logout')
        self.assertEqual(status, 200)
        status, _ = self.request(self.student_one, 'GET', '/api/auth/me')
        self.assertEqual(status, 401)
        status, _ = self.request(self.student_one, 'POST', '/api/auth/login', {
            'email': 'student.one@example.edu',
            'password': 'strong-pass-one',
        })
        self.assertEqual(status, 200)
        status, persisted_progress = self.request(self.student_one, 'GET', '/api/progress')
        self.assertEqual(status, 200)
        self.assertEqual(persisted_progress['completedLessons'], ['bubble-sort'])
        self.assertEqual(persisted_progress['totalStudySeconds'], 90)

        second_status, _ = self.request(self.student_two, 'POST', '/api/auth/register', {
            'full_name': 'Student Two',
            'email': 'student.two@example.edu',
            'password': 'strong-pass-two',
        })
        self.assertEqual(second_status, 201)
        status, second_progress = self.request(self.student_two, 'GET', '/api/progress')
        self.assertEqual(status, 200)
        self.assertEqual(second_progress['completedLessons'], [])
        self.assertEqual(second_progress['totalStudySeconds'], 0)
        self.assertEqual(second_progress['history'], [])

        connection = sqlite3.connect(self.database_path)
        try:
            stored_password = connection.execute(
                'SELECT password_hash FROM student_accounts WHERE email = ?',
                ('student.one@example.edu',),
            ).fetchone()[0]
        finally:
            connection.close()
        self.assertNotEqual(stored_password, 'strong-pass-one')
        self.assertTrue(stored_password.startswith('pbkdf2_sha256$'))


if __name__ == '__main__':
    unittest.main()
