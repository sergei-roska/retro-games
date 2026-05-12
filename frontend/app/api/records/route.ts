import { NextResponse } from 'next/server';
import { readRecords, writeRecord } from '@/lib/records';

export async function GET() {
  const records = await readRecords();
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { game, playerName, score } = body;
  const top5 = await writeRecord(game || 'tetris', { playerName, score });
  return NextResponse.json({ success: true, records: top5 });
}
