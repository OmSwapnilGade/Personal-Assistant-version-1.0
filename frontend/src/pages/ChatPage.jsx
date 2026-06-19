import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, Trash2, Star, StarOff, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chatApi } from '../services/api';
import { Spinner } from '../components/ui/Shared';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (location.state?.initialMessage) {
      const msg = location.state.initialMessage;
      window.history.replaceState({}, '');
      setInput(msg);
      // Auto-send after history loads
      setTimeout(() => {
        sendMessage(msg);
      }, 500);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const { data } = await chatApi.history(100);
      setMessages(data);
    } catch { /* Silent */ }
    finally { setHistoryLoading(false); }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    // Optimistic: show user message immediately
    const tempUserMsg = { id: 'temp-user', role: 'user', content, category, is_important: false, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const { data } = await chatApi.sendMessage(content, category);
      // Replace temp message and add assistant response
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'temp-user'),
        data.user_message,
        data.assistant_message,
      ]);
    } catch {
      toast.error('Failed to get AI response');
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'));
    } finally {
      setLoading(false);
    }
  };

  const toggleImportant = async (id, current) => {
    try {
      const { data } = await chatApi.toggleImportant(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_important: data.is_important } : m));
      toast.success(data.is_important ? 'Marked as important' : 'Removed from important');
    } catch { toast.error('Failed to update'); }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all non-important messages?')) return;
    try {
      await chatApi.clear();
      loadHistory();
      toast.success('Chat history cleared');
    } catch { toast.error('Failed to clear'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const categories = [
    { value: 'general', label: '💬 General' },
    { value: 'study', label: '📚 Study' },
    { value: 'coding', label: '💻 Coding' },
    { value: 'debug', label: '🐛 Debug' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" /> AI Assistant
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Powered by Gemini • Study, Code, Debug</p>
        </div>
        <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">How can I help you?</h2>
            <p className="text-[var(--color-text-muted)] text-sm max-w-md mb-8">
              Ask me anything about coding, algorithms, study topics, or debugging. I'm here to help!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {[
                'Explain binary search tree operations',
                'Debug this Python error: IndexError',
                'Time complexity of merge sort',
                'How to prepare for coding interviews?',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="p-3 rounded-xl bg-[var(--color-glass)] border border-[var(--color-border)] text-sm text-left text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] hover:border-[var(--color-accent-primary)]/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex gap-3 animate-slide-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[75%] group ${
                msg.role === 'user'
                  ? 'bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)]/20 rounded-2xl rounded-br-md px-5 py-3'
                  : 'bg-[var(--color-glass)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-5 py-3'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="chat-markdown text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ borderRadius: '12px', fontSize: '0.85em', margin: '0.5em 0' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>{children}</code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                {/* Important toggle */}
                {msg.id && msg.id !== 'temp-user' && (
                  <button
                    onClick={() => toggleImportant(msg.id, msg.is_important)}
                    className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.is_important ? 'text-amber-400 opacity-100' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {msg.is_important ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 items-start animate-slide-in-up">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-[var(--color-glass)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-[var(--color-text-muted)]">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 space-y-3">
        {/* Category tabs */}
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat.value
                  ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-glass-hover)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-5 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-primary)]/50 transition-colors resize-none min-h-[48px] max-h-[150px]"
            style={{ height: 'auto' }}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-[var(--color-accent-primary)] text-white flex items-center justify-center transition-all hover:bg-[var(--color-accent-primary)]/80 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-purple-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
