import TicTacToeGame from '@/components/TicTacToeGame';
import { getHomepage } from '@/lib/strapi';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TicTacToePage() {
  const homepage = await getHomepage();

  if (!homepage) return null;

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

      <TicTacToeGame homepage={homepage} />
    </main>
  );
}
