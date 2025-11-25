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
  recordSwitcholioResult: (
    tournamentId: string,
    gameNumber: number,
    team1Score: number,
    team2Score: number
  ) => void;
  getSwitcholioLeaderboard: (tournamentId: string) => Array<{
    player: TournamentPlayer;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    gamesPlayed: number;
  }>;

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
            gameNumber: tournament.switcholioGames.length + games.length + 1,
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
              ? { ...t, switcholioGames: [...t.switcholioGames, ...games], status: "round-robin" }
              : t
          ),
        }));
      },

      recordSwitcholioResult: (tournamentId, gameNumber, team1Score, team2Score) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const updatedGames = t.switcholioGames.map((g) => {
              if (g.gameNumber !== gameNumber) return g;

              // Determine winning team players
              const winningPlayerIds = team1Score > team2Score
                ? [g.team1Player1.id, g.team1Player2.id]
                : [g.team2Player1.id, g.team2Player2.id];

              return {
                ...g,
                team1Score,
                team2Score,
                winnerId: winningPlayerIds.join(","),
                completed: true,
                endTime: new Date().toISOString(),
              };
            });

            return { ...t, switcholioGames: updatedGames };
          }),
        }));
      },

      getSwitcholioLeaderboard: (tournamentId) => {
        const tournament = get().getTournament(tournamentId);
        if (!tournament) return [];

        const playerStats = new Map<string, {
          player: TournamentPlayer;
          wins: number;
          losses: number;
          pointsFor: number;
          pointsAgainst: number;
          gamesPlayed: number;
        }>();

        // Initialize stats for all players
        tournament.players.forEach((player) => {
          playerStats.set(player.id, {
            player,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            gamesPlayed: 0,
          });
        });

        // Calculate stats from completed games
        tournament.switcholioGames.forEach((game) => {
          if (!game.completed || game.team1Score === undefined || game.team2Score === undefined) return;

          const team1Won = game.team1Score > game.team2Score;
          const t1Score = game.team1Score;
          const t2Score = game.team2Score;

          // Update team 1 players
          [game.team1Player1, game.team1Player2].forEach((player) => {
            const stats = playerStats.get(player.id);
            if (stats) {
              stats.gamesPlayed += 1;
              stats.pointsFor += t1Score;
              stats.pointsAgainst += t2Score;
              if (team1Won) {
                stats.wins += 1;
              } else {
                stats.losses += 1;
              }
            }
          });

          // Update team 2 players
          [game.team2Player1, game.team2Player2].forEach((player) => {
            const stats = playerStats.get(player.id);
            if (stats) {
              stats.gamesPlayed += 1;
              stats.pointsFor += t2Score;
              stats.pointsAgainst += t1Score;
              if (!team1Won) {
                stats.wins += 1;
              } else {
                stats.losses += 1;
              }
            }
          });
        });

        // Convert to array and sort by wins, then point differential
        return Array.from(playerStats.values())
          .filter((stats) => stats.gamesPlayed > 0)
          .sort((a, b) => {
            const winDiff = b.wins - a.wins;
            if (winDiff !== 0) return winDiff;
            return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
          });
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

        // Calculate next power of 2 for bracket size
        const bracketSize = Math.pow(2, rounds);
        const numByes = bracketSize - numTeams;

        if (eliminationType === "single") {
          // Generate ALL rounds of the bracket
          for (let round = rounds; round >= 1; round--) {
            const matchesInRound = Math.pow(2, round - 1);

            for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
              const matchId = uuidv4();
              const match: BracketMatch = {
                id: matchId,
                roundNumber: round,
                matchNumber: matchNum,
                completed: false,
              };

              // Only assign teams to first round
              if (round === rounds) {
                const team1Index = (matchNum - 1) * 2;
                const team2Index = team1Index + 1;

                // Assign teams or TBD (for byes)
                if (team1Index < numTeams) {
                  match.team1 = seededTeams[team1Index];
                } else {
                  match.team1 = "TBD";
                }

                if (team2Index < numTeams) {
                  match.team2 = seededTeams[team2Index];
                } else {
                  match.team2 = "TBD";
                }

                // Auto-complete bye matches
                if (match.team1 === "TBD" || match.team2 === "TBD") {
                  match.completed = true;
                  if (match.team1 !== "TBD") {
                    match.winnerId = match.team1.id;
                    match.team1Score = 0;
                    match.team2Score = 0;
                  } else if (match.team2 !== "TBD") {
                    match.winnerId = match.team2.id;
                    match.team1Score = 0;
                    match.team2Score = 0;
                  }
                }
              } else {
                match.team1 = "TBD";
                match.team2 = "TBD";
              }

              // Link to next round match
              if (round > 1) {
                const nextMatchNumber = Math.ceil(matchNum / 2);
                match.nextMatchId = `R${round - 1}M${nextMatchNumber}`;
              }

              matches.push(match);
            }
          }

          // Replace temporary IDs with actual match IDs
          matches.forEach((match) => {
            if (match.nextMatchId) {
              const [, roundStr, matchStr] = match.nextMatchId.match(/R(\d+)M(\d+)/) || [];
              if (roundStr && matchStr) {
                const nextMatch = matches.find(
                  (m) => m.roundNumber === parseInt(roundStr) && m.matchNumber === parseInt(matchStr)
                );
                if (nextMatch) {
                  match.nextMatchId = nextMatch.id;
                }
              }
            }
          });

          // Auto-advance bye winners to next round
          matches.forEach((match) => {
            if (match.completed && match.winnerId && match.nextMatchId) {
              const nextMatch = matches.find((m) => m.id === match.nextMatchId);
              if (nextMatch) {
                const winningTeam = seededTeams.find((t) => t.id === match.winnerId);
                if (winningTeam) {
                  if (nextMatch.team1 === "TBD") {
                    nextMatch.team1 = winningTeam;
                  } else if (nextMatch.team2 === "TBD") {
                    nextMatch.team2 = winningTeam;
                  }
                }
              }
            }
          });
        } else {
          // DOUBLE ELIMINATION
          // Winners bracket
          const winnersBracketMatches: BracketMatch[] = [];
          const losersBracketMatches: BracketMatch[] = [];

          // Generate winners bracket (same as single elimination)
          for (let round = rounds; round >= 1; round--) {
            const matchesInRound = Math.pow(2, round - 1);

            for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
              const matchId = uuidv4();
              const match: BracketMatch = {
                id: matchId,
                roundNumber: round,
                matchNumber: matchNum,
                completed: false,
              };

              if (round === rounds) {
                const team1Index = (matchNum - 1) * 2;
                const team2Index = team1Index + 1;

                if (team1Index < numTeams) {
                  match.team1 = seededTeams[team1Index];
                } else {
                  match.team1 = "TBD";
                }

                if (team2Index < numTeams) {
                  match.team2 = seededTeams[team2Index];
                } else {
                  match.team2 = "TBD";
                }

                if (match.team1 === "TBD" || match.team2 === "TBD") {
                  match.completed = true;
                  if (match.team1 !== "TBD") {
                    match.winnerId = match.team1.id;
                    match.team1Score = 0;
                    match.team2Score = 0;
                  } else if (match.team2 !== "TBD") {
                    match.winnerId = match.team2.id;
                    match.team1Score = 0;
                    match.team2Score = 0;
                  }
                }
              } else {
                match.team1 = "TBD";
                match.team2 = "TBD";
              }

              if (round > 1) {
                const nextMatchNumber = Math.ceil(matchNum / 2);
                match.nextMatchId = `WR${round - 1}M${nextMatchNumber}`;
                match.loserNextMatchId = `LR${round}M${matchNum}`;
              } else {
                // Winners bracket champion goes to grand finals
                match.nextMatchId = "GRAND_FINALS";
              }

              winnersBracketMatches.push(match);
            }
          }

          // Generate losers bracket
          // Losers bracket has 2x rounds - 1 (one less than double the winners rounds)
          const loserRounds = rounds * 2 - 1;

          for (let round = loserRounds; round >= 1; round--) {
            // Losers bracket structure alternates between:
            // - Rounds where new losers from winners bracket join
            // - Rounds where losers bracket players face each other

            let matchesInRound: number;

            if (round % 2 === loserRounds % 2) {
              // New losers joining from winners bracket
              matchesInRound = Math.pow(2, Math.floor((loserRounds - round) / 2));
            } else {
              // Losers bracket internal matches
              matchesInRound = Math.pow(2, Math.floor((loserRounds - round) / 2));
            }

            for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
              const matchId = uuidv4();
              const match: BracketMatch = {
                id: matchId,
                roundNumber: round + 100, // Offset to distinguish from winners bracket
                matchNumber: matchNum,
                team1: "TBD",
                team2: "TBD",
                completed: false,
              };

              if (round > 1) {
                const nextMatchNumber = Math.ceil(matchNum / 2);
                match.nextMatchId = `LR${round - 1}M${nextMatchNumber}`;
              } else {
                // Losers bracket champion goes to grand finals
                match.nextMatchId = "GRAND_FINALS";
              }

              losersBracketMatches.push(match);
            }
          }

          // Create grand finals match
          const grandFinalsMatch: BracketMatch = {
            id: uuidv4(),
            roundNumber: 0, // Special round number for grand finals
            matchNumber: 1,
            team1: "TBD", // Winner of winners bracket
            team2: "TBD", // Winner of losers bracket
            completed: false,
          };

          const allMatches = [...winnersBracketMatches, ...losersBracketMatches, grandFinalsMatch];

          // Replace temporary IDs with actual match IDs
          allMatches.forEach((match) => {
            if (match.nextMatchId && match.nextMatchId !== "GRAND_FINALS") {
              const [, bracketType, roundStr, matchStr] =
                match.nextMatchId.match(/([WL])R(\d+)M(\d+)/) || [];

              if (roundStr && matchStr) {
                const targetRound =
                  bracketType === "L"
                    ? parseInt(roundStr) + 100
                    : parseInt(roundStr);

                const nextMatch = allMatches.find(
                  (m) =>
                    m.roundNumber === targetRound &&
                    m.matchNumber === parseInt(matchStr)
                );

                if (nextMatch) {
                  match.nextMatchId = nextMatch.id;
                }
              }
            } else if (match.nextMatchId === "GRAND_FINALS") {
              match.nextMatchId = grandFinalsMatch.id;
            }

            if (match.loserNextMatchId) {
              const [, , roundStr, matchStr] =
                match.loserNextMatchId.match(/([WL])R(\d+)M(\d+)/) || [];

              if (roundStr && matchStr) {
                const targetRound = parseInt(roundStr) + 100;

                const nextMatch = allMatches.find(
                  (m) =>
                    m.roundNumber === targetRound &&
                    m.matchNumber === parseInt(matchStr)
                );

                if (nextMatch) {
                  match.loserNextMatchId = nextMatch.id;
                }
              }
            }
          });

          // Auto-advance bye winners
          allMatches.forEach((match) => {
            if (match.completed && match.winnerId && match.nextMatchId) {
              const nextMatch = allMatches.find((m) => m.id === match.nextMatchId);
              if (nextMatch) {
                const winningTeam = seededTeams.find((t) => t.id === match.winnerId);
                if (winningTeam) {
                  if (nextMatch.team1 === "TBD") {
                    nextMatch.team1 = winningTeam;
                  } else if (nextMatch.team2 === "TBD") {
                    nextMatch.team2 = winningTeam;
                  }
                }
              }
            }
          });

          set((state) => ({
            tournaments: state.tournaments.map((t) =>
              t.id === tournamentId
                ? { ...t, bracketMatches: allMatches, teams: seededTeams, status: "bracket" }
                : t
            ),
          }));

          return;
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
        set((state) => ({
          tournaments: state.tournaments.map((t) => {
            if (t.id !== tournamentId) return t;

            const updatedMatches = [...t.bracketMatches];
            const matchIndex = updatedMatches.findIndex((m) => m.id === matchId);

            if (matchIndex === -1) return t;

            const match = updatedMatches[matchIndex];

            // Determine winner and loser
            const winnerId = team1Score > team2Score
              ? (match.team1 && match.team1 !== "TBD" ? match.team1.id : undefined)
              : (match.team2 && match.team2 !== "TBD" ? match.team2.id : undefined);

            const loserId = team1Score < team2Score
              ? (match.team1 && match.team1 !== "TBD" ? match.team1.id : undefined)
              : (match.team2 && match.team2 !== "TBD" ? match.team2.id : undefined);

            const winningTeam = team1Score > team2Score ? match.team1 : match.team2;
            const losingTeam = team1Score < team2Score ? match.team1 : match.team2;

            // Update the current match
            updatedMatches[matchIndex] = {
              ...match,
              team1Score,
              team2Score,
              winnerId,
              loserId,
              completed: true,
              endTime: new Date().toISOString(),
            };

            // Advance winner to next match if there is one
            if (match.nextMatchId && winningTeam && winningTeam !== "TBD") {
              const nextMatchIndex = updatedMatches.findIndex((m) => m.id === match.nextMatchId);

              if (nextMatchIndex !== -1) {
                const nextMatch = updatedMatches[nextMatchIndex];

                // Determine if winner goes to team1 or team2 slot
                // Even match numbers go to team1, odd go to team2
                if (match.matchNumber % 2 === 1) {
                  updatedMatches[nextMatchIndex] = {
                    ...nextMatch,
                    team1: winningTeam,
                  };
                } else {
                  updatedMatches[nextMatchIndex] = {
                    ...nextMatch,
                    team2: winningTeam,
                  };
                }
              }
            }

            // Send loser to losers bracket (double elimination only)
            if (match.loserNextMatchId && losingTeam && losingTeam !== "TBD") {
              const loserNextMatchIndex = updatedMatches.findIndex(
                (m) => m.id === match.loserNextMatchId
              );

              if (loserNextMatchIndex !== -1) {
                const loserNextMatch = updatedMatches[loserNextMatchIndex];

                // Place losing team in next available slot
                if (loserNextMatch.team1 === "TBD") {
                  updatedMatches[loserNextMatchIndex] = {
                    ...loserNextMatch,
                    team1: losingTeam,
                  };
                } else if (loserNextMatch.team2 === "TBD") {
                  updatedMatches[loserNextMatchIndex] = {
                    ...loserNextMatch,
                    team2: losingTeam,
                  };
                }
              }
            }

            // Check if tournament is complete
            // For single elim: finals match (round 1) completed
            // For double elim: grand finals (round 0) completed
            const finalsMatch = updatedMatches.find((m) => m.roundNumber === 1 || m.roundNumber === 0);
            const tournamentComplete = finalsMatch?.roundNumber === 0
              ? finalsMatch?.completed // Double elim: grand finals
              : updatedMatches.every((m) => m.roundNumber !== 0) && finalsMatch?.completed; // Single elim: no round 0 exists

            return {
              ...t,
              bracketMatches: updatedMatches,
              status: tournamentComplete ? "completed" : t.status,
              winnerId: tournamentComplete ? finalsMatch?.winnerId : t.winnerId,
              completedAt: tournamentComplete ? new Date().toISOString() : t.completedAt,
            };
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
