import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Filter, CheckSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { taskApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { EmptyState, LoadingSkeleton } from '../components/ui/Shared';
import { formatDate, relativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', status: 'pending', deadline: '', tags: '',
  });

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
      if (location.state?.prefillTitle) {
        setForm(f => ({ ...f, title: location.state.prefillTitle }));
      }
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await taskApi.list(params);
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      deadline: form.deadline || null,
    };
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        toast.success('Task updated!');
      } else {
        await taskApi.create(payload);
        toast.success('Task created!');
      }
      closeForm();
      loadTasks();
    } catch { toast.error('Failed to save task'); }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskApi.update(task.id, { status: newStatus });
      loadTasks();
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task reopened');
    } catch { toast.error('Failed to update'); }
  };

  const deleteTask = async (id) => {
    try {
      await taskApi.delete(id);
      loadTasks();
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      tags: (task.tags || []).join(', '),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'medium', status: 'pending', deadline: '', tags: '' });
  };

  const filtered = tasks.filter(t =>
    !filters.search || t.title.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-amber-400" /> Task Manager
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            {tasks.filter(t => t.status !== 'completed').length} active tasks
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="bg-transparent outline-none text-sm flex-1 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
          className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks found"
          description="Create your first task to get started"
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-xl text-sm hover:bg-[var(--color-accent-primary)]/80 transition-colors">
              Create Task
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <div
              key={task.id}
              className={`glass-card p-5 flex items-start gap-4 group ${task.status === 'completed' ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {/* Check button */}
              <button
                onClick={() => toggleStatus(task)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]'
                }`}
              >
                {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant={task.priority}>{task.priority}</Badge>
                  <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                  {task.deadline && (
                    <span className="text-xs text-[var(--color-text-muted)]">📅 {relativeTime(task.deadline)}</span>
                  )}
                  {task.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(task)} className="p-2 rounded-lg hover:bg-[var(--color-glass-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-secondary)] transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50 transition-colors"
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50 transition-colors resize-none"
              placeholder="Add details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50 transition-colors"
              placeholder="e.g., college, project, urgent"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm font-medium">
              {editingTask ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
