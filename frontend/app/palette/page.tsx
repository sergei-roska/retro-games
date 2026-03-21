"use client";

import React from "react";
import Link from "next/link";

const ColorSwatch = ({ name, variable, value }: { name: string; variable: string; value: string }) => (
  <div className="flex flex-col gap-2 p-4 raised rounded-xl">
    <div 
      className="h-16 w-full rounded-lg border border-stroke" 
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div className="flex flex-col">
      <span className="text-sm font-bold uppercase tracking-wider">{name}</span>
      <span className="text-xs font-mono text-muted">{variable}</span>
      <span className="text-xs font-mono text-muted uppercase">{value}</span>
    </div>
  </div>
);

const SnakePhaseCard = ({ phase, title, color, description, activeFX = false }: { 
  phase: string; 
  title: string; 
  color: string; 
  description: string;
  activeFX?: boolean;
}) => (
  <div className={`p-6 raised rounded-2xl flex flex-col gap-4 relative overflow-hidden ${activeFX ? 'animate-pulse' : ''}`}>
    {activeFX && (
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines mix-blend-overlay" />
    )}
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-muted">{phase}</span>
      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-stroke uppercase tracking-widest" style={{ color: `var(${color})`, borderColor: `var(${color})` }}>
        Active
      </span>
    </div>
    
    <div className="flex flex-col gap-1">
      <h3 className="text-xl font-bold tracking-tight" style={{ color: `var(${color})` }}>{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>

    {/* Snake Mockup */}
    <div className="h-32 inset rounded-lg relative overflow-hidden bg-[#050505]">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--stroke) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Snake Trail */}
      <div className="absolute bottom-4 left-4 flex gap-1 items-center">
         {[...Array(5)].map((_, i) => (
           <div 
            key={i} 
            className="w-4 h-4 rounded-sm" 
            style={{ 
              backgroundColor: `var(${color})`, 
              opacity: (i + 1) / 5,
              filter: `blur(${activeFX ? '2px' : '0px'})`
            }} 
           />
         ))}
         <div 
          className="w-5 h-5 rounded shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
          style={{ backgroundColor: `var(${color})` }} 
         />
      </div>

      {/* Core (Food) */}
      <div 
        className="absolute top-8 right-12 w-3 h-3 rounded-full animate-bounce shadow-[0_0_10px_#EF4444]" 
        style={{ backgroundColor: '#EF4444' }} 
      />
    </div>
  </div>
);

export default function PalettePage() {
  return (
    <main className="min-h-screen p-8 md:p-16 max-w-6xl mx-auto flex flex-col gap-16 relative">
      {/* Navigation */}
      <div className="flex justify-between items-center w-full mb-4">
        <Link href="/" className="raised group px-6 py-3 rounded-xl flex items-center gap-3 no-underline transition-all active:scale-95">
          <span className="text-muted text-[10px] font-black uppercase tracking-widest group-hover:text-amber transition-colors">
            ← Exit Protocol
          </span>
        </Link>
        
        <div className="hidden md:flex flex-col items-end opacity-20 font-mono text-[8px] tracking-[0.3em] uppercase font-bold leading-tight">
          <span>Design_System_v2.0</span>
          <span>Status: Calibration_Active</span>
        </div>
      </div>

      <header className="flex flex-col gap-4">
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter uppercase leading-none">
          Design <span className="text-amber">Tokens</span>
        </h1>
        <p className="text-muted text-sm md:text-lg max-w-2xl font-mono opacity-60 uppercase tracking-widest leading-relaxed">
          [System Identification: Series 002 Aesthetics] <br/> 
          Manual calibration of palette and tactile interfaces.
        </p>
      </header>

      {/* Core Colors */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted flex items-center gap-2">
          <div className="h-0.5 w-8 bg-stroke" /> Core Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ColorSwatch name="Background" variable="--bg" value="#0A0A0A" />
          <ColorSwatch name="Surface" variable="--surface" value="#121212" />
          <ColorSwatch name="Green" variable="--green" value="#618D68" />
          <ColorSwatch name="Amber" variable="--amber" value="#D87E4A" />
          <ColorSwatch name="Red" variable="--red" value="#EF4444" />
          <ColorSwatch name="Text" variable="--text" value="#FFFFFF" />
        </div>
      </section>

      {/* Tactile Elements */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted flex items-center gap-2">
            <div className="h-0.5 w-8 bg-stroke" /> Tactile Feedback
          </h2>
          <div className="flex flex-col gap-4">
            <div className="p-8 raised rounded-2xl flex flex-col gap-2">
              <span className="text-sm font-bold">Raised Component</span>
              <p className="text-xs text-muted">Class .raised - Primary container style.</p>
            </div>
            <div className="p-8 inset rounded-2xl flex flex-col gap-2">
              <span className="text-sm font-bold">Inset Component</span>
              <p className="text-xs text-muted">Class .inset - Slot or input field style.</p>
            </div>
            <button className="primary-button h-12 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform active:scale-95">
              Primary Action Button
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted flex items-center gap-2">
            <div className="h-0.5 w-8 bg-stroke" /> Session Calibration
          </h2>
          <div className="p-8 raised rounded-2xl flex flex-col gap-6">
            {/* Mission Mode Switch */}
            <div className="flex justify-between items-center">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-text font-black">Sensory Peak Protocol</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted font-bold opacity-60">Level 11 = Auto Victory</span>
               </div>
               <div className="w-14 h-8 rounded-full p-1 inset relative transition-all duration-300 bg-amber/20">
                  <div className="w-6 h-6 rounded-full raised border-stroke transition-all duration-300 translate-x-6 bg-amber" />
               </div>
            </div>

            {/* Grid Size Toggle */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-text font-black">Grid Resolution</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted font-bold opacity-60">Matrix: 20x20 // 30x30</span>
               </div>
               <div className="h-8 inset rounded-full p-1 flex relative w-24">
                  <div className="flex-1 flex items-center justify-center text-[8px] font-bold z-10">20x20</div>
                  <div className="flex-1 flex items-center justify-center text-[8px] font-bold z-10 opacity-40">30x30</div>
                  <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] raised rounded-full border-stroke" />
               </div>
            </div>

            {/* Secure Layer (Firewalls) Toggle */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-text font-black">Secure Layer (Firewalls)</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted font-bold opacity-60">Enable static obstacles</span>
               </div>
               <div className="w-14 h-8 rounded-full p-1 inset relative transition-all duration-300">
                  <div className="w-6 h-6 rounded-full raised border-stroke transition-all duration-300 translate-x-0 bg-muted/20" />
               </div>
            </div>

            {/* Overclock (Data Packets) Toggle */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-text font-black">Overclock (Data Packets)</span>
                  <span className="text-[8px] uppercase tracking-widest text-muted font-bold opacity-60">Spawn power-up cores</span>
               </div>
               <div className="w-14 h-8 rounded-full p-1 inset relative transition-all duration-300 bg-green/20">
                  <div className="w-6 h-6 rounded-full raised border-stroke transition-all duration-300 translate-x-6 bg-green" />
               </div>
            </div>

            {/* Progress Bar & Status Log */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[8px] font-mono font-black uppercase tracking-widest">
                  <span>Integration Progress</span>
                  <span className="text-green">64%</span>
                </div>
                <div className="h-2 inset rounded-full overflow-hidden p-0.5">
                   <div className="h-full bg-green rounded-full shadow-[0_0_10px_rgba(97,141,104,0.5)]" style={{ width: '64%' }} />
                </div>
              </div>

              <div className="p-4 inset rounded-xl border border-stroke/20 bg-black/40">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <div className="w-1 h-1 bg-green rounded-full animate-pulse" />
                    <span className="text-[8px] text-green font-mono uppercase tracking-widest">[OK] CORE_DETECTED_SYNC_READY</span>
                  </div>
                  <div className="flex gap-2 items-center opacity-60">
                    <div className="w-1 h-1 bg-amber rounded-full" />
                    <span className="text-[8px] text-amber font-mono uppercase tracking-widest">[WARN] FIREWALL_ACTIVE_SECTOR_4C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Snake Phases */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted flex items-center gap-2">
          <div className="h-0.5 w-8 bg-stroke" /> Neon Crawler Phases
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <SnakePhaseCard 
            phase="PHASE_01" 
            title="Stable (Lvl 1-5)" 
            color="--green" 
            description="Base velocity calibration. Internal systems nominal."
          />
          <SnakePhaseCard 
            phase="PHASE_02" 
            title="Accelerated (Lvl 6-9)" 
            color="--amber" 
            description="Warning: Thermal load increasing. Rapid acceleration."
          />
          <SnakePhaseCard 
            phase="PHASE_03" 
            title="Overdrive (Lvl 10)" 
            color="--red" 
            description="Critical state. Maximum velocity. Terminal failure risk."
            activeFX={true}
          />
        </div>
      </section>
      
      <style jsx global>{`
        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.1) 1px,
            transparent 1px,
            transparent 2px
          );
        }
      `}</style>
    </main>
  );
}
