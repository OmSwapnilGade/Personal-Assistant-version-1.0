import axios from 'axios';
const API_BASE = 'https://personal-assistant-version-1-0.onrender.com';
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== TASKS =====
export const taskApi = {
  list: (params = {}) => api.get('/tasks', { params }),
  summary: () => api.get('/tasks/summary'),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ===== TIMETABLE =====
export const timetableApi = {
  getAll: () => api.get('/timetable'),
  getToday: () => api.get('/timetable/today'),
  getDay: (day) => api.get(`/timetable/${day}`),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
};

// ===== ATTENDANCE =====
export const attendanceApi = {
  list: () => api.get('/attendance'),
  warnings: () => api.get('/attendance/warnings'),
  create: (data) => api.post('/attendance', data),
  mark: (id, attended) => api.put(`/attendance/${id}/mark`, { attended }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// ===== CHAT =====
export const chatApi = {
  sendMessage: (content, category = 'general') =>
    api.post('/chat/message', { content, category }),
  history: (limit = 50, skip = 0) =>
    api.get('/chat/history', { params: { limit, skip } }),
  toggleImportant: (id) => api.put(`/chat/${id}/important`),
  clear: () => api.delete('/chat/clear'),
};

// ===== LINKS =====
export const linksApi = {
  list: (params = {}) => api.get('/links', { params }),
  create: (data) => api.post('/links', data),
  update: (id, data) => api.put(`/links/${id}`, data),
  delete: (id) => api.delete(`/links/${id}`),
};

// ===== REMINDERS =====
export const reminderApi = {
  list: () => api.get('/reminders'),
  upcoming: () => api.get('/reminders/upcoming'),
  checkDue: () => api.get('/reminders/check'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  trigger: (id) => api.put(`/reminders/${id}/trigger`),
  delete: (id) => api.delete(`/reminders/${id}`),
};

// ===== COMMAND ROUTER =====
export const commandApi = {
  route: (text) => api.post('/command/route', { text }),
};

export default api;
