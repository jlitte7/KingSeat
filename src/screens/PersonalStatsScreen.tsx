import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";

type PersonalStatsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalStats"
>;

export default function PersonalStatsScreen() {
  const navigation = useNavigation<PersonalStatsNavigationProp>();
  const stats = usePersonalStatsStore((s) => s.stats);
  const settings = usePersonalStatsStore((s) => s.settings);
  const matches = usePersonalStatsStore((s) => s.matches);

  const hasStats = stats.totalGames > 0;

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
            {/* Overall Performance */}
            <View className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 mb-4">
              <Text className="text-white text-lg font-bold mb-4">
                Overall Performance
              </Text>
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-purple-200 text-xs mb-1">
                    Games Played
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {stats.totalGames}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-purple-200 text-xs mb-1">
                    Win Rate
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {stats.winPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-purple-200 text-xs mb-1">
                    Record
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {stats.totalWins}-{stats.totalLosses}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-purple-200 text-xs mb-1">
                    Total Rounds
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {stats.totalRoundsPlayed}
                  </Text>
                </View>
              </View>
            </View>

            {/* Basic Performance Metrics */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Basic Performance Metrics
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">PPR</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.averagePointsPerRound.toFixed(1)}
                  </Text>
                  <Text className="text-gray-500 text-xs">Points/Round</Text>
                </View>
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">OPPR</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.opponentPointsPerRound.toFixed(1)}
                  </Text>
                  <Text className="text-gray-500 text-xs">Opp Pts/Rd</Text>
                </View>
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Pt. Diff</Text>
                  <Text className={`font-bold text-xl ${stats.pointDifferential >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stats.pointDifferential >= 0 ? "+" : ""}{stats.pointDifferential.toFixed(1)}
                  </Text>
                  <Text className="text-gray-500 text-xs">Differential</Text>
                </View>
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Total Points</Text>
                  <Text className="text-white font-bold text-lg">
                    {stats.totalPoints}
                  </Text>
                </View>
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Opp Points</Text>
                  <Text className="text-white font-bold text-lg">
                    {stats.totalOpponentPoints}
                  </Text>
                </View>
                <View className="w-1/3 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Rounds</Text>
                  <Text className="text-white font-bold text-lg">
                    {stats.totalRoundsPlayed}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bag-Placement / Throwing Statistics */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Bag-Placement / Throwing Statistics
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">% Bags &quot;In&quot; (Hole)</Text>
                  <Text className="text-green-400 font-bold text-xl">
                    {stats.bagsInPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">% Bags &quot;On Board&quot;</Text>
                  <Text className="text-blue-400 font-bold text-xl">
                    {stats.bagsOnPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">% Bags &quot;Off Board&quot;</Text>
                  <Text className="text-red-400 font-bold text-xl">
                    {stats.missPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Score %</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.scorePercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">% Four-Bagger</Text>
                  <Text className="text-yellow-400 font-bold text-xl">
                    {stats.fourBaggerRate.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Four Baggers</Text>
                  <Text className="text-yellow-400 font-bold text-xl">
                    {stats.fourBaggers}
                  </Text>
                </View>
              </View>
            </View>

            {/* Scoring Performance */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Scoring Performance
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">PPR</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.averagePointsPerRound.toFixed(1)}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">PPG</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.averagePointsPerGame.toFixed(1)}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">High Score</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.highestGameScore}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Four Baggers</Text>
                  <Text className="text-yellow-400 font-bold text-xl">
                    {stats.fourBaggers}
                  </Text>
                </View>
              </View>

              {/* PPR Breakdown */}
              <View className="mt-2 pt-4 border-t border-gray-700">
                <Text className="text-gray-400 text-xs mb-2">PPR Calculation Breakdown</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-400 text-xs">Total Raw Points (before cancellation):</Text>
                  <Text className="text-white text-xs font-bold">{stats.totalPoints}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-400 text-xs">Total Rounds Played:</Text>
                  <Text className="text-white text-xs font-bold">{Math.floor(stats.totalBagsThrown / 4)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-xs">Formula: {stats.totalPoints} ÷ {Math.floor(stats.totalBagsThrown / 4)} =</Text>
                  <Text className="text-white text-xs font-bold">{stats.averagePointsPerRound.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Win Quality */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Win Quality
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Shutouts</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.shutoutWins}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Dominant (10+)</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.dominantWins}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Close (3 or less)</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.closeWins}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Comebacks</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.comebackWins}
                  </Text>
                </View>
              </View>
            </View>

            {/* Win Streaks */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Streaks
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Current Streak
                  </Text>
                  <Text className="text-yellow-400 font-bold text-2xl">
                    {stats.currentWinStreak > 0 ? `W${stats.currentWinStreak}` : stats.currentLosingStreak > 0 ? `L${stats.currentLosingStreak}` : "-"}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Best Win Streak
                  </Text>
                  <Text className="text-white font-bold text-2xl">
                    {stats.longestWinStreak}
                  </Text>
                </View>
              </View>
            </View>

            {/* Advanced Metrics */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Advanced Metrics
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Clutch Factor</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.clutchFactor.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Opponents Faced</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.totalOpponents}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Matches with Round Details */}
            {matches.length > 0 && (
              <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <Text className="text-white text-lg font-bold mb-4">
                  Recent Matches ({matches.length})
                </Text>
                {matches
                  .slice(-5)
                  .reverse()
                  .map((match) => {
                    // Calculate raw points for this match
                    let matchRawPoints = 0;
                    match.rounds.forEach((round) => {
                      matchRawPoints += (round.myBagsIn * 3) + (round.myBagsOn * 1);
                    });
                    const matchPPR = match.rounds.length > 0 ? (matchRawPoints / match.rounds.length).toFixed(2) : "0.00";

                    return (
                      <View
                        key={match.id}
                        className="py-3 border-b border-gray-700 last:border-b-0"
                      >
                        <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-1">
                            <Text className="text-white font-bold">
                              {match.opponent
                                ? `vs ${match.opponent}`
                                : "Solo Practice"}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                              {new Date(match.date).toLocaleDateString()} •{" "}
                              {match.rounds.length} rounds
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text
                              className={`font-bold text-base ${
                                match.won === true
                                  ? "text-green-400"
                                  : match.won === false
                                  ? "text-red-400"
                                  : "text-white"
                              }`}
                            >
                              {match.myScore} - {match.opponentScore}
                            </Text>
                            {match.won !== undefined && (
                              <Text
                                className={`text-xs ${
                                  match.won ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {match.won ? "Won" : "Lost"}
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Round by round breakdown */}
                        <View className="mt-2 pl-2 border-l-2 border-purple-600">
                          <Text className="text-gray-400 text-xs mb-1">Round Details:</Text>
                          {match.rounds.map((round, idx) => {
                            const rawPts = (round.myBagsIn * 3) + (round.myBagsOn * 1);
                            return (
                              <Text key={idx} className="text-gray-300 text-xs">
                                R{round.roundNumber}: {round.myBagsIn}in + {round.myBagsOn}on = {rawPts}pts (scored: {round.myScore})
                              </Text>
                            );
                          })}
                          <Text className="text-purple-400 text-xs mt-1 font-bold">
                            Match PPR: {matchPPR} ({matchRawPoints} raw pts ÷ {match.rounds.length} rounds)
                          </Text>
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
                className="bg-purple-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-bold text-base">Log New Match</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
