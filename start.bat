@echo off
echo Starting Student Developer AI Workspace Assistant...

:: Check if backend venv exists, create if not
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing backend dependencies...
    pip install -r requirements.txt
    cd ..
)

:: Start Backend
echo Starting Backend Server on port 8000...
start "Backend Server" cmd /c "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

:: Start Frontend
echo Starting Frontend Server...
start "Frontend Server" cmd /c "cd frontend && npm install && npm run dev"

echo Both servers are starting in separate windows.
echo Frontend will be available at http://localhost:5173
echo Backend API available at http://localhost:8000
