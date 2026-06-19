import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar } from 'lucide-react';
import { getGreeting } from '../utils/helpers';
import CommandBar from '../components/layout/CommandBar';

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/2 left-1/4 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 mix-blend-screen animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-cyan-600/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 mix-blend-screen animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="z-10 text-center flex flex-col items-center">
        {/* Floating Greeting Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[var(--color-text-secondary)] text-xs sm:text-sm font-medium tracking-widest uppercase mb-6 sm:mb-8 shadow-2xl backdrop-blur-md animate-slide-in-up">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>{getGreeting()}</span>
        </div>

        {/* Main Welcome Typography */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-3 sm:mb-4 animate-scale-in px-4 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg leading-tight">
            Welcome Back, Om
          </span>
        </h1>

        {/* Minimal Subtitle */}
        <p className="mt-3 sm:mt-6 text-base sm:text-lg md:text-xl text-[var(--color-text-muted)] font-light tracking-wide max-w-lg px-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          Your personal workspace is ready. What would you like to focus on today?
        </p>

        <CommandBar />

        {/* Dynamic Date & Time Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 mt-10 sm:mt-16 px-6 sm:px-8 py-3 sm:py-4 rounded-3xl sm:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl shadow-2xl animate-slide-in-up w-full max-w-[280px] sm:max-w-md sm:w-auto" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-base sm:text-xl font-light tracking-widest text-[var(--color-text-primary)]">{timeString}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-full h-[1px] sm:hidden bg-white/10 my-1" />
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-base sm:text-xl font-light tracking-widest text-[var(--color-text-primary)]">{dateString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
