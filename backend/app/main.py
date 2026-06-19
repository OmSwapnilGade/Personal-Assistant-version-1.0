from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_db, close_db
from .routes import tasks, timetable, attendance, chat, links, reminders, command


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Student AI Workspace",
    description="AI-powered productivity system for student developers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://personal-assistant-version-1-0.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(timetable.router, prefix="/api/timetable", tags=["Timetable"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(links.router, prefix="/api/links", tags=["Links"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["Reminders"])
app.include_router(command.router, prefix="/api/command", tags=["Command"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "Student AI Workspace"}
