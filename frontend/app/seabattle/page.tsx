import Link from 'next/link';
import SeaBattleGame from '@/components/SeaBattleGame';

export default function SeaBattlePage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center p-8 lg:p-16">
      {/* HUD Header */}
      <div className="w-full max-w-6xl flex justify-between items-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-muted text-[10px] font-black uppercase tracking-[0.4em] hover:text-green transition-colors mb-4 block w-fit">
            ← Abort Protocol
          </Link>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-green uppercase italic drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            Sonar Radar <span className="text-text opacity-20 italic">Protocol</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="inset px-4 py-1 rounded-full border border-green/20 bg-green/5">
                <span className="text-[10px] text-green font-mono font-bold tracking-[0.2em] animate-pulse">RADIATION_LEVEL: NOMINAL</span>
             </div>
             <span className="text-muted text-[10px] font-mono font-bold tracking-widest opacity-40 uppercase">Depth: 400m // Silent_Run: Active</span>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end opacity-20 font-mono text-[9px] tracking-[0.3em] uppercase font-bold leading-tight">
          <span>Ref: SRP-MOD-02</span>
          <span>System: Nuclear_Sub_OS</span>
          <span>Status: Hunting</span>
        </div>
      </div>

      <SeaBattleGame />
    </main>
  );
}
