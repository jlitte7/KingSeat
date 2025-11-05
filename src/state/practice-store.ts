import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export interface BagRunSession {
  id: string;
  playerId?: string;
  rounds: number;
  consecutiveBags: number;
  longestStreak: number;
  totalBags: number;
  madeCount: number;
  accuracy: number;
  createdAt: string;
  completedAt?: string;
}

export interface AirmailRunSession {
  id: string;
  playerId?: string;
  rounds: number;
  consecutiveAirmails: number;
  longestStreak: number;
  totalBags: number;
  airmailCount: number;
  accuracy: number;
  createdAt: string;
  completedAt?: string;
}

export interface GhostPlayerGame {
  id: string;
  playerId?: string;
  playerScore: number;
  ghostScore: number;
  rounds: GhostRound[];
  ghostDifficulty: "easy" | "medium" | "hard" | "pro";
  winnerId: "player" | "ghost" | null;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface GhostRound {
  roundNumber: number;
  playerIn: number;
  playerOn: number;
  playerScore: number;
  ghostIn: number;
  ghostOn: number;
  ghostScore: number;
}

export interface SituationalGame {
  id: string;
  playerId?: string;
  scenario: GameScenario;
  playerScore: number;
  ghostScore: number;
  startingRound: number;
  rounds: GhostRound[];
  winnerId: "player" | "ghost" | null;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface GameScenario {
  name: string;
  description: string;
  playerStartScore: number;
  ghostStartScore: number;
  startingRound: number;
  difficulty: "easy" | "medium" | "hard" | "pro";
}

export interface BestGameChallenge {
  id: string;
  playerId?: string;
  playerScore: number;
  bestGameScore: number;
  rounds: GhostRound[];
  winnerId: "player" | "best" | null;
  completed: boolean;
  bestGameData: {
    avgBagsIn: number;
    avgBagsOn: number;
    avgPPR: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface PressurePractice {
  id: string;
  playerId?: string;
  scenario: PressureScenario;
  attempts: number;
  successes: number;
  successRate: number;
  createdAt: string;
}

export interface PressureScenario {
  name: string;
  description: string;
  targetBagsIn: number;
  targetBagsOn: number;
  mustMake: number;
}

export interface PracticeStats {
  totalBagRunSessions: number;
  bestBagRunStreak: number;
  totalAirmailSessions: number;
  bestAirmailStreak: number;
  ghostGamesPlayed: number;
  ghostGamesWon: number;
  situationalGamesPlayed: number;
  situationalGamesWon: number;
  bestGameChallengesPlayed: number;
  bestGameChallengesWon: number;
  pressurePracticeAttempts: number;
  pressurePracticeSuccesses: number;
}

interface PracticeState {
  bagRunSessions: BagRunSession[];
  airmailRunSessions: AirmailRunSession[];
  ghostPlayerGames: GhostPlayerGame[];
  situationalGames: SituationalGame[];
  bestGameChallenges: BestGameChallenge[];
  pressurePractices: PressurePractice[];
  practiceStats: PracticeStats;

  // Bag Run actions
  createBagRunSession: (playerId?: string) => BagRunSession;
  updateBagRunSession: (
    sessionId: string,
    updates: Partial<BagRunSession>
  ) => void;
  completeBagRunSession: (sessionId: string) => void;

  // Airmail Run actions
  createAirmailRunSession: (playerId?: string) => AirmailRunSession;
  updateAirmailRunSession: (
    sessionId: string,
    updates: Partial<AirmailRunSession>
  ) => void;
  completeAirmailRunSession: (sessionId: string) => void;

  // Ghost Player actions
  createGhostPlayerGame: (
    difficulty: "easy" | "medium" | "hard" | "pro",
    playerId?: string
  ) => GhostPlayerGame;
  addGhostRound: (gameId: string, round: GhostRound) => void;
  completeGhostGame: (gameId: string, winnerId: "player" | "ghost") => void;

  // Situational Game actions
  createSituationalGame: (
    scenario: GameScenario,
    playerId?: string
  ) => SituationalGame;
  addSituationalRound: (gameId: string, round: GhostRound) => void;
  completeSituationalGame: (
    gameId: string,
    winnerId: "player" | "ghost"
  ) => void;

  // Best Game Challenge actions
  createBestGameChallenge: (
    bestGameData: {
      avgBagsIn: number;
      avgBagsOn: number;
      avgPPR: number;
    },
    playerId?: string
  ) => BestGameChallenge;
  addBestGameRound: (gameId: string, round: GhostRound) => void;
  completeBestGameChallenge: (
    gameId: string,
    winnerId: "player" | "best"
  ) => void;

  // Pressure Practice actions
  createPressurePractice: (
    scenario: PressureScenario,
    playerId?: string
  ) => PressurePractice;
  recordPressureAttempt: (practiceId: string, success: boolean) => void;

  // Utility
  getPracticeStats: () => PracticeStats;
  resetPracticeData: () => void;
}

const initialPracticeStats: PracticeStats = {
  totalBagRunSessions: 0,
  bestBagRunStreak: 0,
  totalAirmailSessions: 0,
  bestAirmailStreak: 0,
  ghostGamesPlayed: 0,
  ghostGamesWon: 0,
  situationalGamesPlayed: 0,
  situationalGamesWon: 0,
  bestGameChallengesPlayed: 0,
  bestGameChallengesWon: 0,
  pressurePracticeAttempts: 0,
  pressurePracticeSuccesses: 0,
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      bagRunSessions: [],
      airmailRunSessions: [],
      ghostPlayerGames: [],
      situationalGames: [],
      bestGameChallenges: [],
      pressurePractices: [],
      practiceStats: initialPracticeStats,

      // Bag Run actions
      createBagRunSession: (playerId?: string) => {
        const session: BagRunSession = {
          id: uuidv4(),
          playerId,
          rounds: 0,
          consecutiveBags: 0,
          longestStreak: 0,
          totalBags: 0,
          madeCount: 0,
          accuracy: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          bagRunSessions: [...state.bagRunSessions, session],
        }));
        return session;
      },

      updateBagRunSession: (sessionId: string, updates: Partial<BagRunSession>) => {
        set((state) => ({
          bagRunSessions: state.bagRunSessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          ),
        }));
      },

      completeBagRunSession: (sessionId: string) => {
        const session = get().bagRunSessions.find((s) => s.id === sessionId);
        if (!session) return;

        set((state) => ({
          bagRunSessions: state.bagRunSessions.map((s) =>
            s.id === sessionId
              ? { ...s, completedAt: new Date().toISOString() }
              : s
          ),
          practiceStats: {
            ...state.practiceStats,
            totalBagRunSessions: state.practiceStats.totalBagRunSessions + 1,
            bestBagRunStreak: Math.max(
              state.practiceStats.bestBagRunStreak,
              session.longestStreak
            ),
          },
        }));
      },

      // Airmail Run actions
      createAirmailRunSession: (playerId?: string) => {
        const session: AirmailRunSession = {
          id: uuidv4(),
          playerId,
          rounds: 0,
          consecutiveAirmails: 0,
          longestStreak: 0,
          totalBags: 0,
          airmailCount: 0,
          accuracy: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          airmailRunSessions: [...state.airmailRunSessions, session],
        }));
        return session;
      },

      updateAirmailRunSession: (
        sessionId: string,
        updates: Partial<AirmailRunSession>
      ) => {
        set((state) => ({
          airmailRunSessions: state.airmailRunSessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          ),
        }));
      },

      completeAirmailRunSession: (sessionId: string) => {
        const session = get().airmailRunSessions.find((s) => s.id === sessionId);
        if (!session) return;

        set((state) => ({
          airmailRunSessions: state.airmailRunSessions.map((s) =>
            s.id === sessionId
              ? { ...s, completedAt: new Date().toISOString() }
              : s
          ),
          practiceStats: {
            ...state.practiceStats,
            totalAirmailSessions: state.practiceStats.totalAirmailSessions + 1,
            bestAirmailStreak: Math.max(
              state.practiceStats.bestAirmailStreak,
              session.longestStreak
            ),
          },
        }));
      },

      // Ghost Player actions
      createGhostPlayerGame: (
        difficulty: "easy" | "medium" | "hard" | "pro",
        playerId?: string
      ) => {
        const game: GhostPlayerGame = {
          id: uuidv4(),
          playerId,
          playerScore: 0,
          ghostScore: 0,
          rounds: [],
          ghostDifficulty: difficulty,
          winnerId: null,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          ghostPlayerGames: [...state.ghostPlayerGames, game],
        }));
        return game;
      },

      addGhostRound: (gameId: string, round: GhostRound) => {
        set((state) => ({
          ghostPlayerGames: state.ghostPlayerGames.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: [...g.rounds, round],
                  playerScore: g.playerScore + round.playerScore,
                  ghostScore: g.ghostScore + round.ghostScore,
                }
              : g
          ),
        }));
      },

      completeGhostGame: (gameId: string, winnerId: "player" | "ghost") => {
        set((state) => ({
          ghostPlayerGames: state.ghostPlayerGames.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  winnerId,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : g
          ),
          practiceStats: {
            ...state.practiceStats,
            ghostGamesPlayed: state.practiceStats.ghostGamesPlayed + 1,
            ghostGamesWon:
              winnerId === "player"
                ? state.practiceStats.ghostGamesWon + 1
                : state.practiceStats.ghostGamesWon,
          },
        }));
      },

      // Situational Game actions
      createSituationalGame: (scenario: GameScenario, playerId?: string) => {
        const game: SituationalGame = {
          id: uuidv4(),
          playerId,
          scenario,
          playerScore: scenario.playerStartScore,
          ghostScore: scenario.ghostStartScore,
          startingRound: scenario.startingRound,
          rounds: [],
          winnerId: null,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          situationalGames: [...state.situationalGames, game],
        }));
        return game;
      },

      addSituationalRound: (gameId: string, round: GhostRound) => {
        set((state) => ({
          situationalGames: state.situationalGames.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: [...g.rounds, round],
                  playerScore: g.playerScore + round.playerScore,
                  ghostScore: g.ghostScore + round.ghostScore,
                }
              : g
          ),
        }));
      },

      completeSituationalGame: (gameId: string, winnerId: "player" | "ghost") => {
        set((state) => ({
          situationalGames: state.situationalGames.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  winnerId,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : g
          ),
          practiceStats: {
            ...state.practiceStats,
            situationalGamesPlayed:
              state.practiceStats.situationalGamesPlayed + 1,
            situationalGamesWon:
              winnerId === "player"
                ? state.practiceStats.situationalGamesWon + 1
                : state.practiceStats.situationalGamesWon,
          },
        }));
      },

      // Best Game Challenge actions
      createBestGameChallenge: (
        bestGameData: {
          avgBagsIn: number;
          avgBagsOn: number;
          avgPPR: number;
        },
        playerId?: string
      ) => {
        const challenge: BestGameChallenge = {
          id: uuidv4(),
          playerId,
          playerScore: 0,
          bestGameScore: 0,
          rounds: [],
          winnerId: null,
          completed: false,
          bestGameData,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          bestGameChallenges: [...state.bestGameChallenges, challenge],
        }));
        return challenge;
      },

      addBestGameRound: (gameId: string, round: GhostRound) => {
        set((state) => ({
          bestGameChallenges: state.bestGameChallenges.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  rounds: [...g.rounds, round],
                  playerScore: g.playerScore + round.playerScore,
                  bestGameScore: g.bestGameScore + round.ghostScore,
                }
              : g
          ),
        }));
      },

      completeBestGameChallenge: (
        gameId: string,
        winnerId: "player" | "best"
      ) => {
        set((state) => ({
          bestGameChallenges: state.bestGameChallenges.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  winnerId,
                  completed: true,
                  completedAt: new Date().toISOString(),
                }
              : g
          ),
          practiceStats: {
            ...state.practiceStats,
            bestGameChallengesPlayed:
              state.practiceStats.bestGameChallengesPlayed + 1,
            bestGameChallengesWon:
              winnerId === "player"
                ? state.practiceStats.bestGameChallengesWon + 1
                : state.practiceStats.bestGameChallengesWon,
          },
        }));
      },

      // Pressure Practice actions
      createPressurePractice: (scenario: PressureScenario, playerId?: string) => {
        const practice: PressurePractice = {
          id: uuidv4(),
          playerId,
          scenario,
          attempts: 0,
          successes: 0,
          successRate: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          pressurePractices: [...state.pressurePractices, practice],
        }));
        return practice;
      },

      recordPressureAttempt: (practiceId: string, success: boolean) => {
        set((state) => {
          const practice = state.pressurePractices.find(
            (p) => p.id === practiceId
          );
          if (!practice) return state;

          const newAttempts = practice.attempts + 1;
          const newSuccesses = success
            ? practice.successes + 1
            : practice.successes;
          const newSuccessRate = (newSuccesses / newAttempts) * 100;

          return {
            pressurePractices: state.pressurePractices.map((p) =>
              p.id === practiceId
                ? {
                    ...p,
                    attempts: newAttempts,
                    successes: newSuccesses,
                    successRate: newSuccessRate,
                  }
                : p
            ),
            practiceStats: {
              ...state.practiceStats,
              pressurePracticeAttempts:
                state.practiceStats.pressurePracticeAttempts + 1,
              pressurePracticeSuccesses: success
                ? state.practiceStats.pressurePracticeSuccesses + 1
                : state.practiceStats.pressurePracticeSuccesses,
            },
          };
        });
      },

      // Utility
      getPracticeStats: () => {
        return get().practiceStats;
      },

      resetPracticeData: () => {
        set({
          bagRunSessions: [],
          airmailRunSessions: [],
          ghostPlayerGames: [],
          situationalGames: [],
          bestGameChallenges: [],
          pressurePractices: [],
          practiceStats: initialPracticeStats,
        });
      },
    }),
    {
      name: "practice-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bagRunSessions: state.bagRunSessions,
        airmailRunSessions: state.airmailRunSessions,
        ghostPlayerGames: state.ghostPlayerGames,
        situationalGames: state.situationalGames,
        bestGameChallenges: state.bestGameChallenges,
        pressurePractices: state.pressurePractices,
        practiceStats: state.practiceStats,
      }),
    }
  )
);
