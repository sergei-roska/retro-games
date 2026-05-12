'use client';

import React, { useEffect, useState } from 'react';

const MESSAGES = [
  '[OK] CALIBRATING_MOTORS',
  '[OK] GRID_SYNC_STABLE',
  '[INFO] NEON_OVERDRIVE_READY',
  '[WARN] LUBRICATION_NOMINAL',
  '[ERROR] BUFFER_OVERFLOW_DETECTED',
  '[OK] CORE_INITIALIZED',
  '[INFO] SCANNING_FOR_FIREWALLS',
  '[ERROR] PACKET_LOSS_CRITICAL',
  '[OK] HAPTIC_SYNC_ENABLED',
  '[WARN] SYSTEM_TEMPERATURE_OPTIMAL',
  '[INFO] OVERCLOCK_POTENTIAL_HIGH',
  '[ERROR] NEURAL_LINK_ERR_404',
  '[OK] NEURAL_LINK_ESTABLISHED',
  '[INFO] PRE-FLIGHT_DIAGNOSTICS_DONE',
  '[INFO] RECOMRING_BIT_STREAM',
  '[WARN] FRAGMENTATION_LEVEL_LOW',
  '[OK] PARITY_CHECK_COMPLETE',
  '[INFO] HANDSHAKE_PROTOCOL_READY',
  '[ERROR] UNKNOWN_SUBSYSTEM_INTERRUPT',
  '[OK] ENCRYPTION_KEYS_ROTATED',
];

const SUBSYSTEMS = [
  { name: 'Relay_Core', version: 'v2.0.42' },
  { name: 'Neural_Sync', version: 'v1.4.1' },
  { name: 'Ghost_Protocol', version: 'v0.9.9' },
];

export default function SystemDiagnostic() {
  const [logs, setLogs] = useState<string[]>(MESSAGES.slice(0, 5));
  const [subsystemIndex, setSubsystemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const nextMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        return [...prev.slice(1), nextMsg];
      });
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setSubsystemIndex(idx => (idx + 1) % SUBSYSTEMS.length);
          setLogs(oldLogs => [...oldLogs.slice(1), `[OK] ${SUBSYSTEMS[subsystemIndex].name.toUpperCase()}_STABILIZED`]);
          return 0;
        }
        return prev + 0.25;
      });
    }, 100);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [subsystemIndex]);

  const currentSystem = SUBSYSTEMS[subsystemIndex];

  return (
    <div className="flex-1 raised p-6 rounded-2xl flex flex-col gap-4 overflow-hidden min-h-[200px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-green mb-0 font-mono font-bold">System Diagnostic</h2>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-green animate-ping"></div>
          <div className="w-8 h-1 rounded-full inset opacity-20"></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 font-mono text-[9px] leading-tight">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-3 items-start transition-all duration-500 ${i === logs.length - 1 ? 'animate-in fade-in slide-in-from-left-2' : 'opacity-40'}`}>
             <span className="text-muted/40 shrink-0">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
             <span className={
               log.includes('[OK]') ? 'text-green' : 
               log.includes('[WARN]') ? 'text-amber' : 
               log.includes('[ERROR]') ? 'text-red' : 
               'text-text'
             }>
                {log}
             </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
        <div className="flex justify-between text-[8px] uppercase tracking-widest font-black opacity-60">
          <span>{currentSystem.name}</span>
          <span>{currentSystem.version}</span>
        </div>
        <div className="h-2 w-full inset rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-green/60 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
