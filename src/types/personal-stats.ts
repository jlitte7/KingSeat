// Personal bag tracking - separate from team stats
export interface PersonalBagThrow {
  id: string;
  result: "in" | "on" | "miss"; // In the hole, on the board, or miss
  timestamp: string;
  matchId?: string; // Optional reference to a game if playing with teams
  roundNumber?: number;
  throwNumber: number; // 1-4 for each round
}

export interface PersonalMatch {
  id: string;
  date: string;
  opponent?: string; // Optional - may be playing solo or against multiple
  teammate?: string; // Optional
  myScore: number;
  opponentScore?: number;
  won?: boolean; // Optional if just tracking bags without scoring
  rounds: PersonalRound[];
  notes?: string;
}

export interface PersonalRound {
  roundNumber: number;
  throws: PersonalBagThrow[];
  myScore: number;
  opponentScore?: number;
}

export interface PersonalStats {
  // Your personal totals
  totalThrows: number;
  totalIn: number;
  totalOn: number;
  totalMisses: number;

  // Percentages
  inPercentage: number;
  onPercentage: number;
  boardPercentage: number;
  missPercentage: number;

  // Streaks
  currentInStreak: number;
  bestInStreak: number;
  currentBoardStreak: number; // In or On
  bestBoardStreak: number;

  // Round performance
  fourBaggers: number;
  threeBaggers: number;

  // Match stats (optional)
  matchesPlayed: number;
  matchesWon: number;
  winPercentage: number;

  // Last updated
  lastThrow?: string;
  lastMatch?: string;
}

export interface PersonalSettings {
  myName: string;
  isTrackingEnabled: boolean;
  showQuickLog: boolean; // Show quick log button during games
}
