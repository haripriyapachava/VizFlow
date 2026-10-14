from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)


class StudentProfile(Base):
    __tablename__ = 'student_profiles'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    cohort = Column(String(100), nullable=True)
    status = Column(String(50), default='active')
    user = relationship('User')


class FacultyProfile(Base):
    __tablename__ = 'faculty_profiles'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    user = relationship('User')


class ClassRoom(Base):
    __tablename__ = 'classes'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    term = Column(String(50), nullable=True)


class Enrollment(Base):
    __tablename__ = 'enrollments'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)


class DSATopic(Base):
    __tablename__ = 'topics'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    module_order = Column(Integer, nullable=False)


class Lesson(Base):
    __tablename__ = 'lessons'
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey('topics.id'), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    difficulty = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)


class LearningSession(Base):
    __tablename__ = 'learning_sessions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    active_seconds = Column(Integer, default=0)
    status = Column(String(50), default='active')


class LearningEvent(Base):
    __tablename__ = 'learning_events'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('learning_sessions.id'), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_time = Column(DateTime, nullable=False)
    metadata = Column(Text, nullable=True)


class LessonProgress(Base):
    __tablename__ = 'lesson_progress'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    completion_percent = Column(Float, default=0)
    completed = Column(Boolean, default=False)
    last_accessed = Column(DateTime, nullable=True)


class QuizQuestion(Base):
    __tablename__ = 'quiz_questions'
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey('topics.id'), nullable=False)
    prompt = Column(Text, nullable=False)
    answer = Column(String(255), nullable=False)


class QuizAttempt(Base):
    __tablename__ = 'quiz_attempts'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('quiz_questions.id'), nullable=False)
    score = Column(Integer, default=0)
    attempted_at = Column(DateTime, nullable=True)


class CodingExercise(Base):
    __tablename__ = 'coding_exercises'
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    difficulty = Column(String(50), nullable=False)


class CodingSubmission(Base):
    __tablename__ = 'coding_submissions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    exercise_id = Column(Integer, ForeignKey('coding_exercises.id'), nullable=False)
    status = Column(String(50), default='pending')
    code = Column(Text, nullable=True)
    score = Column(Float, default=0)
    submitted_at = Column(DateTime, nullable=True)
