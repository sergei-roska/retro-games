import { Homepage, LeaderboardEntry } from '@/types/strapi';

export async function getHomepage(): Promise<Homepage | null> {
  return {
    title: 'VINTAGE TERMINAL',
    description: 'Legacy-grade interactive protocols for high-fidelity engagement. Select sequence to initiate.',
    gameActive: true
  };
}

export async function getLeaderboards(): Promise<LeaderboardEntry[]> {
  try {
    // We always use the API route from the client side.
    // Server components should call readRecords() directly from @/lib/records
    const res = await fetch('/api/records', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
}

export async function submitScore(name: string, score: number): Promise<boolean> {
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: name, score }),
    });
    return res.ok;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}
