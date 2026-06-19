# 🎓 Student Developer AI Workspace Assistant

A unified AI-powered productivity dashboard for student developers. Combines task management, college timetable, attendance tracking, AI chat assistant, quick links, reminders, and voice commands into one sleek workspace.

> *Think of it as: Notion + ChatGPT + Google Calendar + CP helper — built specifically for student devs.*

---

## ✨ Features

| Feature | Description | AI? |
|---------|-------------|-----|
| **📋 Task Manager** | CRUD with priority, status, tags, deadlines, filters | ❌ |
| **📅 Timetable** | Weekly schedule, day views, class types | ❌ |
| **📊 Attendance** | Per-subject tracking, 75% warnings, mark present/absent | ❌ |
| **🤖 AI Chat** | Gemini-powered study/coding/debug assistant with markdown | ✅ |
| **🔗 Quick Links** | Categorized bookmarks (CP, Dev, College) with search | ❌ |
| **🔔 Reminders** | Deadline alerts with browser notifications | ❌ |
| **🎤 Voice Input** | Push-to-talk browser speech recognition | ❌ |
| **⌨️ Command Bar** | Unified input with smart routing (Ctrl+K) | Hybrid |

## 🛠️ Tech Stack

- **Frontend**: React 19 + Tailwind CSS v4 + Vite
- **Backend**: FastAPI (Python) + Motor (async MongoDB)
- **Database**: MongoDB (local or Atlas free tier)
- **AI**: Google Gemini API (free tier)
- **Voice**: Web Speech API (browser-native)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **MongoDB** (local install or [Atlas free tier](https://www.mongodb.com/atlas))
- **Gemini API Key** ([Get free](https://aistudio.google.com/apikey))

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your MongoDB URI and Gemini API key
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_workspace
GEMINI_API_KEY=your_key_here
```

### 2. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `https://personal-assistant-version-1-0.onrender.com`
API docs at `https://personal-assistant-version-1-0.onrender.com/docs`

### 3. Setup & Start Frontend

```bash
cd frontend

# Install dependencies (already done if you cloned)
npm install

# Start dev server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🧠 Command Router

The command bar (Ctrl+K) intelligently routes your input:

| You type... | Routed to | AI used? |
|---|---|---|
| "add task submit assignment" | Task Manager → create | ❌ |
| "show my tasks" | Task Manager → list | ❌ |
| "classes today" | Timetable → today view | ❌ |
| "mark present DSA" | Attendance → mark | ❌ |
| "explain binary search" | AI Chat → Gemini | ✅ |
| "debug this Python error" | AI Chat → Gemini | ✅ |

**Rule**: Only unmatched queries go to Gemini. This keeps API usage minimal.

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry + CORS
│   │   ├── config.py         # Settings from .env
│   │   ├── database.py       # MongoDB connection
│   │   ├── models/           # Pydantic schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Command router + Gemini
│   │   └── utils/            # Helpers
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # 7 page components
│   │   ├── components/       # Layout + UI primitives
│   │   ├── hooks/            # Voice, API, reminders
│   │   ├── services/         # API client (Axios)
│   │   └── utils/            # Constants + helpers
│   ├── index.html
│   └── vite.config.js
```

---

## 🔑 API Endpoints

| Module | Endpoints |
|---|---|
| Tasks | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/{id}`, `GET /api/tasks/summary` |
| Timetable | `GET /api/timetable`, `GET /api/timetable/today`, `POST/PUT/DELETE /api/timetable/{id}` |
| Attendance | `GET /api/attendance`, `PUT /api/attendance/{id}/mark`, `GET /api/attendance/warnings` |
| Chat | `POST /api/chat/message`, `GET /api/chat/history`, `DELETE /api/chat/clear` |
| Links | `GET/POST /api/links`, `PUT/DELETE /api/links/{id}` |
| Reminders | `GET /api/reminders`, `GET /api/reminders/upcoming`, `POST/PUT/DELETE /api/reminders/{id}` |
| Command | `POST /api/command/route` |

---

## 📝 License

MIT — built for personal use by a student developer.
