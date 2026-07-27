# AI Interviewer Pro

## Project structure

### Frontend
- frontend/app/
  - app/layout.js
  - app/page.js
  - app/globals.css
- frontend/package.json
- frontend/tailwind.config.js
- frontend/postcss.config.js

### Backend
- backend/app/
  - app/main.py
  - app/database.py
- backend/alembic/
  - alembic/env.py
- backend/alembic.ini
- backend/requirements.txt

## Run locally

### Backend
1. cd backend
2. pip install -r requirements.txt
3. uvicorn app.main:app --reload

### Frontend
1. cd frontend
2. npm install
3. npm run dev

The frontend page calls the backend endpoint at /hello.
