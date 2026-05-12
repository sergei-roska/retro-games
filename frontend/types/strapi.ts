export interface Homepage {
  title: string;
  description: string;
  gameActive: boolean;
}

export interface LeaderboardEntry {
  documentId?: string;
  playerName: string;
  score: number;
  date: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: any;
}
