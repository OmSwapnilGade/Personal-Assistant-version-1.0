export const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-500/15',
  medium: 'text-amber-400 bg-amber-500/15',
  low: 'text-emerald-400 bg-emerald-500/15',
};

export const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-500/15',
  in_progress: 'text-cyan-400 bg-cyan-500/15',
  completed: 'text-emerald-400 bg-emerald-500/15',
};

export const CATEGORY_COLORS = {
  cp: 'text-purple-400 bg-purple-500/15',
  dev: 'text-blue-400 bg-blue-500/15',
  college: 'text-amber-400 bg-amber-500/15',
  other: 'text-gray-400 bg-gray-500/15',
};

export const CLASS_TYPE_COLORS = {
  lecture: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  lab: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  tutorial: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
};

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/schedule', label: 'Schedule', icon: 'Calendar' },
  { path: '/attendance', label: 'Attendance', icon: 'BarChart3' },
  { path: '/chat', label: 'AI Chat', icon: 'MessageSquare' },
  { path: '/links', label: 'Links', icon: 'Link2' },
  { path: '/reminders', label: 'Reminders', icon: 'Bell' },
];
