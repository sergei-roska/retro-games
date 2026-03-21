import React from 'react';

interface Control {
  key: string;
  action: string;
}

interface GameInstructionsProps {
  controls?: Control[];
}

const DEFAULT_CONTROLS = [
  { key: '← / →', action: 'Move' },
  { key: '↑ / Space', action: 'Rotate' },
  { key: '↓', action: 'Soft Drop' },
  { key: 'P / Esc', action: 'Pause' },
];

export default function GameInstructions({ controls = DEFAULT_CONTROLS }: GameInstructionsProps) {
  return (
    <div className="w-full max-w-[240px] raised p-8 rounded-3xl flex flex-col">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted mb-8 font-mono font-bold opacity-60">Protocol_Manual</h2>
      <div className="space-y-6">
        {controls.map((control, index) => (
          <div key={index} className="flex flex-col border-b border-white/5 pb-4 last:border-0 group">
            <span className="text-[10px] uppercase tracking-widest text-muted font-black mb-1.5 opacity-40 group-hover:text-amber transition-colors">
              {control.action}
            </span>
            <span className="text-sm font-mono font-bold text-text group-hover:translate-x-1 transition-transform inline-block tracking-tight">
              {control.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
