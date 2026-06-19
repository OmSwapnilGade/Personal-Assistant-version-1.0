import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link2, Plus, Trash2, Edit3, Search, ExternalLink } from 'lucide-react';
import { linksApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { EmptyState, LoadingSkeleton } from '../components/ui/Shared';
import { CATEGORY_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function LinksPage() {
  const location = useLocation();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [filter, setFilter] = useState({ category: '', search: '' });
  const [form, setForm] = useState({ title: '', url: '', category: 'other', description: '' });

  useEffect(() => { loadLinks(); }, [filter.category]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.search) params.search = filter.search;
      const { data } = await linksApi.list(params);
      setLinks(data);
    } catch { toast.error('Failed to load links'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await linksApi.update(editingLink.id, form);
        toast.success('Link updated!');
      } else {
        await linksApi.create(form);
        toast.success('Link saved!');
      }
      closeForm();
      loadLinks();
    } catch { toast.error('Failed to save link'); }
  };

  const deleteLink = async (id) => {
    try {
      await linksApi.delete(id);
      loadLinks();
      toast.success('Link deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (link) => {
    setEditingLink(link);
    setForm({ title: link.title, url: link.url, category: link.category, description: link.description || '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLink(null);
    setForm({ title: '', url: '', category: 'other', description: '' });
  };

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  const filtered = links.filter(l =>
    !filter.search || l.title.toLowerCase().includes(filter.search.toLowerCase()) ||
    l.url.toLowerCase().includes(filter.search.toLowerCase())
  );

  const categories = [
    { value: '', label: 'All' },
    { value: 'cp', label: '🏆 CP' },
    { value: 'dev', label: '💻 Dev' },
    { value: 'college', label: '🎓 College' },
    { value: 'other', label: '📌 Other' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Link2 className="w-7 h-7 text-blue-400" /> Quick Links
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{links.length} bookmarks saved</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-medium shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <input type="text" placeholder="Search links..." value={filter.search}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
            className="bg-transparent outline-none text-sm flex-1 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button key={cat.value} onClick={() => setFilter(f => ({ ...f, category: cat.value }))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter.category === cat.value
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Links Grid */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔗" title="No links found" description="Save your favorite websites for quick access" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((link, i) => (
            <div key={link.id} className="glass-card p-5 group flex flex-col" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 text-lg">
                    🌐
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{link.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{getDomain(link.url)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(link)} className="p-1.5 rounded-lg hover:bg-[var(--color-glass-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-secondary)]">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {link.description && <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">{link.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                <Badge variant={link.category === 'cp' ? 'purple' : link.category === 'dev' ? 'info' : link.category === 'college' ? 'warning' : 'default'}>
                  {link.category}
                </Badge>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--color-accent-secondary)] hover:text-[var(--color-accent-primary)] transition-colors font-medium">
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editingLink ? 'Edit Link' : 'Add Link'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="e.g., LeetCode" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">URL *</label>
            <input type="url" value={form.url} onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))} required
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer">
              <option value="cp">🏆 Competitive Programming</option>
              <option value="dev">💻 Development</option>
              <option value="college">🎓 College</option>
              <option value="other">📌 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]/50" placeholder="Optional description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm font-medium">{editingLink ? 'Update' : 'Save'} Link</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
