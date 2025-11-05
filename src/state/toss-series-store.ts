import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import {
  Player,
  Team,
  Game,
  Series,
  Tournament,
  PracticeSession,
  Round,
  Achievement,
  PlayerStats,
  TeamStats,
} from "../types/toss-series";

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
  getTeamById: (teamId: string) => Team | undefined;

  // Player actions
  createPlayer: (
    teamId: string,
    name: string,
    nickname?: string,
    photo?: string
  ) => Player;
  deletePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  getPlayerById: (playerId: string) => Player | undefined;

  // Series actions
  createSeries: (homeTeamId: string, awayTeamId: string) => Series;
  setCurrentSeries: (series: Series | null) => void;
  addGameToSeries: (seriesId: string, game: Game) => void;
  completeSeries: (seriesId: string) => void;
  getSeriesById: (seriesId: string) => Series | undefined;

  // Game actions
  createGame: (player1Id: string, player2Id: string, seriesId?: string) => Game;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  addRoundToGame: (gameId: string, round: Round) => void;
  completeGame: (gameId: string, winnerId: string) => void;
  getGameById: (gameId: string) => Game | undefined;

  // Stats actions
  updatePlayerStats: (playerId: string, game: Game) => void;
  checkAndAwardAchievements: (playerId: string, game: Game) => void;

  // Practice actions
  createPracticeSession: (playerId: string) => PracticeSession;

  // Tournament actions
  createTournament: (name: string, teamIds: string[]) => Tournament;

  // Utility
  resetAll: () => void;
  generateSampleData: () => void;
}

const createInitialPlayerStats = (): PlayerStats => ({
  // Core Stats
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
  totalBagsIn: 0,
  totalBagsOn: 0,
  totalBagsThrown: 0,

  // Accuracy & Efficiency
  bagsInPercentage: 0,
  bagsOnPercentage: 0,
  boardPercentage: 0,
  missPercentage: 0,
  threeBaggerRate: 0,
  fourBaggers: 0,
  fourBaggerRate: 0,

  // Scoring Performance
  averagePointsPerRound: 0,
  averagePointsPerGame: 0,
  highestGameScore: 0,
  shutoutWins: 0,
  dominantWins: 0,
  closeWins: 0,

  // Momentum & Consistency
  comebackWins: 0,
  comebacksFrom10Plus: 0,
  blowoutLosses: 0,
  closeLosses: 0,
  perfectRounds: 0,
  zeroPointRounds: 0,

  // Win Streaks & Patterns
  longestWinStreak: 0,
  currentWinStreak: 0,
  longestLosingStreak: 0,
  currentLosingStreak: 0,

  // Head-to-Head Performance
  totalOpponents: 0,

  // Advanced Metrics
  clutchFactor: 0,
  consistency: 0,
  winPercentage: 0,
  dominanceRating: 0,
});

const createInitialTeamStats = (): TeamStats => ({
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
});

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

      // Team actions
      createTeam: (name: string, logo?: string) => {
        const team: Team = {
          id: uuidv4(),
          name,
          logo,
          players: [],
          stats: createInitialTeamStats(),
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
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, ...updates } : t
          ),
        }));
      },

      getTeamById: (teamId: string) => {
        return get().teams.find((t) => t.id === teamId);
      },

      // Player actions
      createPlayer: (
        teamId: string,
        name: string,
        nickname?: string,
        photo?: string
      ) => {
        const player: Player = {
          id: uuidv4(),
          name,
          nickname,
          photo,
          teamId,
          stats: createInitialPlayerStats(),
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
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
          teams: state.teams.map((t) => ({
            ...t,
            players: t.players.map((p) =>
              p.id === playerId ? { ...p, ...updates } : p
            ),
          })),
        }));
      },

      getPlayerById: (playerId: string) => {
        return get().players.find((p) => p.id === playerId);
      },

      // Series actions
      createSeries: (homeTeamId: string, awayTeamId: string) => {
        const homeTeam = get().getTeamById(homeTeamId);
        const awayTeam = get().getTeamById(awayTeamId);

        if (!homeTeam || !awayTeam) {
          throw new Error("Teams not found");
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

      getSeriesById: (seriesId: string) => {
        return get().series.find((s) => s.id === seriesId);
      },

      // Game actions
      createGame: (player1Id: string, player2Id: string, seriesId?: string) => {
        const player1 = get().getPlayerById(player1Id);
        const player2 = get().getPlayerById(player2Id);

        if (!player1 || !player2) {
          throw new Error("Players not found");
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
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, ...updates } : g
          ),
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

        const updatedGame = {
          ...game,
          winnerId,
          completed: true,
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          games: state.games.map((g) => (g.id === gameId ? updatedGame : g)),
        }));

        // Update player stats
        get().updatePlayerStats(game.player1Id, updatedGame);
        get().updatePlayerStats(game.player2Id, updatedGame);

        // Check achievements
        get().checkAndAwardAchievements(game.player1Id, updatedGame);
        get().checkAndAwardAchievements(game.player2Id, updatedGame);

        // Update series if applicable
        if (game.seriesId) {
          const series = get().getSeriesById(game.seriesId);
          if (series) {
            const player1 = get().getPlayerById(game.player1Id);
            const player2 = get().getPlayerById(game.player2Id);

            if (player1 && player2) {
              const winner = winnerId === game.player1Id ? player1 : player2;

              set((state) => ({
                series: state.series.map((s) =>
                  s.id === game.seriesId
                    ? {
                        ...s,
                        homeTeamScore:
                          winner.teamId === s.homeTeamId
                            ? s.homeTeamScore + 1
                            : s.homeTeamScore,
                        awayTeamScore:
                          winner.teamId === s.awayTeamId
                            ? s.awayTeamScore + 1
                            : s.awayTeamScore,
                      }
                    : s
                ),
              }));
            }
          }
        }
      },

      getGameById: (gameId: string) => {
        return get().games.find((g) => g.id === gameId);
      },

      // Stats actions
      updatePlayerStats: (playerId: string, game: Game) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        const isPlayer1 = game.player1Id === playerId;
        const isWinner = game.winnerId === playerId;
        const playerScore = isPlayer1 ? game.player1Score : game.player2Score;
        const opponentScore = isPlayer1 ? game.player2Score : game.player1Score;
        const opponentId = isPlayer1 ? game.player2Id : game.player1Id;

        // Calculate game-specific stats
        const totalBagsIn = game.rounds.reduce(
          (sum, r) => sum + (isPlayer1 ? r.p1In : r.p2In),
          0
        );
        const totalBagsOn = game.rounds.reduce(
          (sum, r) => sum + (isPlayer1 ? r.p1On : r.p2On),
          0
        );
        const totalBagsThrown = game.rounds.length * 4;
        const totalBagsOnBoard = totalBagsIn + totalBagsOn;
        const totalBagsMissed = totalBagsThrown - totalBagsOnBoard;

        // Round-specific calculations
        const fourBaggers = game.rounds.filter((r) =>
          isPlayer1 ? r.p1In === 4 : r.p2In === 4
        ).length;
        const threeBaggers = game.rounds.filter((r) =>
          isPlayer1 ? r.p1In === 3 : r.p2In === 3
        ).length;
        const perfectRounds = fourBaggers;
        const zeroPointRounds = game.rounds.filter((r) =>
          isPlayer1 ? r.p1Score === 0 : r.p2Score === 0
        ).length;

        // Win/Loss analysis
        const scoreDiff = Math.abs(playerScore - opponentScore);
        const isShutout = isWinner && opponentScore === 0;
        const isDominant = isWinner && scoreDiff >= 10;
        const isClose = scoreDiff <= 3;

        // Comeback detection
        let maxDeficit = 0;
        let runningP1Score = 0;
        let runningP2Score = 0;
        game.rounds.forEach((round) => {
          runningP1Score += round.p1Score;
          runningP2Score += round.p2Score;
          const deficit = isPlayer1
            ? runningP2Score - runningP1Score
            : runningP1Score - runningP2Score;
          maxDeficit = Math.max(maxDeficit, deficit);
        });
        const isComebackWin = isWinner && maxDeficit > 0;
        const isComebackFrom10Plus = isWinner && maxDeficit >= 10;

        // Update cumulative stats
        const newTotalGames = player.stats.totalGames + 1;
        const newTotalWins = isWinner ? player.stats.totalWins + 1 : player.stats.totalWins;
        const newTotalLosses = !isWinner ? player.stats.totalLosses + 1 : player.stats.totalLosses;
        const newTotalPoints = player.stats.totalPoints + playerScore;
        const newTotalBagsIn = player.stats.totalBagsIn + totalBagsIn;
        const newTotalBagsOn = player.stats.totalBagsOn + totalBagsOn;
        const newTotalBagsThrown = player.stats.totalBagsThrown + totalBagsThrown;
        const newFourBaggers = player.stats.fourBaggers + fourBaggers;
        const newPerfectRounds = player.stats.perfectRounds + perfectRounds;
        const newZeroPointRounds = player.stats.zeroPointRounds + zeroPointRounds;

        // Win/Loss streaks
        const newCurrentWinStreak = isWinner ? player.stats.currentWinStreak + 1 : 0;
        const newCurrentLosingStreak = !isWinner ? player.stats.currentLosingStreak + 1 : 0;
        const newLongestWinStreak = Math.max(newCurrentWinStreak, player.stats.longestWinStreak);
        const newLongestLosingStreak = Math.max(newCurrentLosingStreak, player.stats.longestLosingStreak);

        // Conditional counters
        const newShutoutWins = player.stats.shutoutWins + (isShutout ? 1 : 0);
        const newDominantWins = player.stats.dominantWins + (isDominant ? 1 : 0);
        const newCloseWins = player.stats.closeWins + (isWinner && isClose ? 1 : 0);
        const newCloseLosses = player.stats.closeLosses + (!isWinner && isClose ? 1 : 0);
        const newBlowoutLosses = player.stats.blowoutLosses + (!isWinner && scoreDiff >= 10 ? 1 : 0);
        const newComebackWins = player.stats.comebackWins + (isComebackWin ? 1 : 0);
        const newComebacksFrom10Plus = player.stats.comebacksFrom10Plus + (isComebackFrom10Plus ? 1 : 0);
        const newHighestGameScore = Math.max(playerScore, player.stats.highestGameScore);

        // Track unique opponents
        const playerGames = get().games.filter((g) =>
          g.completed && (g.player1Id === playerId || g.player2Id === playerId)
        );
        const uniqueOpponents = new Set(
          playerGames.map((g) => g.player1Id === playerId ? g.player2Id : g.player1Id)
        );
        const newTotalOpponents = uniqueOpponents.size;

        // Calculate percentages and averages
        const bagsInPct = newTotalBagsThrown > 0 ? (newTotalBagsIn / newTotalBagsThrown) * 100 : 0;
        const bagsOnPct = newTotalBagsThrown > 0 ? (newTotalBagsOn / newTotalBagsThrown) * 100 : 0;
        const boardPct = newTotalBagsThrown > 0 ? ((newTotalBagsIn + newTotalBagsOn) / newTotalBagsThrown) * 100 : 0;
        const missPct = 100 - boardPct;

        const totalRoundsPlayed = playerGames.reduce((sum, g) => sum + g.rounds.length, 0) + game.rounds.length;
        const threeBaggerRate = totalRoundsPlayed > 0 ? (threeBaggers / totalRoundsPlayed) * 100 : 0;
        const fourBaggerRate = totalRoundsPlayed > 0 ? (newFourBaggers / totalRoundsPlayed) * 100 : 0;

        const avgPointsPerRound = totalRoundsPlayed > 0 ? newTotalPoints / totalRoundsPlayed : 0;
        const avgPointsPerGame = newTotalGames > 0 ? newTotalPoints / newTotalGames : 0;
        const winPct = newTotalGames > 0 ? (newTotalWins / newTotalGames) * 100 : 0;

        // Calculate clutch factor (win rate in close games)
        const totalCloseGames = newCloseWins + newCloseLosses;
        const clutchFactor = totalCloseGames > 0 ? (newCloseWins / totalCloseGames) * 100 : 0;

        // Calculate consistency (simplified as inverse of variance in scoring)
        const consistency = avgPointsPerRound > 0 ? Math.min(100, (avgPointsPerRound / 10) * 100) : 0;

        // Calculate dominance rating (composite score)
        const dominanceRating = (
          (winPct * 0.3) +
          (bagsInPct * 0.25) +
          (avgPointsPerRound * 10 * 0.25) +
          (clutchFactor * 0.2)
        );

        const newStats: PlayerStats = {
          // Core Stats
          totalGames: newTotalGames,
          totalWins: newTotalWins,
          totalLosses: newTotalLosses,
          totalPoints: newTotalPoints,
          totalBagsIn: newTotalBagsIn,
          totalBagsOn: newTotalBagsOn,
          totalBagsThrown: newTotalBagsThrown,

          // Accuracy & Efficiency
          bagsInPercentage: bagsInPct,
          bagsOnPercentage: bagsOnPct,
          boardPercentage: boardPct,
          missPercentage: missPct,
          threeBaggerRate: threeBaggerRate,
          fourBaggers: newFourBaggers,
          fourBaggerRate: fourBaggerRate,

          // Scoring Performance
          averagePointsPerRound: avgPointsPerRound,
          averagePointsPerGame: avgPointsPerGame,
          highestGameScore: newHighestGameScore,
          shutoutWins: newShutoutWins,
          dominantWins: newDominantWins,
          closeWins: newCloseWins,

          // Momentum & Consistency
          comebackWins: newComebackWins,
          comebacksFrom10Plus: newComebacksFrom10Plus,
          blowoutLosses: newBlowoutLosses,
          closeLosses: newCloseLosses,
          perfectRounds: newPerfectRounds,
          zeroPointRounds: newZeroPointRounds,

          // Win Streaks & Patterns
          longestWinStreak: newLongestWinStreak,
          currentWinStreak: newCurrentWinStreak,
          longestLosingStreak: newLongestLosingStreak,
          currentLosingStreak: newCurrentLosingStreak,

          // Head-to-Head Performance
          totalOpponents: newTotalOpponents,

          // Advanced Metrics
          clutchFactor: clutchFactor,
          consistency: consistency,
          winPercentage: winPct,
          dominanceRating: dominanceRating,
        };

        get().updatePlayer(playerId, { stats: newStats });
      },

      checkAndAwardAchievements: (playerId: string, game: Game) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        const newAchievements: Achievement[] = [];
        const isPlayer1 = game.player1Id === playerId;
        const isWinner = game.winnerId === playerId;

        // First win
        if (player.stats.totalWins === 1 && isWinner) {
          if (
            !player.achievements.some((a) => a.type === "first_win")
          ) {
            newAchievements.push({
              id: uuidv4(),
              type: "first_win",
              title: "First Blood",
              description: "Win your first game",
              icon: "🎯",
              earnedAt: new Date().toISOString(),
            });
          }
        }

        // Four bagger
        const hasFourBagger = game.rounds.some((r) =>
          isPlayer1 ? r.p1In === 4 : r.p2In === 4
        );
        if (hasFourBagger) {
          newAchievements.push({
            id: uuidv4(),
            type: "four_bagger",
            title: "Four Bagger!",
            description: "Get all 4 bags in the hole in one round",
            icon: "🔥",
            earnedAt: new Date().toISOString(),
          });
        }

        // Comeback win
        if (isWinner) {
          let maxDeficit = 0;
          let runningP1Score = 0;
          let runningP2Score = 0;

          game.rounds.forEach((round) => {
            runningP1Score += round.p1Score;
            runningP2Score += round.p2Score;
            const deficit = isPlayer1
              ? runningP2Score - runningP1Score
              : runningP1Score - runningP2Score;
            maxDeficit = Math.max(maxDeficit, deficit);
          });

          if (maxDeficit >= 10) {
            if (
              !player.achievements.some(
                (a) =>
                  a.type === "comeback_win" &&
                  new Date(a.earnedAt).toDateString() ===
                    new Date().toDateString()
              )
            ) {
              newAchievements.push({
                id: uuidv4(),
                type: "comeback_win",
                title: "The Comeback Kid",
                description: "Win after being down by 10+ points",
                icon: "💪",
                earnedAt: new Date().toISOString(),
              });
            }
          }
        }

        // Win streak
        if (player.stats.currentWinStreak === 5) {
          if (
            !player.achievements.some((a) => a.type === "win_streak")
          ) {
            newAchievements.push({
              id: uuidv4(),
              type: "win_streak",
              title: "On Fire!",
              description: "Win 5 games in a row",
              icon: "🔥",
              earnedAt: new Date().toISOString(),
            });
          }
        }

        // Shutout
        const opponentScore = isPlayer1
          ? game.player2Score
          : game.player1Score;
        if (isWinner && opponentScore === 0) {
          if (
            !player.achievements.some(
              (a) =>
                a.type === "shutout" &&
                new Date(a.earnedAt).toDateString() ===
                  new Date().toDateString()
            )
          ) {
            newAchievements.push({
              id: uuidv4(),
              type: "shutout",
              title: "Shutout!",
              description: "Win without letting your opponent score",
              icon: "🛡️",
              earnedAt: new Date().toISOString(),
            });
          }
        }

        if (newAchievements.length > 0) {
          get().updatePlayer(playerId, {
            achievements: [...player.achievements, ...newAchievements],
          });
        }
      },

      // Practice actions
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
        set((state) => ({
          practiceSessions: [...state.practiceSessions, session],
        }));
        return session;
      },

      // Tournament actions
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
        set((state) => ({
          tournaments: [...state.tournaments, tournament],
        }));
        return tournament;
      },

      // Utility
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

      // Sample data generator for testing
      generateSampleData: () => {
        const teamNames = [
          "Bag Bandits",
          "Cornhole Crushers",
          "Board Blazers",
          "Hole-in-One Heroes",
          "Toss Masters",
          "Cornstar Champions",
        ];

        const firstNames = [
          "Alex", "Jordan", "Casey", "Taylor", "Morgan", "Sam", "Riley", "Avery",
          "Jamie", "Drew", "Quinn", "Blake", "Charlie", "Reese", "Dakota", "Sage",
          "Rowan", "Kai", "River", "Phoenix", "Cameron", "Skyler", "Parker", "Hayden",
          "Peyton", "Logan", "Carter", "Dylan", "Hunter", "Austin", "Devon", "Tyler",
          "Bailey", "Sidney", "Kendall", "Jessie", "Emerson", "Ellis", "Harper", "Finley",
          "Kennedy", "Marley", "Arden", "Monroe", "Sutton", "Lennon", "Rory", "Elliot",
          "Madison", "Spencer", "Oakley", "Micah", "Wyatt", "Justice", "Haven", "Reagan",
          "Shawn", "Keegan", "Taryn", "Landry", "Brooklyn", "Teagan"
        ];

        const lastNames = [
          "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
          "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
          "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
          "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
          "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
          "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
          "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
          "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy"
        ];

        const nicknames = [
          "Ace", "Clutch", "Sniper", "Eagle", "Blaze", "Flash", "Rocket", "Thunder",
          "Ice", "Viper", "Fury", "Hawk", "Striker", "Bullet", "Tank", "Shadow",
          "Chief", "Boss", "King", "Duke", null, null, null, null
        ];

        const { createTeam, createPlayer } = get();
        const createdTeams: Team[] = [];

        teamNames.forEach((teamName, teamIndex) => {
          const team = createTeam(teamName);
          createdTeams.push(team);

          // Create 10 players per team
          for (let i = 0; i < 10; i++) {
            const firstName = firstNames[(teamIndex * 10 + i) % firstNames.length];
            const lastName = lastNames[(teamIndex * 10 + i) % lastNames.length];
            const playerName = `${firstName} ${lastName}`;
            const nicknameValue = nicknames[(teamIndex * 10 + i) % nicknames.length];
            const nickname = Math.random() > 0.6 && nicknameValue ? nicknameValue : undefined;

            createPlayer(team.id, playerName, nickname);
          }
        });

        console.log(`Generated ${createdTeams.length} teams with 10 players each`);
      },
    }),
    {
      name: "toss-series-storage",
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
