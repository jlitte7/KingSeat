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
  LeagueSpecificStats,
} from "../types/personal-stats";

interface PersonalStatsState {
  settings: PersonalSettings;
  stats: PersonalStats;
  matches: PersonalMatch[];
  currentMatch: PersonalMatch | null;
  currentRound: PersonalRound | null;
  leagueStats: LeagueSpecificStats[]; // Stats broken down by league

  // Settings actions
  updateSettings: (settings: Partial<PersonalSettings>) => void;

  // Match actions
  startMatch: (opponent?: string, teammate?: string, notes?: string, leagueId?: string) => void;
  endMatch: (won?: boolean) => void;
  cancelMatch: () => void;

  // Round actions
  startRound: () => void;
  logMyThrow: (result: "in" | "on" | "miss") => void;
  undoMyLastThrow: () => void;
  completeRound: (
    myBagsIn: number,
    myBagsOn: number,
    oppBagsIn: number,
    oppBagsOn: number
  ) => void;
  editRound: (
    matchId: string,
    roundNumber: number,
    myBagsIn: number,
    myBagsOn: number,
    oppBagsIn: number,
    oppBagsOn: number
  ) => void;

  // Stats actions
  recalculateStats: () => void;
  getLeagueStats: (leagueId: string) => LeagueSpecificStats | undefined;
  recalculateLeagueStats: () => void;

  // Utility
  resetPersonalStats: () => void;
}

const createInitialStats = (): PersonalStats => ({
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
  totalOpponentPoints: 0,
  totalRoundsPlayed: 0,
  totalBagsIn: 0,
  totalBagsOn: 0,
  totalBagsThrown: 0,
  bagsInPercentage: 0,
  bagsOnPercentage: 0,
  boardPercentage: 0,
  missPercentage: 0,
  scorePercentage: 0,
  threeBaggerRate: 0,
  fourBaggers: 0,
  fourBaggerRate: 0,
  averagePointsPerRound: 0,
  opponentPointsPerRound: 0,
  pointDifferential: 0,
  deadwoodPerRound: 0,
  averagePointsPerGame: 0,
  highestGameScore: 0,
  shutoutWins: 0,
  dominantWins: 0,
  closeWins: 0,
  comebackWins: 0,
  comebacksFrom10Plus: 0,
  blowoutLosses: 0,
  closeLosses: 0,
  perfectRounds: 0,
  zeroPointRounds: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  longestLosingStreak: 0,
  currentLosingStreak: 0,
  totalOpponents: 0,
  clutchFactor: 0,
  consistency: 0,
  winPercentage: 0,
  dominanceRating: 0,
});

const createInitialSettings = (): PersonalSettings => ({
  myName: "Me",
  isTrackingEnabled: true,
  showQuickLog: false,
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
      leagueStats: [],

      // Settings actions
      updateSettings: (updates: Partial<PersonalSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Match actions
      startMatch: (opponent?: string, teammate?: string, notes?: string, leagueId?: string) => {
        const match: PersonalMatch = {
          id: uuidv4(),
          date: new Date().toISOString(),
          opponent,
          teammate,
          myScore: 0,
          opponentScore: 0,
          rounds: [],
          notes,
          leagueId,
        };
        set({ currentMatch: match, currentRound: null });
      },

      endMatch: (wonParam?: boolean) => {
        const { currentMatch } = get();
        if (!currentMatch) return;

        // Use provided won parameter, or fall back to score comparison
        const won = wonParam !== undefined
          ? wonParam
          : currentMatch.myScore > (currentMatch.opponentScore ?? 0);

        const completedMatch: PersonalMatch = {
          ...currentMatch,
          won,
        };

        set((state) => ({
          matches: [...state.matches, completedMatch],
          currentMatch: null,
          currentRound: null,
        }));

        get().recalculateStats();
        get().recalculateLeagueStats();
      },

      cancelMatch: () => {
        set({ currentMatch: null, currentRound: null });
      },

      // Round actions
      startRound: () => {
        const { currentMatch } = get();
        if (!currentMatch) return;

        const roundNumber = currentMatch.rounds.length + 1;
        const round: PersonalRound = {
          roundNumber,
          throws: [],
          myBagsIn: 0,
          myBagsOn: 0,
          opponentBagsIn: 0,
          opponentBagsOn: 0,
          myScore: 0,
          opponentScore: 0,
        };

        set({ currentRound: round });
      },

      logMyThrow: (result: "in" | "on" | "miss") => {
        const { currentRound, currentMatch } = get();
        if (!currentRound || !currentMatch) return;

        // Can only log 4 throws per round
        if (currentRound.throws.length >= 4) return;

        const bagThrow: PersonalBagThrow = {
          id: uuidv4(),
          result,
          timestamp: new Date().toISOString(),
          matchId: currentMatch.id,
          roundNumber: currentRound.roundNumber,
          throwNumber: currentRound.throws.length + 1,
        };

        const updatedRound = {
          ...currentRound,
          throws: [...currentRound.throws, bagThrow],
        };

        set({ currentRound: updatedRound });
      },

      undoMyLastThrow: () => {
        const { currentRound } = get();
        if (!currentRound || currentRound.throws.length === 0) return;

        const updatedRound = {
          ...currentRound,
          throws: currentRound.throws.slice(0, -1),
        };

        set({ currentRound: updatedRound });
      },

      completeRound: (
        myBagsIn: number,
        myBagsOn: number,
        oppBagsIn: number,
        oppBagsOn: number
      ) => {
        const { currentRound, currentMatch } = get();
        if (!currentRound || !currentMatch) return;

        // Calculate scores using cancellation scoring
        const myRawScore = myBagsIn * 3 + myBagsOn;
        const oppRawScore = oppBagsIn * 3 + oppBagsOn;
        const myScore = Math.max(0, myRawScore - oppRawScore);
        const oppScore = Math.max(0, oppRawScore - myRawScore);

        const completedRound: PersonalRound = {
          ...currentRound,
          myBagsIn,
          myBagsOn,
          opponentBagsIn: oppBagsIn,
          opponentBagsOn: oppBagsOn,
          myScore,
          opponentScore: oppScore,
        };

        const updatedMatch = {
          ...currentMatch,
          rounds: [...currentMatch.rounds, completedRound],
          myScore: currentMatch.myScore + myScore,
          opponentScore: (currentMatch.opponentScore ?? 0) + oppScore,
        };

        set({
          currentMatch: updatedMatch,
          currentRound: null,
        });
      },

      editRound: (
        matchId: string,
        roundNumber: number,
        myBagsIn: number,
        myBagsOn: number,
        oppBagsIn: number,
        oppBagsOn: number
      ) => {
        const { matches } = get();
        const matchIndex = matches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return;

        const match = matches[matchIndex];
        const roundIndex = match.rounds.findIndex((r) => r.roundNumber === roundNumber);
        if (roundIndex === -1) return;

        // Calculate new scores using cancellation scoring
        const myRawScore = myBagsIn * 3 + myBagsOn;
        const oppRawScore = oppBagsIn * 3 + oppBagsOn;
        const myScore = Math.max(0, myRawScore - oppRawScore);
        const oppScore = Math.max(0, oppRawScore - myRawScore);

        // Get old round scores to adjust match totals
        const oldRound = match.rounds[roundIndex];
        const oldMyScore = oldRound.myScore;
        const oldOppScore = oldRound.opponentScore;

        // Update the round
        const updatedRound: PersonalRound = {
          ...oldRound,
          myBagsIn,
          myBagsOn,
          opponentBagsIn: oppBagsIn,
          opponentBagsOn: oppBagsOn,
          myScore,
          opponentScore: oppScore,
        };

        // Update the rounds array
        const updatedRounds = [...match.rounds];
        updatedRounds[roundIndex] = updatedRound;

        // Recalculate match totals by removing old round scores and adding new ones
        const updatedMatch = {
          ...match,
          rounds: updatedRounds,
          myScore: match.myScore - oldMyScore + myScore,
          opponentScore: (match.opponentScore ?? 0) - oldOppScore + oppScore,
        };

        // Update the matches array
        const updatedMatches = [...matches];
        updatedMatches[matchIndex] = updatedMatch;

        set({ matches: updatedMatches });

        // Recalculate all stats
        get().recalculateStats();
        get().recalculateLeagueStats();
      },

      // Recalculate all stats from completed matches (like team system)
      recalculateStats: () => {
        const { matches } = get();
        const stats = createInitialStats();

        if (matches.length === 0) {
          set({ stats });
          return;
        }

        // Aggregate all data from completed matches
        let totalBagsIn = 0;
        let totalBagsOn = 0;
        let totalBagsThrown = 0;
        let totalPoints = 0;
        let totalOpponentPoints = 0;
        let totalRounds = 0;
        let fourBaggers = 0;
        let threeBaggers = 0;
        let perfectRounds = 0;
        let zeroPointRounds = 0;

        matches.forEach((match) => {
          match.rounds.forEach((round) => {
            totalBagsIn += round.myBagsIn;
            totalBagsOn += round.myBagsOn;
            totalBagsThrown += 4; // Always 4 bags per round
            // PPR uses raw bag values (before cancellation), not game scores
            const rawRoundPoints = (round.myBagsIn * 3) + (round.myBagsOn * 1);
            totalPoints += rawRoundPoints;

            // Track opponent raw points for OPPR
            const oppRawRoundPoints = (round.opponentBagsIn * 3) + (round.opponentBagsOn * 1);
            totalOpponentPoints += oppRawRoundPoints;

            totalRounds++;

            if (round.myBagsIn === 4) {
              fourBaggers++;
              perfectRounds++;
            }
            if (round.myBagsIn === 3) threeBaggers++;
            if (round.myScore === 0) zeroPointRounds++;
          });
        });

        // Basic stats
        stats.totalGames = matches.length;
        stats.totalBagsIn = totalBagsIn;
        stats.totalBagsOn = totalBagsOn;
        stats.totalBagsThrown = totalBagsThrown;
        stats.totalPoints = totalPoints;
        stats.totalOpponentPoints = totalOpponentPoints;
        stats.totalRoundsPlayed = totalRounds;
        stats.perfectRounds = perfectRounds;
        stats.zeroPointRounds = zeroPointRounds;

        // Accuracy percentages
        if (totalBagsThrown > 0) {
          stats.bagsInPercentage = (totalBagsIn / totalBagsThrown) * 100;
          stats.bagsOnPercentage = (totalBagsOn / totalBagsThrown) * 100;
          stats.boardPercentage =
            ((totalBagsIn + totalBagsOn) / totalBagsThrown) * 100;
          stats.missPercentage =
            ((totalBagsThrown - totalBagsIn - totalBagsOn) / totalBagsThrown) * 100;
          stats.scorePercentage = ((totalBagsIn + totalBagsOn) / totalBagsThrown) * 100;
        }

        // Round performance
        stats.fourBaggers = fourBaggers;
        if (totalRounds > 0) {
          stats.fourBaggerRate = (fourBaggers / totalRounds) * 100;
          stats.threeBaggerRate = (threeBaggers / totalRounds) * 100;
          stats.averagePointsPerRound = totalPoints / totalRounds;
          stats.opponentPointsPerRound = totalOpponentPoints / totalRounds;
          stats.pointDifferential = stats.averagePointsPerRound - stats.opponentPointsPerRound;

          // Calculate DPR (Deadwood Per Round) - average bags missed per round
          const totalMissedBags = totalBagsThrown - totalBagsIn - totalBagsOn;
          stats.deadwoodPerRound = totalMissedBags / totalRounds;
        }

        if (stats.totalGames > 0) {
          stats.averagePointsPerGame = totalPoints / stats.totalGames;
        }

        // Win/loss analysis
        matches.forEach((match) => {
          const isWin = match.won === true;
          const myScore = match.myScore;
          const oppScore = match.opponentScore ?? 0;
          const scoreDiff = Math.abs(myScore - oppScore);

          if (isWin) {
            stats.totalWins++;
            stats.highestGameScore = Math.max(stats.highestGameScore, myScore);

            if (oppScore === 0) stats.shutoutWins++;
            if (scoreDiff >= 10) stats.dominantWins++;
            if (scoreDiff <= 3) stats.closeWins++;

            // Check for comeback
            let maxDeficit = 0;
            let runningMyScore = 0;
            let runningOppScore = 0;
            match.rounds.forEach((round) => {
              runningMyScore += round.myScore;
              runningOppScore += round.opponentScore;
              const deficit = runningOppScore - runningMyScore;
              maxDeficit = Math.max(maxDeficit, deficit);
            });

            if (maxDeficit > 0) stats.comebackWins++;
            if (maxDeficit >= 10) stats.comebacksFrom10Plus++;
          } else {
            stats.totalLosses++;
            if (scoreDiff <= 3) stats.closeLosses++;
            if (scoreDiff >= 10) stats.blowoutLosses++;
          }
        });

        // Win/loss streaks
        let currentWinStreak = 0;
        let currentLosingStreak = 0;
        let longestWinStreak = 0;
        let longestLosingStreak = 0;

        matches.forEach((match) => {
          if (match.won === true) {
            currentWinStreak++;
            currentLosingStreak = 0;
            longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
          } else {
            currentLosingStreak++;
            currentWinStreak = 0;
            longestLosingStreak = Math.max(longestLosingStreak, currentLosingStreak);
          }
        });

        stats.currentWinStreak = currentWinStreak;
        stats.currentLosingStreak = currentLosingStreak;
        stats.longestWinStreak = longestWinStreak;
        stats.longestLosingStreak = longestLosingStreak;

        // Opponents
        const uniqueOpponents = new Set(
          matches.filter((m) => m.opponent).map((m) => m.opponent)
        );
        stats.totalOpponents = uniqueOpponents.size;

        // Win percentage
        if (stats.totalGames > 0) {
          stats.winPercentage = (stats.totalWins / stats.totalGames) * 100;
        }

        // Clutch factor (win rate in close games)
        const totalCloseGames = stats.closeWins + stats.closeLosses;
        if (totalCloseGames > 0) {
          stats.clutchFactor = (stats.closeWins / totalCloseGames) * 100;
        }

        // Consistency (simplified as inverse of variance in scoring)
        if (stats.averagePointsPerRound > 0) {
          stats.consistency = Math.min(
            100,
            (stats.averagePointsPerRound / 10) * 100
          );
        }

        // Dominance rating (composite score)
        stats.dominanceRating =
          stats.winPercentage * 0.3 +
          stats.bagsInPercentage * 0.25 +
          stats.averagePointsPerRound * 10 * 0.25 +
          stats.clutchFactor * 0.2;

        // Timestamps
        if (matches.length > 0) {
          stats.lastMatch = matches[matches.length - 1].date;
        }

        set({ stats });
      },

      // League-specific stats calculation
      getLeagueStats: (leagueId: string) => {
        return get().leagueStats.find((ls) => ls.leagueId === leagueId);
      },

      recalculateLeagueStats: () => {
        const { matches } = get();

        // Group matches by leagueId
        const leagueMatchMap = new Map<string, PersonalMatch[]>();

        matches.forEach((match) => {
          if (match.leagueId) {
            const existing = leagueMatchMap.get(match.leagueId) || [];
            leagueMatchMap.set(match.leagueId, [...existing, match]);
          }
        });

        // Calculate stats for each league
        const leagueStats: LeagueSpecificStats[] = [];

        leagueMatchMap.forEach((leagueMatches, leagueId) => {
          const stats = createInitialStats();

          // Use same calculation logic as main stats
          let totalBagsIn = 0;
          let totalBagsOn = 0;
          let totalBagsThrown = 0;
          let totalPoints = 0;
          let totalOpponentPoints = 0;
          let totalRounds = 0;
          let fourBaggers = 0;
          let threeBaggers = 0;
          let perfectRounds = 0;
          let zeroPointRounds = 0;

          leagueMatches.forEach((match) => {
            match.rounds.forEach((round) => {
              totalBagsIn += round.myBagsIn;
              totalBagsOn += round.myBagsOn;
              totalBagsThrown += 4;
              const rawRoundPoints = (round.myBagsIn * 3) + (round.myBagsOn * 1);
              totalPoints += rawRoundPoints;
              const oppRawRoundPoints = (round.opponentBagsIn * 3) + (round.opponentBagsOn * 1);
              totalOpponentPoints += oppRawRoundPoints;
              totalRounds++;

              if (round.myBagsIn === 4) {
                fourBaggers++;
                perfectRounds++;
              }
              if (round.myBagsIn === 3) threeBaggers++;
              if (round.myScore === 0) zeroPointRounds++;
            });
          });

          stats.totalGames = leagueMatches.length;
          stats.totalBagsIn = totalBagsIn;
          stats.totalBagsOn = totalBagsOn;
          stats.totalBagsThrown = totalBagsThrown;
          stats.totalPoints = totalPoints;
          stats.totalOpponentPoints = totalOpponentPoints;
          stats.totalRoundsPlayed = totalRounds;
          stats.perfectRounds = perfectRounds;
          stats.zeroPointRounds = zeroPointRounds;
          stats.fourBaggers = fourBaggers;

          if (totalBagsThrown > 0) {
            stats.bagsInPercentage = (totalBagsIn / totalBagsThrown) * 100;
            stats.bagsOnPercentage = (totalBagsOn / totalBagsThrown) * 100;
            stats.boardPercentage = ((totalBagsIn + totalBagsOn) / totalBagsThrown) * 100;
            stats.missPercentage = ((totalBagsThrown - totalBagsIn - totalBagsOn) / totalBagsThrown) * 100;
          }

          if (totalRounds > 0) {
            stats.fourBaggerRate = (fourBaggers / totalRounds) * 100;
            stats.threeBaggerRate = (threeBaggers / totalRounds) * 100;
            stats.averagePointsPerRound = totalPoints / totalRounds;
            stats.opponentPointsPerRound = totalOpponentPoints / totalRounds;
            stats.pointDifferential = stats.averagePointsPerRound - stats.opponentPointsPerRound;

            // Calculate DPR for league stats
            const totalMissedBags = totalBagsThrown - totalBagsIn - totalBagsOn;
            stats.deadwoodPerRound = totalMissedBags / totalRounds;
          }

          // Win/loss analysis
          leagueMatches.forEach((match) => {
            const isWin = match.won === true;
            if (isWin) {
              stats.totalWins++;
            } else {
              stats.totalLosses++;
            }
          });

          if (stats.totalGames > 0) {
            stats.winPercentage = (stats.totalWins / stats.totalGames) * 100;
            stats.averagePointsPerGame = totalPoints / stats.totalGames;
          }

          stats.dominanceRating =
            stats.winPercentage * 0.3 +
            stats.bagsInPercentage * 0.25 +
            stats.averagePointsPerRound * 10 * 0.25 +
            (stats.winPercentage * 0.2);

          leagueStats.push({
            leagueId,
            leagueName: `League ${leagueId.substring(0, 8)}`, // Will be enhanced with real league names
            stats,
            matchIds: leagueMatches.map((m) => m.id),
          });
        });

        set({ leagueStats });
      },

      resetPersonalStats: () => {
        set({
          stats: createInitialStats(),
          matches: [],
          currentMatch: null,
          currentRound: null,
          leagueStats: [],
        });
      },
    }),
    {
      name: "personal-stats-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
