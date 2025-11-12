import { v4 as uuidv4 } from "uuid";

// Tournament formats
export type TournamentFormat =
  | "blind-draw-doubles" // Traditional blind draw with fixed partners
  | "switcholio" // Rotating partners each game
  | "round-robin" // Everyone plays everyone
  | "single-elimination" // Standard bracket
  | "double-elimination"; // Double elimination bracket

// Tournament types (ACL-style)
export type TournamentType = "local" | "regional" | "open";

// Player skill tiers for balanced pairing
export type SkillTier = "A" | "B" | "C" | "none";

// Tournament status
export type TournamentStatus =
  | "setup" // Creating tournament
  | "registration" // Players registering
  | "check-in" // Players checking in
  | "team-generation" // Generating teams/pairings
  | "round-robin" // Playing round robin games
  | "bracket" // Playing bracket games
  | "completed"; // Tournament finished

// Player registration
export interface TournamentPlayer {
  id: string;
  playerId?: string; // Link to existing player in system
  name: string;
  skillTier: SkillTier;
  checkedIn: boolean;
  registrationTime: string;
  email?: string;
  phone?: string;
}

// Team (for blind draw or fixed doubles)
export interface TournamentTeam {
  id: string;
  player1: TournamentPlayer;
  player2: TournamentPlayer | "ghost"; // Ghost for odd numbers
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  gamesPlayed: number;
  seed?: number; // For bracket seeding
}

// Switcholio pairing (per game)
export interface SwitcholioGame {
  gameNumber: number;
  team1Player1: TournamentPlayer;
  team1Player2: TournamentPlayer;
  team2Player1: TournamentPlayer;
  team2Player2: TournamentPlayer;
  team1Score?: number;
  team2Score?: number;
  winnerId?: string; // ID of winning team
  completed: boolean;
  startTime?: string;
  endTime?: string;
}

// Round robin match
export interface RoundRobinMatch {
  id: string;
  team1: TournamentTeam;
  team2: TournamentTeam;
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  completed: boolean;
  roundNumber: number;
  startTime?: string;
  endTime?: string;
}

// Bracket match
export interface BracketMatch {
  id: string;
  roundNumber: number; // 1 = finals, 2 = semis, etc.
  matchNumber: number; // Position in round
  team1?: TournamentTeam | "TBD";
  team2?: TournamentTeam | "TBD";
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  loserId?: string;
  completed: boolean;
  nextMatchId?: string; // Winner goes here
  loserNextMatchId?: string; // For double elimination
  startTime?: string;
  endTime?: string;
}

// Season (for tracking multiple tournaments)
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  tournamentIds: string[];
  active: boolean;
}

// Main tournament object
export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  type: TournamentType;
  status: TournamentStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Settings
  useSkillTiers: boolean;
  preventRepeatPairings: boolean; // For Switcholio
  minTeamsRequired: number; // Default 6 for ACL compliance
  maxTeamsPerBracket: number; // Default 64 for ACL compliance
  pointsToWin: number; // Default 21
  gamesPerMatch: number; // For best-of series (default 1)
  numberOfRounds?: number; // For round robin

  // Players & Teams
  players: TournamentPlayer[];
  teams: TournamentTeam[];

  // Games/Matches
  switcholioGames: SwitcholioGame[]; // For Switcholio format
  roundRobinMatches: RoundRobinMatch[]; // For round robin phase
  bracketMatches: BracketMatch[]; // For bracket phase

  // Results
  winnerId?: string;
  runnerUpId?: string;

  // Season tracking
  seasonId?: string;

  // Partner history (for preventing repeats)
  partnerHistory: Record<string, string[]>; // playerId -> array of partner IDs
}

// Tournament statistics for a player
export interface TournamentPlayerStats {
  playerId: string;
  playerName: string;
  tournamentsPlayed: number;
  wins: number;
  losses: number;
  totalPoints: number;
  averagePointsPerGame: number;
  partnersPlayed: string[]; // Array of partner names
  favoritePartner?: string; // Most successful partner
  bestFinish: number; // 1 = champion, 2 = runner-up, etc.
}

// Helper functions for team generation
export const createGhostPlayer = (): "ghost" => "ghost";

export const isGhost = (player: TournamentPlayer | "ghost"): player is "ghost" => {
  return player === "ghost";
};

// Tier balancing priority (for blind draw algorithm)
export const TIER_PAIRING_PRIORITY = [
  ["A", "C"], // Pair A with C first
  ["A", "B"], // Then A with B
  ["B", "C"], // Then B with C
  ["A", "A"], // Then same tiers if needed
  ["B", "B"],
  ["C", "C"],
];

// Validate ACL compliance
export const isACLCompliant = (tournament: Tournament): boolean => {
  const teamCount = tournament.teams.length;
  return teamCount >= tournament.minTeamsRequired;
};

// Calculate if tournament needs bracket split
export const needsBracketSplit = (tournament: Tournament): boolean => {
  return tournament.teams.length > tournament.maxTeamsPerBracket;
};
