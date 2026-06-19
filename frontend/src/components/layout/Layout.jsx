import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

import { Toaster } from 'react-hot-toast';
import { useReminders } from '../../hooks/useReminders';

export default function Layout() {
  // Start reminder polling
  useReminders(30000);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-[var(--color-bg-secondary)] !text-[var(--color-text-primary)] !border !border-[var(--color-border)] !shadow-xl',
          duration: 3000,
        }}
      />
    </div>
  );
}
