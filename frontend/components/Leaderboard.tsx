import React from 'react';
import { LeaderboardEntry } from '@/types/strapi';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="flex-1 raised p-6 rounded-2xl flex flex-col">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-amber mb-8 font-mono font-bold">Top 5 Records</h2>
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-muted text-xs italic opacity-40">Scanning...</div>
        ) : (
          entries.map((entry, index) => (
            <div key={index} className="flex flex-col border-b border-white/5 pb-3 last:border-0 group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-text group-hover:text-amber transition-colors truncate pr-2">
                   {entry.playerName}
                </span>
                <span className="text-xs font-mono font-bold text-amber/80">{entry.score}</span>
              </div>
              <span className="text-[9px] text-muted font-mono tracking-wider opacity-60 italic">{entry.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
