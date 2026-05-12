'use client';

import React from 'react';
import { Homepage } from '@/types/strapi';
import GameInstructions from './GameInstructions';
import SystemDiagnostic from './SystemDiagnostic';

interface Control {
  key: string;
  action: string;
}

interface Series002ContainerProps {
  homepage: Homepage;
  children: React.ReactNode;
  subtitle?: string;
  controls?: Control[];
}

export default function Series002Container({ homepage, children, subtitle, controls }: Series002ContainerProps) {
  return (
    <div className="w-full max-w-[1400px] flex flex-col items-center">
      {/* Header */}
      <div className="w-full mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase italic leading-none mb-4 text-center text-text drop-shadow-2xl">
          {homepage.title}
        </h1>
        <div className="inset px-6 py-2 rounded-full mb-6">
           <p className="text-amber text-[10px] lg:text-xs uppercase tracking-[0.5em] font-black animate-pulse">
             {subtitle || "SERIES_002 // TACTILE LOGIC CORE"}
           </p>
        </div>
        <div 
          className="w-full max-w-4xl text-muted text-[10px] lg:text-xs uppercase tracking-[0.3em] font-bold opacity-40 text-center px-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: homepage.description }}
        />
      </div>

      {/* Main Interface Grid */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full px-4">
        
        {/* Left: Protocol Info */}
        <div className="hidden lg:block lg:sticky lg:top-12 w-64">
          <div className="flex flex-col gap-8">
            <GameInstructions controls={controls} />
            <div className="raised p-6 rounded-2xl flex flex-col gap-4 opacity-40">
               <span className="text-[8px] uppercase tracking-[0.3em] font-black text-muted">Hardware_Ref</span>
               <div className="font-mono text-[9px] leading-tight">
                  RELAY_ID: 0x2A9F<br/>
                  CORE: LOGIC_V2<br/>
                  STATUS: NOMINAL
               </div>
            </div>
          </div>
        </div>

        {/* Center: The Core Game Space */}
        <div className="flex-1 flex flex-col items-center">
          {/* Mobile restricted message */}
          <div className="md:hidden w-full aspect-square raised bg-surface flex items-center justify-center p-8 text-center rounded-3xl mb-8 border border-white/5">
            <p className="text-muted text-[10px] uppercase tracking-[0.25em] font-bold leading-loose opacity-60">
              Terminal access restricted.<br /> Use desktop class hardware.
            </p>
          </div>

          <div className="hidden md:block w-full flex justify-center">
            {children}
          </div>
        </div>

        {/* Right: Diagnostics & Meta */}
        <div className="hidden lg:flex lg:flex-col gap-8 lg:sticky lg:top-12 w-64">
          <SystemDiagnostic />
          
          <div className="raised p-6 rounded-2xl flex flex-col gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-black">Sync_Status</span>
             </div>
             <div className="h-1.5 inset rounded-full overflow-hidden p-0.5">
                <div className="h-full w-full bg-green/40 rounded-full"></div>
             </div>
             <span className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold opacity-30 italic">Real-time Data Link Active</span>
          </div>
        </div>

        {/* Tablet/Mobile fallback footer */}
        <div className="lg:hidden flex flex-col gap-8 w-full max-w-2xl items-center mt-12 pb-12">
           <div className="w-full flex gap-8">
              <GameInstructions controls={controls} />
              <SystemDiagnostic />
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full mt-24 py-12 border-t border-white/5 flex flex-col items-center gap-6 opacity-20">
         <div className="flex gap-4">
            <div className="w-16 h-1 inset rounded-full"></div>
            <div className="w-4 h-1 inset rounded-full bg-amber"></div>
            <div className="w-32 h-1 inset rounded-full"></div>
         </div>
         <p className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
           Authorized Personnel Only // Protocol Series 002
         </p>
      </div>
    </div>
  );
}
