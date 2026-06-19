'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, ArrowUpRight, Sparkles } from 'lucide-react';

export default function TrialCountdownBar() {
  const { currentUser, trialSecondsRemaining, setView } = useApp();

  // If no user is logged in, or user isn't in test mode, hide the countdown
  if (!currentUser || currentUser.plan !== 'Testador' || trialSecondsRemaining <= 0) {
    return null;
  }

  // Calculate hours, minutes, seconds from seconds
  const hours = Math.floor(trialSecondsRemaining / 3600);
  const minutes = Math.floor((trialSecondsRemaining % 3600) / 60);
  const seconds = trialSecondsRemaining % 60;

  // Format with leading zeros
  const formatTime = (val: number) => String(val).padStart(2, '0');

  return (
    <div
      id="trial-countdown-bar"
      className="fixed bottom-6 left-6 z-40 bg-[#161616]/95 backdrop-blur-md border border-white/10 rounded-2xl py-2.5 px-4 shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex items-center gap-3 animate-pulse border-amber-500/30 text-white"
    >
      <div className="bg-gradient-to-tr from-amber-500 to-[#f65c41] p-1.5 rounded-lg shrink-0">
        <Clock className="w-4 h-4 text-white" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f65c41] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            Período de Teste Liberado (Gold)
          </span>
        </div>
        <div className="text-sm font-black text-gray-100 flex items-baseline gap-1 mt-0.5">
          <span>{formatTime(hours)}</span>
          <span className="text-gray-500 font-normal text-xs">h</span>
          <span>:</span>
          <span>{formatTime(minutes)}</span>
          <span className="text-gray-500 font-normal text-xs">m</span>
          <span>:</span>
          <span>{formatTime(seconds)}</span>
          <span className="text-gray-500 font-normal text-xs">s</span>
        </div>
      </div>

      <button
        onClick={() => setView('plans')}
        className="ml-2 bg-gradient-to-r from-amber-500 to-[#f65c41] hover:from-amber-600 hover:to-[#ff6c54] text-white font-bold text-[9px] uppercase tracking-wider px-2 py-1.5 rounded-lg transition-all flex items-center gap-0.5 cursor-pointer"
      >
        Ativar Completo
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}
