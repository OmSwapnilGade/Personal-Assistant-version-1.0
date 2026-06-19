import { useEffect, useRef, useCallback } from 'react';
import { reminderApi } from '../services/api';

/**
 * Hook that polls for due reminders and triggers browser notifications.
 */
export function useReminders(intervalMs = 30000) {
  const intervalRef = useRef(null);

  const checkReminders = useCallback(async () => {
    try {
      const { data: dueReminders } = await reminderApi.checkDue();
      
      for (const reminder of dueReminders) {
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(`🔔 ${reminder.title}`, {
            body: reminder.message || 'Reminder is due!',
            icon: '/vite.svg',
            tag: reminder.id, // prevents duplicate notifications
          });
        }
        
        // Mark as triggered
        await reminderApi.trigger(reminder.id);
      }
    } catch {
      // Silently fail — don't break the app for reminder checks
    }
  }, []);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial check
    checkReminders();

    // Poll periodically
    intervalRef.current = setInterval(checkReminders, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkReminders, intervalMs]);

  return { checkReminders };
}
