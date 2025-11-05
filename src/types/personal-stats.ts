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
  myBagsIn: number;
  myBagsOn: number;
  opponentBagsIn: number;
  opponentBagsOn: number;
  myScore: number;
  opponentScore: number;
}

export interface PersonalStats {
  // Core Stats
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalPoints: number;
  totalBagsIn: number;
  totalBagsOn: number;
  totalBagsThrown: number;

  // Accuracy & Efficiency
  bagsInPercentage: number;
  bagsOnPercentage: number;
  boardPercentage: number;
  missPercentage: number;
  threeBaggerRate: number;
  fourBaggers: number;
  fourBaggerRate: number;

  // Scoring Performance
  averagePointsPerRound: number;
  averagePointsPerGame: number;
  highestGameScore: number;
  shutoutWins: number;
  dominantWins: number;
  closeWins: number;

  // Momentum & Consistency
  comebackWins: number;
  comebacksFrom10Plus: number;
  blowoutLosses: number;
  closeLosses: number;
  perfectRounds: number;
  zeroPointRounds: number;

  // Win Streaks & Patterns
  longestWinStreak: number;
  currentWinStreak: number;
  longestLosingStreak: number;
  currentLosingStreak: number;

  // Head-to-Head Performance
  totalOpponents: number;

  // Advanced Metrics
  clutchFactor: number;
  consistency: number;
  winPercentage: number;
  dominanceRating: number;

  // Last updated
  lastThrow?: string;
  lastMatch?: string;
}

export interface PersonalSettings {
  myName: string;
  linkedPlayerId?: string; // Link to a player in the team system
  isTrackingEnabled: boolean;
  showQuickLog: boolean; // Show quick log button during games
  syncWithTeamStats: boolean; // Whether to sync personal bag logs with team player stats
}
