'use client';

import React, { useState } from 'react';

interface GameOverModalProps {
  score: number;
  onSubmit: (name: string) => Promise<boolean>;
  onRestart: () => void;
  onStay?: () => void;
  onExit?: () => void;
}

export default function GameOverModal({ score, onSubmit, onRestart, onStay, onExit }: GameOverModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2 || trimmedName.length > 16) {
      setError('Name must be 2-16 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await onSubmit(trimmedName);
    
    if (success) {
      setSubmitted(true);
    } else {
      setError('Upload Failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-[400px] raised p-10 rounded-3xl relative overflow-hidden">
        {/* Grainy texture overlay local */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
        
        <h2 className="text-3xl font-black text-text mb-2 text-center uppercase tracking-tighter">Mission End</h2>
        <div className="text-amber text-xs text-center mb-10 font-mono font-bold uppercase tracking-[0.3em]">
          Accumulated: <span className="text-text">{score}</span>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label htmlFor="playerName" className="block text-[10px] uppercase text-muted font-mono font-bold tracking-[0.2em] px-1">
                Operator ID
              </label>
              <div className="inset p-1 rounded-2xl">
                <input
                  id="playerName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="IDCODE_001"
                  className="w-full bg-transparent p-4 text-text placeholder:text-muted/20 focus:outline-none font-mono font-bold text-lg"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-[10px] text-amber font-mono font-bold uppercase text-center tracking-widest">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full raised hover:brightness-110 text-text py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : 'Upload Data'}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 relative z-10 flex flex-col gap-8">
            <div className="p-4 inset rounded-2xl inline-block px-10">
               <p className="text-green font-mono font-black text-xs uppercase tracking-widest">Sync Complete</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onRestart}
                className="w-full raised hover:brightness-110 text-text py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98]"
              >
                New Session
              </button>
              
              {onStay && (
                <button
                  onClick={onStay}
                  className="w-full text-muted hover:text-text py-3 font-bold uppercase tracking-[0.2em] text-[10px] transition-colors"
                >
                  View Trace Output
                </button>
              )}
            </div>
          </div>
        )}

        {/* Global Actions */}
        <div className="mt-6 flex flex-col items-center gap-2 relative z-10">
          {!submitted && (
            <button
              onClick={onRestart}
              className="w-full text-muted/60 py-2 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-text transition-colors"
            >
              Discard Sequence
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="text-muted/40 hover:text-red/60 py-2 font-bold uppercase tracking-[0.2em] text-[9px] transition-colors flex items-center gap-2"
            >
              <span>← Terminate Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
