import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Command } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { commandApi, chatApi, taskApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function CommandBar() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoice();

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Keyboard shortcut: Ctrl+K to focus command bar
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setIsProcessing(true);
    try {
      // Route the command
      const { data: route } = await commandApi.route(text);

      if (route.requires_ai) {
        // Navigate to chat and the chat page will handle the message
        navigate('/chat', { state: { initialMessage: text } });
      } else {
        // Handle local commands
        handleLocalAction(route.action, text);
      }
    } catch (err) {
      toast.error('Failed to process command');
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  };

  const handleLocalAction = (action, text) => {
    switch (action) {
      case 'task_create':
        navigate('/tasks', { state: { openCreate: true, prefillTitle: text.replace(/^(add|create|new|make)\s+(a\s+)?task\s*/i, '') } });
        toast.success('Opening task creator...');
        break;
      case 'task_list':
        navigate('/tasks');
        toast.success('Showing tasks');
        break;
      case 'timetable_query':
      case 'timetable_add':
        navigate('/schedule');
        toast.success('Opening schedule');
        break;
      case 'attendance_mark':
      case 'attendance_check':
        navigate('/attendance');
        toast.success('Opening attendance');
        break;
      case 'link_add':
      case 'link_list':
        navigate('/links');
        toast.success('Opening links');
        break;
      case 'reminder_create':
      case 'reminder_list':
        navigate('/reminders');
        toast.success('Opening reminders');
        break;
      default:
        navigate('/chat', { state: { initialMessage: text } });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 z-30 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full relative px-2 sm:px-0"
      >
        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-2xl shadow-black/40 hover:border-[var(--color-accent-primary)]/30 transition-all focus-within:border-[var(--color-accent-primary)]/50 focus-within:shadow-purple-500/10 w-full max-w-[95%] sm:max-w-full mx-auto">
          <Command className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-muted)] shrink-0 hidden sm:block" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or ask AI..."
            className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none text-sm sm:text-base w-full min-w-0"
            disabled={isProcessing}
          />

          {/* Voice button */}
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse-glow'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-hover)]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-accent-primary)] text-white flex items-center justify-center transition-all hover:bg-[var(--color-accent-primary)]/80 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
