import GameContainer from '@/components/GameContainer';
import { getHomepage } from '@/lib/strapi';
import { readRecords } from '@/lib/records';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TetrisPage() {
  const homepage = await getHomepage();
  // Call server-side logic directly
  const leaderboard = await readRecords();

  const defaultHomepage = {
    title: 'Tetris Dark Edition',
    description: 'Protocol initiated. Execute line clearance sequences.',
    gameActive: true,
  };

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

      <GameContainer 
        homepage={homepage || defaultHomepage} 
        initialLeaderboard={leaderboard} 
      />
    </main>
  );
}
