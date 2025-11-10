// Global stats types for comparing user performance across all app users

export interface GlobalUserStats {
  userId: string;
  userName: string;
  // Core metrics for comparison
  totalGames: number;
  totalWins: number;
  winPercentage: number;
  averagePointsPerRound: number;
  bagsInPercentage: number;
  fourBaggers: number;
  dominanceRating: number;
}

export interface LeagueStats {
  leagueId: string;
  leagueName: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  averagePointsPerRound: number;
  bagsInPercentage: number;
  fourBaggers: number;
}

export interface GlobalStatsComparison {
  yourStats: GlobalUserStats;
  globalRank: number; // Your rank out of total users
  totalUsers: number; // Total number of users in the system
  percentile: number; // What percentile you're in (e.g., top 15%)
  globalLeaderboard: GlobalUserStats[]; // Top users for comparison
}

export type StatsViewMode = "personal" | "league" | "global";
