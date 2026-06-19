import React, { useEffect, useState } from 'react';
import { BarChart3, Plus, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '../services/api';
import Modal from '../components/ui/Modal';
import CircularProgress from '../components/ui/CircularProgress';
import { EmptyState, LoadingSkeleton } from '../components/ui/Shared';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', attended: 0, total: 0 });

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await attendanceApi.list();
      setSubjects(data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.create({ ...form, attended: Number(form.attended), total: Number(form.total) });
      toast.success('Subject added!');
      setShowForm(false);
      setForm({ subject: '', attended: 0, total: 0 });
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add subject');
    }
  };

  const markAttendance = async (id, attended) => {
    try {
      await attendanceApi.mark(id, attended);
      loadSubjects();
      toast.success(attended ? 'Marked present ✅' : 'Marked absent ❌');
    } catch { toast.error('Failed to mark'); }
  };

  const deleteSubject = async (id) => {
    try {
      await attendanceApi.delete(id);
      loadSubjects();
      toast.success('Subject removed');
    } catch { toast.error('Failed to delete'); }
  };

  // Summary stats
  const totalSubjects = subjects.length;
  const dangerCount = subjects.filter(s => s.status === 'danger').length;
  const avgPercentage = totalSubjects > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.percentage, 0) / totalSubjects)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-emerald-400" /> Attendance Tracker
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Maintain 75% minimum attendance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Summary Cards */}
      {totalSubjects > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{avgPercentage}%</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Average Attendance</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{totalSubjects}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Total Subjects</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className={`text-3xl font-bold ${dangerCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{dangerCount}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Below 75%</p>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {dangerCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-in-up">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            <strong>{dangerCount} subject{dangerCount > 1 ? 's' : ''}</strong> below 75% attendance threshold. Attend more classes to avoid debarment!
          </p>
        </div>
      )}

      {/* Subject Cards */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No subjects added"
          description="Add your subjects to start tracking attendance"
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-xl text-sm">Add Subject</button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject, i) => (
            <div
              key={subject.id}
              className={`glass-card p-6 group ${subject.status === 'danger' ? 'border-red-500/30' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-5">
                {/* Circular Progress */}
                <CircularProgress percentage={subject.percentage} size={80} strokeWidth={6} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg truncate">{subject.subject}</h3>
                    <button onClick={() => deleteSubject(subject.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {subject.attended}/{subject.total} classes attended
                  </p>
                  {subject.status === 'danger' && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Need {subject.classes_needed} consecutive classes to reach 75%
                    </p>
                  )}
                  {subject.status === 'warning' && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚠️ Close to threshold — attend regularly
                    </p>
                  )}

                  {/* Mark buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => markAttendance(subject.id, true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" /> Present
                    </button>
                    <button
                      onClick={() => markAttendance(subject.id, false)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" /> Absent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Subject">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Subject Name *</label>
            <input type="text" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="e.g., Data Structures" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Classes Attended</label>
              <input type="number" value={form.attended} onChange={(e) => setForm(f => ({ ...f, attended: e.target.value }))} min="0"
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Total Classes</label>
              <input type="number" value={form.total} onChange={(e) => setForm(f => ({ ...f, total: e.target.value }))} min="0"
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm font-medium">Add Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
