export interface Player {
  id: string;
  name: string;
  nickname?: string;
  photo?: string;
  teamId: string;
  stats: PlayerStats;
  achievements: Achievement[];
  createdAt: string;
}

export interface PlayerStats {
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
  boardPercentage: number; // Combined bags in + on (landing accuracy)
  missPercentage: number; // Bags that completely missed
  threeBaggerRate: number; // Percentage of rounds with 3 bags in
  fourBaggers: number;
  fourBaggerRate: number; // Percentage of rounds with 4 bags in

  // Scoring Performance
  averagePointsPerRound: number;
  averagePointsPerGame: number;
  highestGameScore: number;
  shutoutWins: number; // Games won without opponent scoring
  dominantWins: number; // Games won by 10+ points
  closeWins: number; // Games won by 3 points or less

  // Momentum & Consistency
  comebackWins: number;
  comebacksFrom10Plus: number; // Specific stat for down 10+
  blowoutLosses: number; // Lost by 10+ points
  closeLosses: number; // Lost by 3 points or less
  perfectRounds: number; // Rounds with all 4 bags in
  zeroPointRounds: number; // Rounds where player scored 0

  // Win Streaks & Patterns
  longestWinStreak: number;
  currentWinStreak: number;
  longestLosingStreak: number;
  currentLosingStreak: number;

  // Head-to-Head Performance
  totalOpponents: number; // Number of unique opponents faced

  // Advanced Metrics
  clutchFactor: number; // Win rate in close games (within 3 points)
  consistency: number; // Standard deviation of PPR (lower is more consistent)
  winPercentage: number;
  dominanceRating: number; // Composite score of performance
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  players: Player[];
  stats: TeamStats;
  createdAt: string;
}

export interface TeamStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalPoints: number;
}

export interface Round {
  p1In: number;
  p1On: number;
  p2In: number;
  p2On: number;
  p1Score: number;
  p2Score: number;
}

export interface Game {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  rounds: Round[];
  winnerId?: string;
  completed: boolean;
  seriesId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Series {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  games: Game[];
  currentGameIndex: number;
  homeTeamScore: number;
  awayTeamScore: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface PlayerSelection {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export type AchievementType =
  | 'four_bagger'
  | 'four_bagger_streak'
  | 'comeback_win'
  | 'perfect_game'
  | 'win_streak'
  | 'century_club'
  | 'shutout'
  | 'legendary'
  | 'first_win';

export interface Tournament {
  id: string;
  name: string;
  teams: string[];
  bracket: TournamentBracket;
  currentRound: number;
  completed: boolean;
  winnerId?: string;
  createdAt: string;
}

export interface TournamentBracket {
  rounds: TournamentRound[];
}

export interface TournamentRound {
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  team1Id?: string;
  team2Id?: string;
  winnerId?: string;
  seriesId?: string;
  completed: boolean;
}

export interface PracticeDrill {
  id: string;
  name: string;
  description: string;
  targetBagsIn: number;
  targetBagsOn: number;
  timeLimit?: number;
  completed: boolean;
}

export interface PracticeSession {
  id: string;
  playerId: string;
  drills: PracticeDrill[];
  totalBagsThrown: number;
  totalBagsIn: number;
  totalBagsOn: number;
  duration: number;
  createdAt: string;
}

export interface League {
  id: string;
  name: string;
  teamIds: string[];
  numberOfWeeks: number;
  schedule: WeekSchedule[];
  currentWeek: number;
  started: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface WeekSchedule {
  weekNumber: number;
  matches: LeagueMatch[];
}

export interface LeagueMatch {
  id: string;
  weekNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  games: LeagueGame[];
  homeTeamScore: number;
  awayTeamScore: number;
  completed: boolean;
  scheduledDate?: string;
}

export interface LeagueGame {
  gameNumber: number; // 1-12
  // Away team (team 1)
  awayPlayer1Id?: string;
  awayPlayer1Name?: string;
  awayPlayer2Id?: string;
  awayPlayer2Name?: string;
  // Home team (team 2)
  homePlayer1Id?: string;
  homePlayer1Name?: string;
  homePlayer2Id?: string;
  homePlayer2Name?: string;
  // Scores
  awayTeamScore: number;
  homeTeamScore: number;
  rounds: Round[];
  winningTeam?: "away" | "home";
  completed: boolean;
  inProgress: boolean;
}
