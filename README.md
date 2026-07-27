# 🎯 AI Interviewer Pro

An AI-powered interview preparation platform that helps users practice technical and HR interviews through personalized questions, AI-based evaluation, and detailed performance reports.

---

## 📖 Project Description

AI Interviewer Pro is a full-stack web application that simulates real interview experiences. Users can upload their resumes, receive AI-generated interview questions based on their skills, answer them through text or voice, and get instant feedback with scores and suggestions for improvement.

This project is designed for students, job seekers, and professionals preparing for interviews.

---

# ✨ Features

- 🔐 User Authentication (Sign Up & Login)
- 📄 Resume Upload
- 🤖 AI-Generated Interview Questions
- 🎤 Voice Answer Recording
- 📝 Text-Based Interview Answers
- 📊 AI Performance Evaluation
- 📈 Overall Interview Score
- 💬 Detailed Feedback
- 📁 Interview History
- 📱 Responsive UI
- ⚡ FastAPI REST API
- 🗄 PostgreSQL Database

---

# 🛠 Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- FastAPI
- Python

### Database
- PostgreSQL
- SQLAlchemy
- Alembic

### AI
- OpenAI API / Gemini API
- Sentence Transformers

### Tools
- Git
- GitHub
- VS Code

---

# 📂 Project Structure

```
AI-Interviewer-Pro/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── database/
│   ├── main.py
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/manu-Manohar1/AI-Interviewer-Pro.git
```

Go into the project

```bash
cd AI-Interviewer-Pro
```

---

# ⚙ Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
DATABASE_URL=your_database_url

OPENAI_API_KEY=your_api_key

GEMINI_API_KEY=your_api_key
```

**⚠ Never upload your real API keys to GitHub.**

---

# 📷 Screenshots

Add screenshots here after deployment.

Example:

- Login Page
- Dashboard
- Resume Upload
- Interview Screen
- Performance Report

---

# 🌐 Deployment

Frontend:
- Vercel

Backend:
- Render

Database:
- Neon PostgreSQL

---

# 🔮 Future Improvements

- Live AI Interview Avatar
- Video Interview Support
- Multi-language Interviews
- Company-Specific Interview Mode
- Coding Interview Module
- AI Resume Builder
- Mock HR Interview
- Leaderboard
- Interview Analytics Dashboard
- Email Reports
- Dark Mode

---

# 🤝 Contributing

Contributions are welcome.

Fork the repository.

Create a new branch.

Commit your changes.

Submit a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Tirumani Manohar**

B.Tech Artificial Intelligence & Machine Learning

GitHub:
https://github.com/manu-Manohar1

LinkedIn:
(Add your LinkedIn profile here)

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

Thank you!
