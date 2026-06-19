import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { reminderApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { EmptyState, LoadingSkeleton } from '../components/ui/Shared';
import { relativeTime, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function RemindersPage() {
  const location = useLocation();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', message: '', remind_at: '', type: 'custom',
  });

  useEffect(() => { loadReminders(); }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const { data } = await reminderApi.list();
      setReminders(data);
    } catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reminderApi.create({
        ...form,
        remind_at: new Date(form.remind_at).toISOString(),
      });
      toast.success('Reminder set! 🔔');
      setShowForm(false);
      setForm({ title: '', message: '', remind_at: '', type: 'custom' });
      loadReminders();
    } catch { toast.error('Failed to create reminder'); }
  };

  const deleteReminder = async (id) => {
    try {
      await reminderApi.delete(id);
      loadReminders();
      toast.success('Reminder deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const isPast = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="w-7 h-7 text-emerald-400" /> Reminders
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{reminders.length} active reminders</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" /> New Reminder
        </button>
      </div>

      {/* Reminders List */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No active reminders"
          description="Set reminders for deadlines, study sessions, or anything important"
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-xl text-sm">Set Reminder</button>
          }
        />
      ) : (
        <div className="space-y-3">
          {reminders.map((rem, i) => {
            const overdue = isPast(rem.remind_at);
            return (
              <div
                key={rem.id}
                className={`glass-card p-5 flex items-center gap-4 group ${overdue ? 'border-red-500/30' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  overdue ? 'bg-red-500/15' : 'bg-emerald-500/15'
                }`}>
                  {overdue ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Clock className="w-5 h-5 text-emerald-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{rem.title}</h3>
                  {rem.message && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{rem.message}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
                      <Clock className="w-3 h-3" />
                      {overdue ? 'Overdue — ' : ''}{relativeTime(rem.remind_at)}
                    </span>
                    <Badge variant={rem.type === 'deadline' ? 'danger' : rem.type === 'daily_summary' ? 'info' : 'default'}>
                      {rem.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Delete */}
                <button onClick={() => deleteReminder(rem.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Reminder">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="e.g., Submit assignment" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Message</label>
            <input type="text" value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="Optional details" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Remind At *</label>
            <input type="datetime-local" value={form.remind_at} onChange={(e) => setForm(f => ({ ...f, remind_at: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer">
              <option value="custom">Custom</option>
              <option value="deadline">Deadline</option>
              <option value="daily_summary">Daily Summary</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm font-medium">Set Reminder</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
