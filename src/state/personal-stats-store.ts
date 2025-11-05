import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import {
  PersonalBagThrow,
  PersonalMatch,
  PersonalRound,
  PersonalStats,
  PersonalSettings,
} from "../types/personal-stats";

interface PersonalStatsState {
  settings: PersonalSettings;
  stats: PersonalStats;
  matches: PersonalMatch[];
  currentMatch: PersonalMatch | null;
  currentRound: PersonalRound | null;

  // Settings actions
  updateSettings: (settings: Partial<PersonalSettings>) => void;

  // Match actions
  startMatch: (opponent?: string, teammate?: string, notes?: string) => void;
  endMatch: (myScore: number, opponentScore?: number, won?: boolean) => void;
  cancelMatch: () => void;

  // Round actions
  startRound: () => void;
  logThrow: (result: "in" | "on" | "miss") => void;
  undoLastThrow: () => void;
  completeRound: (myScore: number, opponentScore?: number) => void;

  // Quick log (for when not in a formal match)
  quickLogThrow: (result: "in" | "on" | "miss") => void;

  // Stats actions
  recalculateStats: () => void;

  // Utility
  resetPersonalStats: () => void;
}

const createInitialStats = (): PersonalStats => ({
  totalThrows: 0,
  totalIn: 0,
  totalOn: 0,
  totalMisses: 0,
  inPercentage: 0,
  onPercentage: 0,
  boardPercentage: 0,
  missPercentage: 0,
  currentInStreak: 0,
  bestInStreak: 0,
  currentBoardStreak: 0,
  bestBoardStreak: 0,
  fourBaggers: 0,
  threeBaggers: 0,
  matchesPlayed: 0,
  matchesWon: 0,
  winPercentage: 0,
});

const createInitialSettings = (): PersonalSettings => ({
  myName: "Me",
  isTrackingEnabled: true,
  showQuickLog: true,
  syncWithTeamStats: false,
});

export const usePersonalStatsStore = create<PersonalStatsState>()(
  persist(
    (set, get) => ({
      settings: createInitialSettings(),
      stats: createInitialStats(),
      matches: [],
      currentMatch: null,
      currentRound: null,

      // Settings actions
      updateSettings: (updates: Partial<PersonalSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Match actions
      startMatch: (opponent?: string, teammate?: string, notes?: string) => {
        const match: PersonalMatch = {
          id: uuidv4(),
          date: new Date().toISOString(),
          opponent,
          teammate,
          myScore: 0,
          rounds: [],
          notes,
        };
        set({ currentMatch: match, currentRound: null });
      },

      endMatch: (myScore: number, opponentScore?: number, won?: boolean) => {
        const { currentMatch } = get();
        if (!currentMatch) return;

        const completedMatch: PersonalMatch = {
          ...currentMatch,
          myScore,
          opponentScore,
          won,
        };

        set((state) => ({
          matches: [...state.matches, completedMatch],
          currentMatch: null,
          currentRound: null,
        }));

        get().recalculateStats();
      },

      cancelMatch: () => {
        set({ currentMatch: null, currentRound: null });
      },

      // Round actions
      startRound: () => {
        const { currentMatch } = get();
        if (!currentMatch) {
          // Start a match automatically if none exists
          get().startMatch();
        }

        const roundNumber = (get().currentMatch?.rounds.length ?? 0) + 1;
        const round: PersonalRound = {
          roundNumber,
          throws: [],
          myScore: 0,
        };

        set({ currentRound: round });
      },

      logThrow: (result: "in" | "on" | "miss") => {
        const { currentRound, currentMatch } = get();

        if (!currentMatch) {
          // Use quick log instead
          get().quickLogThrow(result);
          return;
        }

        if (!currentRound) {
          get().startRound();
        }

        const round = get().currentRound;
        if (!round) return;

        // Can only log 4 throws per round
        if (round.throws.length >= 4) {
          return;
        }

        const bagThrow: PersonalBagThrow = {
          id: uuidv4(),
          result,
          timestamp: new Date().toISOString(),
          matchId: currentMatch.id,
          roundNumber: round.roundNumber,
          throwNumber: round.throws.length + 1,
        };

        const updatedRound = {
          ...round,
          throws: [...round.throws, bagThrow],
        };

        set({ currentRound: updatedRound });

        // Auto-complete round after 4 throws
        if (updatedRound.throws.length === 4) {
          // Calculate score based on throws
          const inCount = updatedRound.throws.filter((t) => t.result === "in").length;
          const onCount = updatedRound.throws.filter((t) => t.result === "on").length;
          const myScore = inCount * 3 + onCount;

          // Auto-complete with calculated score
          setTimeout(() => {
            get().completeRound(myScore, undefined);
          }, 100);
        }
      },

      undoLastThrow: () => {
        const { currentRound } = get();
        if (!currentRound || currentRound.throws.length === 0) return;

        const updatedRound = {
          ...currentRound,
          throws: currentRound.throws.slice(0, -1),
        };

        set({ currentRound: updatedRound });
      },

      completeRound: (myScore: number, opponentScore?: number) => {
        const { currentRound, currentMatch } = get();
        if (!currentRound || !currentMatch) return;

        const completedRound: PersonalRound = {
          ...currentRound,
          myScore,
          opponentScore,
        };

        const updatedMatch = {
          ...currentMatch,
          rounds: [...currentMatch.rounds, completedRound],
          myScore: currentMatch.myScore + myScore,
          opponentScore: currentMatch.opponentScore
            ? currentMatch.opponentScore + (opponentScore ?? 0)
            : opponentScore,
        };

        set({
          currentMatch: updatedMatch,
          currentRound: null,
        });

        get().recalculateStats();
      },

      // Quick log for casual practice
      quickLogThrow: (result: "in" | "on" | "miss") => {
        const bagThrow: PersonalBagThrow = {
          id: uuidv4(),
          result,
          timestamp: new Date().toISOString(),
          throwNumber: 0, // Quick throws don't have round context
        };

        // Just update stats directly
        set((state) => {
          const newStats = { ...state.stats };
          newStats.totalThrows++;

          if (result === "in") {
            newStats.totalIn++;
            newStats.currentInStreak++;
            newStats.currentBoardStreak++;
            newStats.bestInStreak = Math.max(
              newStats.bestInStreak,
              newStats.currentInStreak
            );
            newStats.bestBoardStreak = Math.max(
              newStats.bestBoardStreak,
              newStats.currentBoardStreak
            );
          } else if (result === "on") {
            newStats.totalOn++;
            newStats.currentInStreak = 0;
            newStats.currentBoardStreak++;
            newStats.bestBoardStreak = Math.max(
              newStats.bestBoardStreak,
              newStats.currentBoardStreak
            );
          } else {
            newStats.totalMisses++;
            newStats.currentInStreak = 0;
            newStats.currentBoardStreak = 0;
          }

          // Recalculate percentages
          newStats.inPercentage =
            (newStats.totalIn / newStats.totalThrows) * 100;
          newStats.onPercentage =
            (newStats.totalOn / newStats.totalThrows) * 100;
          newStats.boardPercentage =
            ((newStats.totalIn + newStats.totalOn) / newStats.totalThrows) * 100;
          newStats.missPercentage =
            (newStats.totalMisses / newStats.totalThrows) * 100;
          newStats.lastThrow = new Date().toISOString();

          return { stats: newStats };
        });
      },

      // Recalculate all stats from matches
      recalculateStats: () => {
        const { matches, currentMatch } = get();
        const allMatches = currentMatch
          ? [...matches, currentMatch]
          : matches;

        const stats = createInitialStats();

        // Aggregate all throws from all matches
        const allThrows: PersonalBagThrow[] = [];
        allMatches.forEach((match) => {
          match.rounds.forEach((round) => {
            allThrows.push(...round.throws);
          });
        });

        // Calculate basic stats
        stats.totalThrows = allThrows.length;
        stats.totalIn = allThrows.filter((t) => t.result === "in").length;
        stats.totalOn = allThrows.filter((t) => t.result === "on").length;
        stats.totalMisses = allThrows.filter((t) => t.result === "miss").length;

        // Calculate percentages
        if (stats.totalThrows > 0) {
          stats.inPercentage = (stats.totalIn / stats.totalThrows) * 100;
          stats.onPercentage = (stats.totalOn / stats.totalThrows) * 100;
          stats.boardPercentage =
            ((stats.totalIn + stats.totalOn) / stats.totalThrows) * 100;
          stats.missPercentage = (stats.totalMisses / stats.totalThrows) * 100;
        }

        // Calculate streaks
        let currentInStreak = 0;
        let bestInStreak = 0;
        let currentBoardStreak = 0;
        let bestBoardStreak = 0;

        allThrows.forEach((t) => {
          if (t.result === "in") {
            currentInStreak++;
            currentBoardStreak++;
            bestInStreak = Math.max(bestInStreak, currentInStreak);
            bestBoardStreak = Math.max(bestBoardStreak, currentBoardStreak);
          } else if (t.result === "on") {
            currentInStreak = 0;
            currentBoardStreak++;
            bestBoardStreak = Math.max(bestBoardStreak, currentBoardStreak);
          } else {
            currentInStreak = 0;
            currentBoardStreak = 0;
          }
        });

        stats.currentInStreak = currentInStreak;
        stats.bestInStreak = bestInStreak;
        stats.currentBoardStreak = currentBoardStreak;
        stats.bestBoardStreak = bestBoardStreak;

        // Calculate round achievements
        allMatches.forEach((match) => {
          match.rounds.forEach((round) => {
            const inCount = round.throws.filter((t) => t.result === "in").length;
            if (inCount === 4) stats.fourBaggers++;
            if (inCount === 3) stats.threeBaggers++;
          });
        });

        // Calculate match stats
        const completedMatches = matches.filter(
          (m) => m.won !== undefined && m.opponentScore !== undefined
        );
        stats.matchesPlayed = completedMatches.length;
        stats.matchesWon = completedMatches.filter((m) => m.won === true).length;
        stats.winPercentage =
          stats.matchesPlayed > 0
            ? (stats.matchesWon / stats.matchesPlayed) * 100
            : 0;

        // Set timestamps
        if (allThrows.length > 0) {
          stats.lastThrow = allThrows[allThrows.length - 1].timestamp;
        }
        if (matches.length > 0) {
          stats.lastMatch = matches[matches.length - 1].date;
        }

        set({ stats });
      },

      resetPersonalStats: () => {
        set({
          stats: createInitialStats(),
          matches: [],
          currentMatch: null,
          currentRound: null,
        });
      },
    }),
    {
      name: "personal-stats-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
