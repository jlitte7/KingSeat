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
  leagueId?: string; // Optional - link to a specific league
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
  totalOpponentPoints: number; // NEW: Total points scored by opponents
  totalRoundsPlayed: number; // NEW: Total rounds across all games
  totalBagsIn: number;
  totalBagsOn: number;
  totalBagsThrown: number;

  // Basic Performance Metrics
  averagePointsPerRound: number; // PPR
  opponentPointsPerRound: number; // NEW: OPPR - opponent's average points per round
  pointDifferential: number; // NEW: Pt. Diff - your PPR minus opponent's PPR

  // Accuracy & Efficiency (Bag-Placement / Throwing Statistics)
  bagsInPercentage: number; // % Bags "In" (Hole)
  bagsOnPercentage: number; // % Bags "On Board"
  boardPercentage: number; // % Bags that scored (in + on)
  missPercentage: number; // % Bags "Off Board"
  threeBaggerRate: number;
  fourBaggers: number;
  fourBaggerRate: number; // % Four-Bagger
  scorePercentage: number; // NEW: % of bags that scored (in + on)

  // Scoring Performance
  averagePointsPerGame: number; // PPG
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

  // Head-to-Head Performance (Standings / Win-Loss Metrics)
  totalOpponents: number;
  winPercentage: number; // Win %

  // Advanced Metrics
  clutchFactor: number;
  consistency: number;
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

// League-specific stats for a user
export interface LeagueSpecificStats {
  leagueId: string;
  leagueName: string;
  stats: PersonalStats;
  matchIds: string[]; // Personal matches that belong to this league
}
