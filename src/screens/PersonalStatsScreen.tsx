import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";
import { generateSampleSeason } from "../utils/generate-sample-season";

type PersonalStatsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalStats"
>;

export default function PersonalStatsScreen() {
  const navigation = useNavigation<PersonalStatsNavigationProp>();
  const stats = usePersonalStatsStore((s) => s.stats);
  const settings = usePersonalStatsStore((s) => s.settings);
  const matches = usePersonalStatsStore((s) => s.matches);
  const recalculateStats = usePersonalStatsStore((s) => s.recalculateStats);

  const hasStats = stats.totalGames > 0;

  const loadSampleSeason = () => {
    const sampleMatches = generateSampleSeason();
    usePersonalStatsStore.setState({ matches: sampleMatches });
    recalculateStats();
  };

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">My Stats</Text>
              <Text className="text-gray-400 text-sm">{settings.myName}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {!hasStats && (
              <Pressable
                onPress={loadSampleSeason}
                className="bg-blue-600 px-3 py-2 rounded-lg mr-2"
              >
                <Text className="text-white font-bold text-xs">Load Sample</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => navigation.navigate("PersonalSettings")}
              className="mr-2"
            >
              <Ionicons name="settings-outline" size={24} color="#9ca3af" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("PersonalMatchLog")}
              className="bg-purple-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-bold">Log Match</Text>
            </Pressable>
          </View>
        </View>

        {!hasStats ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="analytics-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Personal Stats Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Start logging matches to track your personal cornhole performance
            </Text>
            <Pressable
              onPress={() => navigation.navigate("PersonalMatchLog")}
              className="bg-purple-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold text-base">
                Log Your First Match
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {/* Hero Stats Card - Large and Eye-catching */}
            <View className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 mb-6 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-1 items-center">
                  <Text className="text-purple-200 text-sm font-semibold mb-2">
                    WIN RATE
                  </Text>
                  <Text className="text-white text-5xl font-black">
                    {(stats.winPercentage ?? 0).toFixed(0)}%
                  </Text>
                  <Text className="text-purple-200 text-xs mt-1">
                    {stats.totalWins}W-{stats.totalLosses}L
                  </Text>
                </View>

                <View className="w-px h-20 bg-purple-400 opacity-30" />

                <View className="flex-1 items-center">
                  <Text className="text-purple-200 text-sm font-semibold mb-2">
                    AVG PPR
                  </Text>
                  <Text className="text-white text-5xl font-black">
                    {(stats.averagePointsPerRound ?? 0).toFixed(1)}
                  </Text>
                  <Text className="text-purple-200 text-xs mt-1">
                    {stats.totalRoundsPlayed} rounds
                  </Text>
                </View>
              </View>

              {/* Quick Stats Row */}
              <View className="flex-row justify-around pt-4 border-t border-purple-400 border-opacity-30">
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">
                    {stats.totalGames}
                  </Text>
                  <Text className="text-purple-200 text-xs">Games</Text>
                </View>
                <View className="items-center">
                  <Text className="text-yellow-400 text-2xl font-bold">
                    {stats.fourBaggers}
                  </Text>
                  <Text className="text-purple-200 text-xs">Four Baggers</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-400 text-2xl font-bold">
                    {(stats.bagsInPercentage ?? 0).toFixed(0)}%
                  </Text>
                  <Text className="text-purple-200 text-xs">Accuracy</Text>
                </View>
              </View>
            </View>

            {/* Performance Comparison Card */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
              <Text className="text-white text-xl font-bold mb-4">
                Performance vs Opponents
              </Text>
              <View className="space-y-4">
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-sm">Your PPR</Text>
                    <Text className="text-green-400 font-bold text-lg">
                      {(stats.averagePointsPerRound ?? 0).toFixed(2)}
                    </Text>
                  </View>
                  <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(100, (stats.averagePointsPerRound / 10) * 100)}%` }}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-sm">Opponent PPR</Text>
                    <Text className="text-red-400 font-bold text-lg">
                      {(stats.opponentPointsPerRound ?? 0).toFixed(2)}
                    </Text>
                  </View>
                  <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.min(100, (stats.opponentPointsPerRound / 10) * 100)}%` }}
                    />
                  </View>
                </View>

                <View className="bg-gray-700 rounded-lg p-3 mt-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-300 text-sm">Point Differential</Text>
                    <Text className={`font-black text-2xl ${(stats.pointDifferential ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {(stats.pointDifferential ?? 0) >= 0 ? "+" : ""}{(stats.pointDifferential ?? 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Accuracy Breakdown - More Visual */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
              <Text className="text-white text-xl font-bold mb-4">
                Throwing Accuracy
              </Text>

              {/* Large Visual Bars */}
              <View className="space-y-3">
                <View>
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-full bg-green-500" />
                      <Text className="text-white font-semibold">Bags In Hole</Text>
                    </View>
                    <Text className="text-green-400 font-bold text-xl">
                      {(stats.bagsInPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.bagsInPercentage ?? 0}%` }}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-full bg-blue-500" />
                      <Text className="text-white font-semibold">Bags On Board</Text>
                    </View>
                    <Text className="text-blue-400 font-bold text-xl">
                      {(stats.bagsOnPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.bagsOnPercentage ?? 0}%` }}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-full bg-red-500" />
                      <Text className="text-white font-semibold">Bags Missed</Text>
                    </View>
                    <Text className="text-red-400 font-bold text-xl">
                      {(stats.missPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${stats.missPercentage ?? 0}%` }}
                    />
                  </View>
                </View>
              </View>

              {/* Four Bagger Rate Highlight */}
              <View className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-xl p-4 mt-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-yellow-400 font-bold text-lg">Four Bagger Rate</Text>
                  <View className="items-end">
                    <Text className="text-yellow-400 font-black text-3xl">
                      {(stats.fourBaggerRate ?? 0).toFixed(1)}%
                    </Text>
                    <Text className="text-yellow-500 text-sm">
                      {stats.fourBaggers} total
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Win Quality Grid */}
            <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
              <Text className="text-white text-xl font-bold mb-4">
                Win Quality
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                  <Text className="text-gray-400 text-xs mb-1">Shutouts</Text>
                  <Text className="text-white text-3xl font-bold">
                    {stats.shutoutWins}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                  <Text className="text-gray-400 text-xs mb-1">Dominant (10+)</Text>
                  <Text className="text-white text-3xl font-bold">
                    {stats.dominantWins}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                  <Text className="text-gray-400 text-xs mb-1">Close (≤3)</Text>
                  <Text className="text-white text-3xl font-bold">
                    {stats.closeWins}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                  <Text className="text-gray-400 text-xs mb-1">Comebacks</Text>
                  <Text className="text-white text-3xl font-bold">
                    {stats.comebackWins}
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Streak Badge */}
            {(stats.currentWinStreak > 0 || stats.currentLosingStreak > 0) && (
              <View className={`rounded-2xl p-5 mb-4 border-2 ${
                stats.currentWinStreak > 0 ? "bg-green-500 bg-opacity-10 border-green-500" : "bg-red-500 bg-opacity-10 border-red-500"
              }`}>
                <View className="items-center">
                  <Text className={`text-sm font-semibold mb-2 ${
                    stats.currentWinStreak > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    CURRENT STREAK
                  </Text>
                  <Text className={`text-6xl font-black ${
                    stats.currentWinStreak > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {stats.currentWinStreak > 0 ? `${stats.currentWinStreak}W` : `${stats.currentLosingStreak}L`}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-2">
                    Best: {stats.longestWinStreak}W
                  </Text>
                </View>
              </View>
            )}

            {/* Recent Matches - Condensed */}
            {matches.length > 0 && (
              <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
                <Text className="text-white text-xl font-bold mb-4">
                  Recent Matches ({matches.length})
                </Text>
                {matches
                  .slice(-5)
                  .reverse()
                  .map((match) => {
                    const matchRawPoints = match.rounds.reduce((sum, round) =>
                      sum + (round.myBagsIn * 3) + (round.myBagsOn * 1), 0
                    );
                    const matchPPR = match.rounds.length > 0 ? (matchRawPoints / match.rounds.length).toFixed(2) : "0.00";

                    return (
                      <View
                        key={match.id}
                        className="mb-3 bg-gray-700 rounded-xl p-4"
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <Text className="text-white font-bold text-base">
                              {match.opponent ? `vs ${match.opponent}` : "Solo Practice"}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-1">
                              {new Date(match.date).toLocaleDateString()} • {match.rounds.length} rounds • PPR: {matchPPR}
                            </Text>
                          </View>
                          <View className="items-end ml-3">
                            <Text className="text-white font-bold text-xl">
                              {match.myScore} - {match.opponentScore}
                            </Text>
                            {match.won !== undefined && (
                              <View className={`px-3 py-1 rounded-full mt-1 ${
                                match.won ? "bg-green-500" : "bg-red-500"
                              }`}>
                                <Text className="text-white text-xs font-bold">
                                  {match.won ? "Won" : "Lost"}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}

            {/* Action Button */}
            <View className="mb-6">
              <Pressable
                onPress={() => navigation.navigate("PersonalMatchLog")}
                className="bg-purple-600 py-4 rounded-2xl items-center shadow-lg"
              >
                <Text className="text-white font-bold text-lg">Log New Match</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
