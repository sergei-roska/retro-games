import PokerGame from '@/components/PokerGame';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PokerPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 lg:p-12 overflow-x-hidden relative">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="raised group px-6 py-3 rounded-xl flex items-center gap-3 no-underline transition-all active:scale-95">
          <span className="text-muted text-[10px] font-black uppercase tracking-widest group-hover:text-amber transition-colors">
            ← Exit Protocol
          </span>
        </Link>
      </div>

      <div className="mb-12 text-center">
         <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 uppercase italic leading-none">
            Poker Terminal
         </h1>
         <p className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">
            Jacks or Better // Tactile Logic System
         </p>
      </div>
      
      <PokerGame />
    </main>
  );
}
