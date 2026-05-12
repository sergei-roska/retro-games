import SnakeGame from '@/components/SnakeGame';
import Link from 'next/link';
import { readRecords } from '@/lib/records';

export const dynamic = 'force-dynamic';

export default async function SnakePage() {
  const leaderboard = await readRecords('snake');

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
         <h1 className="text-4xl lg:text-8xl font-black tracking-tighter mb-4 uppercase italic leading-none">
            Neon Crawler
         </h1>
         <p className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">
            Series_002 // Protocol_011 // Snake System
         </p>
      </div>
      
      <SnakeGame initialLeaderboard={leaderboard} />
    </main>
  );
}
