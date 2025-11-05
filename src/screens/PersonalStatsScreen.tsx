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

  const hasStats = stats.totalThrows > 0;

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
              onPress={() => navigation.navigate("PersonalQuickLog")}
              className="bg-purple-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-bold">Quick Log</Text>
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
              Start logging your bag throws to track your personal performance
            </Text>
            <Pressable
              onPress={() => navigation.navigate("PersonalQuickLog")}
              className="bg-purple-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold text-base">
                Start Logging Throws
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {/* Overview Card */}
            <View className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 mb-4">
              <Text className="text-white text-lg font-bold mb-4">
                Overall Performance
              </Text>
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-purple-200 text-xs mb-1">
                    Total Throws
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {stats.totalThrows}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-purple-200 text-xs mb-1">
                    Board Accuracy
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {stats.boardPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-purple-200 text-xs mb-1">
                    In the Hole
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {stats.totalIn} ({stats.inPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-purple-200 text-xs mb-1">
                    On the Board
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {stats.totalOn} ({stats.onPercentage.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            </View>

            {/* Accuracy Breakdown */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Accuracy Breakdown
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">In %</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.inPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">On %</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.onPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Board %</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.boardPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">Miss %</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.missPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Streaks */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">Streaks</Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Current In Streak
                  </Text>
                  <Text className="text-yellow-400 font-bold text-2xl">
                    {stats.currentInStreak}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Best In Streak
                  </Text>
                  <Text className="text-white font-bold text-2xl">
                    {stats.bestInStreak}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Current Board Streak
                  </Text>
                  <Text className="text-yellow-400 font-bold text-2xl">
                    {stats.currentBoardStreak}
                  </Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-400 text-xs mb-1">
                    Best Board Streak
                  </Text>
                  <Text className="text-white font-bold text-2xl">
                    {stats.bestBoardStreak}
                  </Text>
                </View>
              </View>
            </View>

            {/* Round Performance */}
            <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Round Performance
              </Text>
              <View className="flex-row justify-between">
                <View className="flex-1 items-center bg-gray-700 rounded-lg py-3 mr-2">
                  <Text className="text-gray-400 text-xs mb-1">
                    Four Baggers
                  </Text>
                  <Text className="text-yellow-400 font-bold text-2xl">
                    {stats.fourBaggers}
                  </Text>
                </View>
                <View className="flex-1 items-center bg-gray-700 rounded-lg py-3 ml-2">
                  <Text className="text-gray-400 text-xs mb-1">
                    Three Baggers
                  </Text>
                  <Text className="text-white font-bold text-2xl">
                    {stats.threeBaggers}
                  </Text>
                </View>
              </View>
            </View>

            {/* Match Record (if applicable) */}
            {stats.matchesPlayed > 0 && (
              <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <Text className="text-white text-lg font-bold mb-4">
                  Match Record
                </Text>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-400 text-xs mb-1">Record</Text>
                    <Text className="text-white font-bold text-2xl">
                      {stats.matchesWon}-{stats.matchesPlayed - stats.matchesWon}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-400 text-xs mb-1">Win Rate</Text>
                    <Text className="text-green-400 font-bold text-2xl">
                      {stats.winPercentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recent Matches */}
            {matches.length > 0 && (
              <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <Text className="text-white text-lg font-bold mb-4">
                  Recent Matches ({matches.length})
                </Text>
                {matches
                  .slice(-5)
                  .reverse()
                  .map((match) => (
                    <View
                      key={match.id}
                      className="flex-row justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
                    >
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
                        {match.opponentScore !== undefined ? (
                          <>
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
                          </>
                        ) : (
                          <Text className="text-white font-bold text-base">
                            {match.myScore} pts
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={() => navigation.navigate("PersonalQuickLog")}
                className="flex-1 bg-purple-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Quick Log</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("PersonalMatchLog")}
                className="flex-1 bg-gray-700 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Log Match</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
