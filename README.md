# VizFlow

VizFlow is an interactive DSA learning platform built with React, Vite, and FastAPI. Students can create personal accounts, work through visual lessons, and keep their progress and study history between visits.

## Run locally

Start the backend from the `backend` directory:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to the backend. The backend creates `backend/vizflow.db` on first startup. Set `DB_URL` to a different SQLite URL to use another database. SQLite database files and environment files are ignored by Git.

## Student accounts and progress

- Sign up with a name, a valid email address, and a password of at least eight characters.
- The backend stores salted PBKDF2 password hashes and issues a random, HttpOnly session cookie. Authentication and progress endpoints require that session.
- Lesson completion, visits, and active study time are stored in SQLite and scoped to the authenticated student.
- Faculty sign-in and dashboards are not enabled.

## Tests

Run the DSA visualization tests:

```powershell
cd frontend
npm test
```

Run backend authentication and progress integration tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```
