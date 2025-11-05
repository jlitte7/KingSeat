import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  Team,
  Game,
  Series,
  Tournament,
  PracticeSession,
  Round,
  Achievement,
  AchievementType,
} from '../types/toss-series';

interface TossSeriesState {
  teams: Team[];
  players: Player[];
  games: Game[];
  series: Series[];
  tournaments: Tournament[];
  practiceSessions: PracticeSession[];
  currentSeries: Series | null;

  // Team actions
  createTeam: (name: string, logo?: string) => Team;
  deleteTeam: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;

  // Player actions
  createPlayer: (teamId: string, name: string, nickname?: string, photo?: string) => Player;
  deletePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;

  // Series actions
  createSeries: (homeTeamId: string, awayTeamId: string) => Series;
  setCurrentSeries: (series: Series | null) => void;
  addGameToSeries: (seriesId: string, game: Game) => void;
  completeSeries: (seriesId: string) => void;

  // Game actions
  createGame: (player1Id: string, player2Id: string, seriesId?: string) => Game;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  addRoundToGame: (gameId: string, round: Round) => void;
  completeGame: (gameId: string, winnerId: string) => void;

  // Stats actions
  updatePlayerStats: (playerId: string, game: Game) => void;
  checkAndAwardAchievements: (playerId: string, game: Game) => void;

  // Practice actions
  createPracticeSession: (playerId: string) => PracticeSession;

  // Tournament actions
  createTournament: (name: string, teamIds: string[]) => Tournament;

  // Utility
  getTeamById: (teamId: string) => Team | undefined;
  getPlayerById: (playerId: string) => Player | undefined;
  getSeriesById: (seriesId: string) => Series | undefined;
  getGameById: (gameId: string) => Game | undefined;
  resetAll: () => void;
}

const initialPlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
  totalBagsIn: 0,
  totalBagsOn: 0,
  totalBagsThrown: 0,
  fourBaggers: 0,
  comebackWins: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  averagePointsPerRound: 0,
  bagsInPercentage: 0,
  bagsOnPercentage: 0,
};

const initialTeamStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
};

export const useTossSeriesStore = create<TossSeriesState>()(
  persist(
    (set, get) => ({
      teams: [],
      players: [],
      games: [],
      series: [],
      tournaments: [],
      practiceSessions: [],
      currentSeries: null,

      createTeam: (name: string, logo?: string) => {
        const team: Team = {
          id: uuidv4(),
          name,
          logo,
          players: [],
          stats: { ...initialTeamStats },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ teams: [...state.teams, team] }));
        return team;
      },

      deleteTeam: (teamId: string) => {
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== teamId),
          players: state.players.filter((p) => p.teamId !== teamId),
        }));
      },

      updateTeam: (teamId: string, updates: Partial<Team>) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
        }));
      },

      createPlayer: (teamId: string, name: string, nickname?: string, photo?: string) => {
        const player: Player = {
          id: uuidv4(),
          name,
          nickname,
          photo,
          teamId,
          stats: { ...initialPlayerStats },
          achievements: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          players: [...state.players, player],
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, players: [...t.players, player] } : t
          ),
        }));
        return player;
      },

      deletePlayer: (playerId: string) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
          teams: state.teams.map((t) =>
            t.id === player.teamId
              ? { ...t, players: t.players.filter((p) => p.id !== playerId) }
              : t
          ),
        }));
      },

      updatePlayer: (playerId: string, updates: Partial<Player>) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
        }));
      },

      createSeries: (homeTeamId: string, awayTeamId: string) => {
        const homeTeam = get().getTeamById(homeTeamId);
        const awayTeam = get().getTeamById(awayTeamId);

        if (!homeTeam || !awayTeam) {
          throw new Error('Teams not found');
        }

        const series: Series = {
          id: uuidv4(),
          homeTeamId,
          awayTeamId,
          homeTeamName: homeTeam.name,
          awayTeamName: awayTeam.name,
          games: [],
          currentGameIndex: 0,
          homeTeamScore: 0,
          awayTeamScore: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ series: [...state.series, series] }));
        return series;
      },

      setCurrentSeries: (series: Series | null) => {
        set({ currentSeries: series });
      },

      addGameToSeries: (seriesId: string, game: Game) => {
        set((state) => ({
          series: state.series.map((s) =>
            s.id === seriesId ? { ...s, games: [...s.games, game] } : s
          ),
        }));
      },

      completeSeries: (seriesId: string) => {
        set((state) => ({
          series: state.series.map((s) =>
            s.id === seriesId
              ? { ...s, completed: true, completedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      createGame: (player1Id: string, player2Id: string, seriesId?: string) => {
        const player1 = get().getPlayerById(player1Id);
        const player2 = get().getPlayerById(player2Id);

        if (!player1 || !player2) {
          throw new Error('Players not found');
        }

        const game: Game = {
          id: uuidv4(),
          player1Id,
          player2Id,
          player1Name: player1.name,
          player2Name: player2.name,
          player1Score: 0,
          player2Score: 0,
          rounds: [],
          completed: false,
          seriesId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ games: [...state.games, game] }));
        return game;
      },

      updateGame: (gameId: string, updates: Partial<Game>) => {
        set((state) => ({
          games: state.games.map((g) => (g.id === gameId ? { ...g, ...updates } : g)),
        }));
      },

      addRoundToGame: (gameId: string, round: Round) => {
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: [...g.rounds, round],
                  player1Score: g.player1Score + round.p1Score,
                  player2Score: g.player2Score + round.p2Score,
                }
              : g
          ),
        }));
      },

      completeGame: (gameId: string, winnerId: string) => {
        const game = get().getGameById(gameId);
        if (!game) return;

        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  winnerId,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : g
          ),
        }));

        // Update player stats
        get().updatePlayerStats(game.player1Id, { ...game, winnerId });
        get().updatePlayerStats(game.player2Id, { ...game, winnerId });

        // Check achievements
        get().checkAndAwardAchievements(game.player1Id, { ...game, winnerId });
        get().checkAndAwardAchievements(game.player2Id, { ...game, winnerId });

        // Update series if applicable
        if (game.seriesId) {
          const series = get().getSeriesById(game.seriesId);
          if (series) {
            const player1 = get().getPlayerById(game.player1Id);
            const player2 = get().getPlayerById(game.player2Id);

            if (player1 && player2) {
              const isHomeTeamWinner = player1.teamId === series.homeTeamId && winnerId === game.player1Id;
              const isAwayTeamWinner = player1.teamId === series.awayTeamId && winnerId === game.player1Id;

              set((state) => ({
                series: state.series.map((s) =>
                  s.id === game.seriesId
                    ? {
                        ...s,
                        homeTeamScore:
                          isHomeTeamWinner
                            ? s.homeTeamScore + 1
                            : isAwayTeamWinner
                            ? s.homeTeamScore
                            : s.homeTeamScore + (winnerId === game.player2Id && player2.teamId === s.homeTeamId ? 1 : 0),
                        awayTeamScore:
                          isAwayTeamWinner
                            ? s.awayTeamScore + 1
                            : isHomeTeamWinner
                            ? s.awayTeamScore
                            : s.awayTeamScore + (winnerId === game.player2Id && player2.teamId === s.awayTeamId ? 1 : 0),
                      }
                    : s
                ),
              }));
            }
          }
        }
      },

      updatePlayerStats: (playerId: string, game: Game) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        const isPlayer1 = game.player1Id === playerId;
        const isWinner = game.winnerId === playerId;
        const playerScore = isPlayer1 ? game.player1Score : game.player2Score;

        const totalBagsIn = game.rounds.reduce(
          (sum, r) => sum + (isPlayer1 ? r.p1In : r.p2In),
          0
        );
        const totalBagsOn = game.rounds.reduce(
          (sum, r) => sum + (isPlayer1 ? r.p1On : r.p2On),
          0
        );
        const totalBagsThrown = game.rounds.length * 4;
        const fourBaggers = game.rounds.filter((r) =>
          isPlayer1 ? r.p1In === 4 : r.p2In === 4
        ).length;

        const newStats = {
          ...player.stats,
          totalGames: player.stats.totalGames + 1,
          totalWins: isWinner ? player.stats.totalWins + 1 : player.stats.totalWins,
          totalLosses: !isWinner ? player.stats.totalLosses + 1 : player.stats.totalLosses,
          totalPoints: player.stats.totalPoints + playerScore,
          totalBagsIn: player.stats.totalBagsIn + totalBagsIn,
          totalBagsOn: player.stats.totalBagsOn + totalBagsOn,
          totalBagsThrown: player.stats.totalBagsThrown + totalBagsThrown,
          fourBaggers: player.stats.fourBaggers + fourBaggers,
          currentWinStreak: isWinner ? player.stats.currentWinStreak + 1 : 0,
        };

        newStats.longestWinStreak = Math.max(
          newStats.currentWinStreak,
          player.stats.longestWinStreak
        );
        newStats.averagePointsPerRound =
          newStats.totalGames > 0 ? newStats.totalPoints / newStats.totalGames : 0;
        newStats.bagsInPercentage =
          newStats.totalBagsThrown > 0
            ? (newStats.totalBagsIn / newStats.totalBagsThrown) * 100
            : 0;
        newStats.bagsOnPercentage =
          newStats.totalBagsThrown > 0
            ? (newStats.totalBagsOn / newStats.totalBagsThrown) * 100
            : 0;

        get().updatePlayer(playerId, { stats: newStats });
      },

      checkAndAwardAchievements: (playerId: string, game: Game) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        const newAchievements: Achievement[] = [];
        const isPlayer1 = game.player1Id === playerId;
        const isWinner = game.winnerId === playerId;

        // First win
        if (player.stats.totalWins === 0 && isWinner) {
          newAchievements.push({
            id: uuidv4(),
            type: 'first_win',
            title: 'First Blood',
            description: 'Win your first game',
            icon: '🎯',
            earnedAt: new Date().toISOString(),
          });
        }

        // Four bagger in this game
        const hasFourBagger = game.rounds.some((r) =>
          isPlayer1 ? r.p1In === 4 : r.p2In === 4
        );
        if (hasFourBagger) {
          newAchievements.push({
            id: uuidv4(),
            type: 'four_bagger',
            title: 'Four Bagger!',
            description: 'Get all 4 bags in the hole in one round',
            icon: '🔥',
            earnedAt: new Date().toISOString(),
          });
        }

        // Comeback win (behind by 10+ points)
        if (isWinner) {
          const maxDeficit = game.rounds.reduce((max, _, idx) => {
            const p1Score = game.rounds
              .slice(0, idx + 1)
              .reduce((s, r) => s + r.p1Score, 0);
            const p2Score = game.rounds
              .slice(0, idx + 1)
              .reduce((s, r) => s + r.p2Score, 0);
            const deficit = isPlayer1 ? p2Score - p1Score : p1Score - p2Score;
            return Math.max(max, deficit);
          }, 0);

          if (maxDeficit >= 10) {
            newAchievements.push({
              id: uuidv4(),
              type: 'comeback_win',
              title: 'The Comeback Kid',
              description: 'Win after being down by 10+ points',
              icon: '💪',
              earnedAt: new Date().toISOString(),
            });
          }
        }

        // Win streak
        if (player.stats.currentWinStreak === 5) {
          newAchievements.push({
            id: uuidv4(),
            type: 'win_streak',
            title: 'On Fire!',
            description: 'Win 5 games in a row',
            icon: '🔥',
            earnedAt: new Date().toISOString(),
          });
        }

        // Shutout (opponent scores 0)
        const opponentScore = isPlayer1 ? game.player2Score : game.player1Score;
        if (isWinner && opponentScore === 0) {
          newAchievements.push({
            id: uuidv4(),
            type: 'shutout',
            title: 'Shutout!',
            description: "Win without letting your opponent score",
            icon: '🛡️',
            earnedAt: new Date().toISOString(),
          });
        }

        if (newAchievements.length > 0) {
          get().updatePlayer(playerId, {
            achievements: [...player.achievements, ...newAchievements],
          });
        }
      },

      createPracticeSession: (playerId: string) => {
        const session: PracticeSession = {
          id: uuidv4(),
          playerId,
          drills: [],
          totalBagsThrown: 0,
          totalBagsIn: 0,
          totalBagsOn: 0,
          duration: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ practiceSessions: [...state.practiceSessions, session] }));
        return session;
      },

      createTournament: (name: string, teamIds: string[]) => {
        const tournament: Tournament = {
          id: uuidv4(),
          name,
          teams: teamIds,
          bracket: { rounds: [] },
          currentRound: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tournaments: [...state.tournaments, tournament] }));
        return tournament;
      },

      getTeamById: (teamId: string) => {
        return get().teams.find((t) => t.id === teamId);
      },

      getPlayerById: (playerId: string) => {
        return get().players.find((p) => p.id === playerId);
      },

      getSeriesById: (seriesId: string) => {
        return get().series.find((s) => s.id === seriesId);
      },

      getGameById: (gameId: string) => {
        return get().games.find((g) => g.id === gameId);
      },

      resetAll: () => {
        set({
          teams: [],
          players: [],
          games: [],
          series: [],
          tournaments: [],
          practiceSessions: [],
          currentSeries: null,
        });
      },
    }),
    {
      name: 'toss-series-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        teams: state.teams,
        players: state.players,
        games: state.games,
        series: state.series,
        tournaments: state.tournaments,
        practiceSessions: state.practiceSessions,
      }),
    }
  )
);
