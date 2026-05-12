import Link from 'next/link';
import { getHomepage } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const homepage = await getHomepage();
  
  // Immersive Vintage Text
  const title = "VINTAGE TERMINAL";
  const subtitle = "SERIES_001 // TACTILE LOGIC CORE";
  const description = "Legacy-grade interactive protocols for high-fidelity engagement. Select sequence to initiate.";

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background technical decoration */}
      <div className="absolute top-10 left-10 opacity-10 font-mono text-[10px] leading-tight pointer-events-none hidden lg:block">
        SYS_REF: 0x00FF21<br/>
        STATUS: NOMINAL<br/>
        HARDWARE: SERIES_01
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center text-center">
        
        {/* Immersive Branding Card */}
        <div className="raised p-12 lg:p-24 rounded-[60px] mb-12 w-full animate-in fade-in zoom-in duration-1000 relative overflow-hidden">
          {/* Subtle light reflection on the corner */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-6xl lg:text-[120px] font-black tracking-tighter mb-4 uppercase italic leading-none text-text drop-shadow-2xl">
              {title}
            </h1>
            
            <div className="inset w-fit mx-auto px-6 py-2 rounded-full mb-10">
               <p className="text-amber text-[10px] lg:text-xs uppercase tracking-[0.5em] font-black animate-pulse">
                 {subtitle}
               </p>
            </div>

            <p className="max-w-xl mx-auto text-muted text-xs lg:text-sm uppercase tracking-[0.2em] leading-relaxed font-bold opacity-40 mb-16">
              {description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 justify-items-center w-full max-w-3xl mx-auto">
              <GameLink href="/tetris" label="Tetris" color="text-text" />
              <GameLink href="/snake" label="Neon Crawler" color="text-amber" />
              <GameLink href="/poker" label="Poker" color="text-muted" />
              <GameLink href="/blackjack" label="BlackJack" color="text-green" />
              <GameLink href="/seabattle" label="Sonar Radar" color="text-green" />
              <GameLink href="/tictactoe" label="Tic-Tac-Toe" color="text-amber" />
            </div>

            <Link 
              href="/palette" 
              className="w-full raised py-6 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-[0.99] hover:brightness-110 group border border-white/0 hover:border-white/5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted opacity-40 group-hover:bg-amber group-hover:opacity-100 group-hover:shadow-[0_0_8px_var(--amber)] transition-all"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted opacity-60 group-hover:opacity-100 transition-opacity">
                Terminal Design System // Global Palette
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-muted opacity-40 group-hover:bg-amber group-hover:opacity-100 group-hover:shadow-[0_0_8px_var(--amber)] transition-all"></div>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-6 opacity-30">
           <div className="flex gap-4">
              <div className="w-16 h-1 inset rounded-full"></div>
              <div className="w-4 h-1 inset rounded-full bg-amber"></div>
              <div className="w-32 h-1 inset rounded-full"></div>
           </div>
           <p className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
             Authorized Personnel Only // Global Logic Distribution
           </p>
        </div>
      </div>
    </main>
  );
}

function GameLink({ href, label, color, className = '' }: { href: string, label: string, color: string, className?: string }) {
  return (
    <Link 
      href={href} 
      className={`raised group w-[220px] h-[140px] px-4 py-6 rounded-3xl flex flex-col items-center justify-center gap-4 no-underline transition-all active:scale-95 hover:brightness-125 ${className}`}
    >
      <div className="inset p-3 rounded-full opacity-20 group-hover:opacity-100 group-hover:bg-white/5 transition-all">
         <div className={`w-2 h-2 rounded-full bg-current ${color}`}></div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${color}`}>
        {label}
      </span>
    </Link>
  );
}
