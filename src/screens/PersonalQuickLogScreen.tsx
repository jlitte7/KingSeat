import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";

type PersonalQuickLogNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalQuickLog"
>;

export default function PersonalQuickLogScreen() {
  const navigation = useNavigation<PersonalQuickLogNavigationProp>();
  const stats = usePersonalStatsStore((s) => s.stats);
  const quickLogThrow = usePersonalStatsStore((s) => s.quickLogThrow);
  const [lastThrow, setLastThrow] = useState<"in" | "on" | "miss" | null>(null);

  const handleThrow = (result: "in" | "on" | "miss") => {
    quickLogThrow(result);
    setLastThrow(result);

    // Clear last throw indicator after animation
    setTimeout(() => setLastThrow(null), 500);
  };

  const getThrowColor = (throwType: "in" | "on" | "miss") => {
    if (throwType === "in") return "bg-green-600";
    if (throwType === "on") return "bg-yellow-600";
    return "bg-red-600";
  };

  const getThrowBorderColor = (throwType: "in" | "on" | "miss") => {
    if (throwType === "in") return "border-green-400";
    if (throwType === "on") return "border-yellow-400";
    return "border-red-400";
  };

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Quick Log</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("PersonalStats")}>
            <Ionicons name="stats-chart" size={24} color="#9333ea" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* Current Stats Overview */}
          <View className="px-4 pt-6 pb-4">
            <View className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-gray-400 text-sm mb-3">Session Stats</Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">
                    {stats.totalThrows}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">Throws</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-400 text-2xl font-bold">
                    {stats.inPercentage.toFixed(0)}%
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">In</Text>
                </View>
                <View className="items-center">
                  <Text className="text-yellow-400 text-2xl font-bold">
                    {stats.boardPercentage.toFixed(0)}%
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">Board</Text>
                </View>
                <View className="items-center">
                  <Text className="text-purple-400 text-2xl font-bold">
                    {stats.currentInStreak}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">Streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Logging Buttons */}
          <View className="px-4 pb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Log Your Throw
            </Text>

            {/* In the Hole Button */}
            <Pressable
              onPress={() => handleThrow("in")}
              className={`${getThrowColor("in")} rounded-xl p-6 mb-4 border-2 ${
                lastThrow === "in" ? getThrowBorderColor("in") : "border-green-600"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold mb-1">
                    In the Hole
                  </Text>
                  <Text className="text-green-100 text-sm">
                    3 points • {stats.totalIn} total ({stats.inPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View className="bg-green-500 rounded-full p-4">
                  <Ionicons name="checkmark-circle" size={40} color="#fff" />
                </View>
              </View>
            </Pressable>

            {/* On the Board Button */}
            <Pressable
              onPress={() => handleThrow("on")}
              className={`${getThrowColor("on")} rounded-xl p-6 mb-4 border-2 ${
                lastThrow === "on" ? getThrowBorderColor("on") : "border-yellow-600"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold mb-1">
                    On the Board
                  </Text>
                  <Text className="text-yellow-100 text-sm">
                    1 point • {stats.totalOn} total ({stats.onPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View className="bg-yellow-500 rounded-full p-4">
                  <Ionicons name="remove-circle" size={40} color="#fff" />
                </View>
              </View>
            </Pressable>

            {/* Miss Button */}
            <Pressable
              onPress={() => handleThrow("miss")}
              className={`${getThrowColor("miss")} rounded-xl p-6 mb-4 border-2 ${
                lastThrow === "miss" ? getThrowBorderColor("miss") : "border-red-600"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold mb-1">Miss</Text>
                  <Text className="text-red-100 text-sm">
                    0 points • {stats.totalMisses} total ({stats.missPercentage.toFixed(1)}%)
                  </Text>
                </View>
                <View className="bg-red-500 rounded-full p-4">
                  <Ionicons name="close-circle" size={40} color="#fff" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Streaks Info */}
          <View className="px-4 pb-6">
            <View className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-white text-lg font-bold mb-4">
                Active Streaks
              </Text>
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 mr-2 bg-gray-700 rounded-lg p-3">
                  <Text className="text-gray-400 text-xs mb-1">In Streak</Text>
                  <Text className="text-green-400 text-xl font-bold">
                    {stats.currentInStreak}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Best: {stats.bestInStreak}
                  </Text>
                </View>
                <View className="flex-1 ml-2 bg-gray-700 rounded-lg p-3">
                  <Text className="text-gray-400 text-xs mb-1">Board Streak</Text>
                  <Text className="text-yellow-400 text-xl font-bold">
                    {stats.currentBoardStreak}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Best: {stats.bestBoardStreak}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Additional Options */}
          <View className="px-4 pb-8">
            <Pressable
              onPress={() => navigation.navigate("PersonalMatchLog")}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-row items-center justify-between mb-3"
            >
              <View>
                <Text className="text-white font-bold text-base">
                  Log Full Match
                </Text>
                <Text className="text-gray-400 text-sm">
                  Track a complete game with scores
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("PersonalStats")}
              className="bg-purple-600 rounded-lg p-4 flex-row items-center justify-center"
            >
              <Ionicons name="stats-chart" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                View All Stats
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
