import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import SchedulePage from './pages/SchedulePage';
import AttendancePage from './pages/AttendancePage';
import ChatPage from './pages/ChatPage';
import LinksPage from './pages/LinksPage';
import RemindersPage from './pages/RemindersPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="links" element={<LinksPage />} />
          <Route path="reminders" element={<RemindersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
