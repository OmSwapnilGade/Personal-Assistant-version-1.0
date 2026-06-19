import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';
import { timetableApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { EmptyState, LoadingSkeleton } from '../components/ui/Shared';
import { DAYS_OF_WEEK, DAY_LABELS, CLASS_TYPE_COLORS } from '../utils/constants';
import { formatTime, getTodayName } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(getTodayName());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day: getTodayName(), subject: '', start_time: '09:00', end_time: '10:00', room: '', type: 'lecture',
  });

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const { data } = await timetableApi.getAll();
      setClasses(data);
    } catch { toast.error('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await timetableApi.create(form);
      toast.success('Class added!');
      setShowForm(false);
      setForm({ day: selectedDay, subject: '', start_time: '09:00', end_time: '10:00', room: '', type: 'lecture' });
      loadClasses();
    } catch { toast.error('Failed to add class'); }
  };

  const deleteClass = async (id) => {
    try {
      await timetableApi.delete(id);
      loadClasses();
      toast.success('Class removed');
    } catch { toast.error('Failed to delete'); }
  };

  const dayClasses = classes.filter(c => c.day === selectedDay);
  const today = getTodayName();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Calendar className="w-7 h-7 text-cyan-400" /> Weekly Schedule
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{classes.length} classes total</p>
        </div>
        <button
          onClick={() => { setForm(f => ({ ...f, day: selectedDay })); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
              selectedDay === day
                ? 'bg-[var(--color-accent-primary)] text-white shadow-lg shadow-purple-500/20'
                : day === today
                  ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
            }`}
          >
            {DAY_LABELS[day]}
            {day === today && selectedDay !== day && <span className="ml-1 text-xs">•</span>}
          </button>
        ))}
      </div>

      {/* Classes for selected day */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : dayClasses.length === 0 ? (
        <EmptyState
          icon="📅"
          title={`No classes on ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}`}
          description="Add classes to build your timetable"
        />
      ) : (
        <div className="space-y-3">
          {dayClasses.map((cls, i) => {
            const colorSet = CLASS_TYPE_COLORS[cls.type] || CLASS_TYPE_COLORS.lecture;
            return (
              <div
                key={cls.id}
                className={`glass-card p-5 flex items-center gap-4 border-l-4 group ${colorSet.split(' ')[2] || 'border-blue-500/30'}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Time */}
                <div className="text-center shrink-0 w-20">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{formatTime(cls.start_time)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{formatTime(cls.end_time)}</p>
                </div>

                <div className="w-px h-10 bg-[var(--color-border)]" />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{cls.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant={cls.type === 'lab' ? 'success' : cls.type === 'tutorial' ? 'purple' : 'info'}>
                      {cls.type}
                    </Badge>
                    {cls.room && (
                      <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        📍 {cls.room}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Class">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Subject *</label>
            <input type="text" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="e.g., Data Structures" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Day</label>
            <select value={form.day} onChange={(e) => setForm(f => ({ ...f, day: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer">
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Start Time</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">End Time</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Room</label>
              <input type="text" value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none" placeholder="e.g., Room 301" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer">
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm font-medium">Add Class</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
