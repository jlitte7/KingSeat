import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import {
  Tournament,
  TournamentPlayer,
  TournamentTeam,
  TournamentFormat,
  TournamentType,
  TournamentStatus,
  SkillTier,
  Season,
  RoundRobinMatch,
  BracketMatch,
  SwitcholioGame,
  TIER_PAIRING_PRIORITY,
  isGhost,
} from "../types/tournament";

interface TournamentState {
  tournaments: Tournament[];
  seasons: Season[];
  currentTournamentId: string | null;

  // Tournament CRUD
  createTournament: (
    name: string,
    format: TournamentFormat,
    type: TournamentType,
    settings?: Partial<Tournament>
  ) => string;
  deleteTournament: (tournamentId: string) => void;
  getTournament: (tournamentId: string) => Tournament | undefined;
  updateTournamentStatus: (tournamentId: string, status: TournamentStatus) => void;

  // Player management
  registerPlayer: (tournamentId: string, name: string, skillTier?: SkillTier, playerId?: string) => void;
  checkInPlayer: (tournamentId: string, playerId: string) => void;
  removePlayer: (tournamentId: string, playerId: string) => void;
  updatePlayerTier: (tournamentId: string, playerId: string, tier: SkillTier) => void;

  // Team generation (blind draw)
  generateBlindDrawTeams: (tournamentId: string) => void;
  manuallyPairPlayers: (tournamentId: string, player1Id: string, player2Id: string) => void;
  shuffleTeams: (tournamentId: string) => void;

  // Switcholio
  generateSwitcholioRound: (tournamentId: string, roundNumber: number) => void;

  // Round Robin
  generateRoundRobinSchedule: (tournamentId: string) => void;
  recordRoundRobinResult: (
    tournamentId: string,
    matchId: string,
    team1Score: number,
    team2Score: number
  ) => void;

  // Bracket
  generateBracket: (tournamentId: string, eliminationType: "single" | "double") => void;
  recordBracketResult: (
    tournamentId: string,
    matchId: string,
    team1Score: number,
    team2Score: number
  ) => void;

  // Season management
  createSeason: (name: string, startDate: string) => string;
  addTournamentToSeason: (seasonId: string, tournamentId: string) => void;

  // Utilities
  resetTournamentState: () => void;
}

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],
      seasons: [],
      currentTournamentId: null,

      createTournament: (name, format, type, settings = {}) => {
        const tournament: Tournament = {
          id: uuidv4(),
          name,
          format,
          type,
          status: "setup",
          createdAt: new Date().toISOString(),
          useSkillTiers: settings.useSkillTiers ?? false,
          preventRepeatPairings: settings.preventRepeatPairings ?? false,
          minTeamsRequired: settings.minTeamsRequired ?? 6,
          maxTeamsPerBracket: settings.maxTeamsPerBracket ?? 64,
          pointsToWin: settings.pointsToWin ?? 21,
          gamesPerMatch: settings.gamesPerMatch ?? 1,
          numberOfRounds: settings.numberOfRounds,
          players: [],
          teams: [],
          switcholioGames: [],
          roundRobinMatches: [],
          bracketMatches: [],
          partnerHistory: {},
          ...settings,
        };

        set((state) => ({
          tournaments: [...state.tournaments, tournament],
          currentTournamentId: tournament.id,
        }));

        return tournament.id;
      },

      deleteTournament: (tournamentId) => {
        set((state) => ({
          tournaments: state.tournaments.filter((t) => t.id !== tournamentId),
          currentTournamentId:
            state.currentTournamentId === tournamentId ? null : state.currentTournamentId,
        }));
      },

      getTournament: (tournamentId) => {
        return get().tournaments.find((t) => t.id === tournamentId);
      },

      updateTournamentStatus: (tournamentId, status) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId ? { ...t, status } : t
          ),
        }));
      },

      registerPlayer: (tournamentId, name, skillTier = "none", playerId) => {
        const player: TournamentPlayer = {
          id: uuidv4(),
          playerId,
          name,
          skillTier,
          checkedIn: false,
          registrationTime: new Date().toISOString(),
        };

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, players: [...t.players, player] }
              : t
          ),
        }));
      },

      checkInPlayer: (tournamentId, playerId) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  players: t.players.map((p) =>
                    p.id === playerId ? { ...p, checkedIn: true } : p
                  ),
                }
              : t
          ),
        }));
      },

      removePlayer: (tournamentId, playerId) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, players: t.players.filter((p) => p.id !== playerId) }
              : t
          ),
        }));
      },

      updatePlayerTier: (tournamentId, playerId, tier) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  players: t.players.map((p) =>
                    p.id === playerId ? { ...p, skillTier: tier } : p
                  ),
                }
              : t
          ),
        }));
      },

      // BLIND DRAW ALGORITHM with tier balancing
      generateBlindDrawTeams: (tournamentId) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return;

        const checkedInPlayers = tournament.players.filter((p) => p.checkedIn);
        const teams: TournamentTeam[] = [];

        if (tournament.useSkillTiers) {
          // Tier-based pairing
          const tierPools: Record<SkillTier, TournamentPlayer[]> = {
            A: checkedInPlayers.filter((p) => p.skillTier === "A"),
            B: checkedInPlayers.filter((p) => p.skillTier === "B"),
            C: checkedInPlayers.filter((p) => p.skillTier === "C"),
            none: checkedInPlayers.filter((p) => p.skillTier === "none"),
          };

          // Shuffle each pool
          Object.keys(tierPools).forEach((tier) => {
            tierPools[tier as SkillTier] = shuffleArray(tierPools[tier as SkillTier]);
          });

          // Pair according to priority
          for (const [tier1, tier2] of TIER_PAIRING_PRIORITY) {
            while (tierPools[tier1 as SkillTier].length > 0 && tierPools[tier2 as SkillTier].length > 0) {
              const p1 = tierPools[tier1 as SkillTier].pop()!;
              const p2 = tierPools[tier2 as SkillTier].pop()!;

              teams.push({
                id: uuidv4(),
                player1: p1,
                player2: p2,
                wins: 0,
                losses: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                gamesPlayed: 0,
              });
            }
          }

          // Handle any remaining players (pair from none tier or leftover)
          const remaining = [
            ...tierPools.A,
            ...tierPools.B,
            ...tierPools.C,
            ...tierPools.none,
          ];

          while (remaining.length >= 2) {
            const p1 = remaining.pop()!;
            const p2 = remaining.pop()!;
            teams.push({
              id: uuidv4(),
              player1: p1,
              player2: p2,
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              gamesPlayed: 0,
            });
          }

          // If odd number, add ghost
          if (remaining.length === 1) {
            teams.push({
              id: uuidv4(),
              player1: remaining[0],
              player2: "ghost",
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              gamesPlayed: 0,
            });
          }
        } else {
          // Simple random pairing
          const shuffled = shuffleArray(checkedInPlayers);

          for (let i = 0; i < shuffled.length - 1; i += 2) {
            teams.push({
              id: uuidv4(),
              player1: shuffled[i],
              player2: shuffled[i + 1],
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              gamesPlayed: 0,
            });
          }

          // If odd number, add ghost
          if (shuffled.length % 2 !== 0) {
            teams.push({
              id: uuidv4(),
              player1: shuffled[shuffled.length - 1],
              player2: "ghost",
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              gamesPlayed: 0,
            });
          }
        }

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, teams, status: "team-generation" }
              : t
          ),
        }));
      },

      manuallyPairPlayers: (tournamentId, player1Id, player2Id) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return;

        const p1 = tournament.players.find((p) => p.id === player1Id);
        const p2 = tournament.players.find((p) => p.id === player2Id);

        if (!p1 || !p2) return;

        const newTeam: TournamentTeam = {
          id: uuidv4(),
          player1: p1,
          player2: p2,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          gamesPlayed: 0,
        };

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, teams: [...t.teams, newTeam] }
              : t
          ),
        }));
      },

      shuffleTeams: (tournamentId) => {
        get().generateBlindDrawTeams(tournamentId);
      },

      // SWITCHOLIO - Generate a round with new pairings
      generateSwitcholioRound: (tournamentId, roundNumber) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return;

        const checkedInPlayers = tournament.players.filter((p) => p.checkedIn);
        const shuffled = shuffleArray(checkedInPlayers);

        const games: SwitcholioGame[] = [];

        // Create games with 4 players each
        for (let i = 0; i < shuffled.length - 3; i += 4) {
          games.push({
            gameNumber: games.length + 1,
            team1Player1: shuffled[i],
            team1Player2: shuffled[i + 1],
            team2Player1: shuffled[i + 2],
            team2Player2: shuffled[i + 3],
            completed: false,
          });
        }

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, switcholioGames: [...t.switcholioGames, ...games] }
              : t
          ),
        }));
      },

      // ROUND ROBIN - Generate full schedule
      generateRoundRobinSchedule: (tournamentId) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return;

        const teams = tournament.teams;
        const matches: RoundRobinMatch[] = [];
        let roundNumber = 1;

        // Generate all possible matchups
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            matches.push({
              id: uuidv4(),
              team1: teams[i],
              team2: teams[j],
              completed: false,
              roundNumber: roundNumber++,
            });
          }
        }

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, roundRobinMatches: matches, status: "round-robin" }
              : t
          ),
        }));
      },

      recordRoundRobinResult: (tournamentId, matchId, team1Score, team2Score) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const updatedMatches = t.roundRobinMatches.map((m) => {
              if (m.id !== matchId) return m;

              const winnerId = team1Score > team2Score ? m.team1.id : m.team2.id;

              return {
                ...m,
                team1Score,
                team2Score,
                winnerId,
                completed: true,
                endTime: new Date().toISOString(),
              };
            });

            // Update team records
            const match = t.roundRobinMatches.find((m) => m.id === matchId);
            if (!match) return { ...t, roundRobinMatches: updatedMatches };

            const updatedTeams = t.teams.map((team) => {
              if (team.id === match.team1.id) {
                return {
                  ...team,
                  wins: team1Score > team2Score ? team.wins + 1 : team.wins,
                  losses: team1Score < team2Score ? team.losses + 1 : team.losses,
                  pointsFor: team.pointsFor + team1Score,
                  pointsAgainst: team.pointsAgainst + team2Score,
                  gamesPlayed: team.gamesPlayed + 1,
                };
              }
              if (team.id === match.team2.id) {
                return {
                  ...team,
                  wins: team2Score > team1Score ? team.wins + 1 : team.wins,
                  losses: team2Score < team1Score ? team.losses + 1 : team.losses,
                  pointsFor: team.pointsFor + team2Score,
                  pointsAgainst: team.pointsAgainst + team1Score,
                  gamesPlayed: team.gamesPlayed + 1,
                };
              }
              return team;
            });

            return { ...t, roundRobinMatches: updatedMatches, teams: updatedTeams };
          }),
        }));
      },

      // BRACKET - Generate single or double elimination
      generateBracket: (tournamentId, eliminationType) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return;

        // Seed teams by wins, then points differential
        const seededTeams = [...tournament.teams].sort((a, b) => {
          const winDiff = b.wins - a.wins;
          if (winDiff !== 0) return winDiff;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });

        // Assign seeds
        seededTeams.forEach((team, index) => {
          team.seed = index + 1;
        });

        const matches: BracketMatch[] = [];
        const numTeams = seededTeams.length;
        const rounds = Math.ceil(Math.log2(numTeams));

        // Generate first round matchups
        let matchNumber = 1;
        for (let i = 0; i < numTeams; i += 2) {
          if (i + 1 < numTeams) {
            matches.push({
              id: uuidv4(),
              roundNumber: rounds,
              matchNumber: matchNumber++,
              team1: seededTeams[i],
              team2: seededTeams[i + 1],
              completed: false,
            });
          }
        }

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, bracketMatches: matches, teams: seededTeams, status: "bracket" }
              : t
          ),
        }));
      },

      recordBracketResult: (tournamentId, matchId, team1Score, team2Score) => {
        // Similar to round robin but advances winner to next match
        // Implementation would handle bracket progression
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const updatedMatches = t.bracketMatches.map((m) => {
              if (m.id !== matchId) return m;

              const winnerId = team1Score > team2Score
                ? (m.team1 && m.team1 !== "TBD" ? m.team1.id : undefined)
                : (m.team2 && m.team2 !== "TBD" ? m.team2.id : undefined);
              const loserId = team1Score < team2Score
                ? (m.team1 && m.team1 !== "TBD" ? m.team1.id : undefined)
                : (m.team2 && m.team2 !== "TBD" ? m.team2.id : undefined);

              return {
                ...m,
                team1Score,
                team2Score,
                winnerId,
                loserId,
                completed: true,
                endTime: new Date().toISOString(),
              };
            });

            return { ...t, bracketMatches: updatedMatches };
          }),
        }));
      },

      createSeason: (name, startDate) => {
        const season: Season = {
          id: uuidv4(),
          name,
          startDate,
          tournamentIds: [],
          active: true,
        };

        set((state) => ({
          seasons: [...state.seasons, season],
        }));

        return season.id;
      },

      addTournamentToSeason: (seasonId, tournamentId) => {
        set((state) => ({
          seasons: state.seasons.map((s) =>
            s.id === seasonId
              ? { ...s, tournamentIds: [...s.tournamentIds, tournamentId] }
              : s
          ),
        }));
      },

      resetTournamentState: () => {
        set({
          tournaments: [],
          seasons: [],
          currentTournamentId: null,
        });
      },
    }),
    {
      name: "tournament-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
