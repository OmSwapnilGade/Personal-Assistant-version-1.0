import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu, LayoutDashboard, CheckSquare, Calendar, BarChart3,
  MessageSquare, Link2, Bell, Sparkles
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';

const ICON_MAP = {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  MessageSquare, Link2, Bell,
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 p-2 sm:p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-glass-hover)] transition-all shadow-lg shadow-black/20 backdrop-blur-md"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-[72px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col items-center pb-6 pt-24 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="mb-8 relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `tooltip flex items-center justify-center w-full aspect-square rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] shadow-lg shadow-purple-500/10'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-hover)]'
                  }`
                }
                data-tooltip={item.label}
              >
                {Icon && <Icon className="w-5 h-5" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-4 border-t border-[var(--color-border)] w-full px-3">
          <div className="w-full aspect-square rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 text-emerald-400 text-sm font-bold">
            SA
          </div>
        </div>
      </aside>
    </>
  );
}
