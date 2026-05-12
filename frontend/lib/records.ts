import fs from 'fs/promises';
import path from 'path';
import { LeaderboardEntry } from '@/types/strapi';

const DATA_PATH = path.join(process.cwd(), 'data/records.json');
const EXAMPLE_PATH = path.join(process.cwd(), 'data/records.json.example');

export async function readRecords(game: string = 'tetris'): Promise<LeaderboardEntry[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    const json = JSON.parse(data);
    return json[game] || [];
  } catch (e) {
    try {
      const exampleData = await fs.readFile(EXAMPLE_PATH, 'utf8');
      const exampleJson = JSON.parse(exampleData);
      return exampleJson[game] || [];
    } catch (innerE) {
      return [];
    }
  }
}

export async function writeRecord(game: string, newEntry: { playerName: string; score: number }) {
  let allRecords: Record<string, LeaderboardEntry[]> = {};
  
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    allRecords = JSON.parse(data);
  } catch (e) {
    try {
      const exampleData = await fs.readFile(EXAMPLE_PATH, 'utf8');
      allRecords = JSON.parse(exampleData);
    } catch (innerE) {}
  }

  const entries = allRecords[game] || [];
  
  const entry: LeaderboardEntry = {
    playerName: newEntry.playerName,
    score: newEntry.score,
    date: new Date().toISOString().split('T')[0]
  };

  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  allRecords[game] = entries.slice(0, 5);

  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  } catch (e) {}

  await fs.writeFile(DATA_PATH, JSON.stringify(allRecords, null, 2));
  return allRecords[game];
}
