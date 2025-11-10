// Simulates global stats from other users
// In a real app, this would fetch from a backend API

import { GlobalUserStats, GlobalStatsComparison } from "../types/global-stats";
import { PersonalStats } from "../types/personal-stats";

// Generate mock users with realistic stats distributions
const generateMockUsers = (count: number): GlobalUserStats[] => {
  const users: GlobalUserStats[] = [];
  const names = [
    "Mike", "Sarah", "John", "Emma", "Chris", "Lisa", "David", "Amy",
    "Tom", "Jessica", "Ryan", "Ashley", "Kevin", "Nicole", "Brian",
    "Rachel", "Mark", "Jennifer", "Jason", "Michelle", "Steve", "Laura",
    "Eric", "Stephanie", "Jeff", "Amanda", "Dan", "Megan", "Matt", "Katie"
  ];

  for (let i = 0; i < count; i++) {
    // Create realistic distribution of skill levels
    const skillTier = Math.random();
    let baseWinRate: number;
    let basePPR: number;
    let baseAccuracy: number;

    if (skillTier < 0.1) {
      // Top 10% - Elite players
      baseWinRate = 70 + Math.random() * 20;
      basePPR = 7 + Math.random() * 3;
      baseAccuracy = 55 + Math.random() * 20;
    } else if (skillTier < 0.3) {
      // Next 20% - Advanced players
      baseWinRate = 60 + Math.random() * 10;
      basePPR = 5.5 + Math.random() * 1.5;
      baseAccuracy = 45 + Math.random() * 10;
    } else if (skillTier < 0.7) {
      // Middle 40% - Intermediate players
      baseWinRate = 45 + Math.random() * 15;
      basePPR = 4 + Math.random() * 1.5;
      baseAccuracy = 30 + Math.random() * 15;
    } else {
      // Bottom 30% - Beginners
      baseWinRate = 25 + Math.random() * 20;
      basePPR = 2 + Math.random() * 2;
      baseAccuracy = 15 + Math.random() * 15;
    }

    const totalGames = Math.floor(10 + Math.random() * 200);
    const totalWins = Math.floor((totalGames * baseWinRate) / 100);
    const fourBaggers = Math.floor(totalGames * (baseAccuracy / 100) * 0.05);

    users.push({
      userId: `user_${i}`,
      userName: `${names[i % names.length]}${i > names.length ? Math.floor(i / names.length) : ""}`,
      totalGames,
      totalWins,
      winPercentage: baseWinRate,
      averagePointsPerRound: basePPR,
      bagsInPercentage: baseAccuracy,
      fourBaggers,
      dominanceRating:
        baseWinRate * 0.3 +
        baseAccuracy * 0.25 +
        basePPR * 10 * 0.25 +
        (baseWinRate * 0.2) // Clutch factor approximation
    });
  }

  return users;
};

// Convert personal stats to global user stats format
const convertToGlobalUserStats = (personalStats: PersonalStats, userName: string): GlobalUserStats => {
  return {
    userId: "current_user",
    userName,
    totalGames: personalStats.totalGames,
    totalWins: personalStats.totalWins,
    winPercentage: personalStats.winPercentage,
    averagePointsPerRound: personalStats.averagePointsPerRound,
    bagsInPercentage: personalStats.bagsInPercentage,
    fourBaggers: personalStats.fourBaggers,
    dominanceRating: personalStats.dominanceRating
  };
};

// Calculate global stats comparison
export const getGlobalStatsComparison = (
  personalStats: PersonalStats,
  userName: string
): GlobalStatsComparison => {
  // Generate mock global users (simulating other app users)
  const mockUsers = generateMockUsers(500); // Simulate 500 users

  // Convert current user stats
  const yourStats = convertToGlobalUserStats(personalStats, userName);

  // Add current user to the list
  const allUsers = [...mockUsers, yourStats];

  // Sort by dominance rating
  const sortedUsers = allUsers.sort((a, b) => b.dominanceRating - a.dominanceRating);

  // Find user rank
  const globalRank = sortedUsers.findIndex(u => u.userId === "current_user") + 1;
  const totalUsers = sortedUsers.length;
  const percentile = ((totalUsers - globalRank + 1) / totalUsers) * 100;

  // Get top 10 for leaderboard
  const globalLeaderboard = sortedUsers.slice(0, 10);

  return {
    yourStats,
    globalRank,
    totalUsers,
    percentile,
    globalLeaderboard
  };
};

// Get stats by specific metric
export const getGlobalRankByMetric = (
  personalStats: PersonalStats,
  userName: string,
  metric: "winPercentage" | "averagePointsPerRound" | "bagsInPercentage" | "fourBaggers"
): { rank: number; totalUsers: number; percentile: number } => {
  const mockUsers = generateMockUsers(500);
  const yourStats = convertToGlobalUserStats(personalStats, userName);
  const allUsers = [...mockUsers, yourStats];

  // Sort by the specified metric
  const sortedUsers = allUsers.sort((a, b) => b[metric] - a[metric]);

  const rank = sortedUsers.findIndex(u => u.userId === "current_user") + 1;
  const totalUsers = sortedUsers.length;
  const percentile = ((totalUsers - rank + 1) / totalUsers) * 100;

  return { rank, totalUsers, percentile };
};
