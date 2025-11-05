import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type LeagueListNavigationProp = NativeStackNavigationProp<RootStackParamList, "LeagueList">;

export default function LeagueListScreen() {
  const navigation = useNavigation<LeagueListNavigationProp>();
  const leagues = useTossSeriesStore((s) => s.leagues);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">My Leagues</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("CreateLeague")}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">+ League</Text>
          </Pressable>
        </View>

        {leagues.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="trophy-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Leagues Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Create your first league to start tracking multi-week schedules
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateLeague")}
              className="bg-purple-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Create League</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {leagues.map((league) => {
              const totalMatches = league.schedule.reduce(
                (sum, week) => sum + week.matches.length,
                0
              );
              const completedMatches = league.schedule.reduce(
                (sum, week) =>
                  sum + week.matches.filter((m) => m.completed).length,
                0
              );
              const progressPercentage =
                totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

              return (
                <Pressable
                  key={league.id}
                  onPress={() =>
                    navigation.navigate("LeagueSchedule", { leagueId: league.id })
                  }
                  className="mb-3"
                >
                  <View className="rounded-xl overflow-hidden border border-gray-700">
                    <LinearGradient
                      colors={
                        league.completed
                          ? ["#065f46", "#064e3b"] as const
                          : ["#1f2937", "#111827"] as const
                      }
                      style={{ padding: 16 }}
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-white text-xl font-bold mb-1">
                            {league.name}
                          </Text>
                          <Text className="text-gray-400 text-sm">
                            {league.teamIds.length} Teams · {league.numberOfWeeks} Weeks
                          </Text>
                        </View>
                        {league.completed && (
                          <View className="bg-green-600/20 px-3 py-1 rounded">
                            <Text className="text-green-400 text-xs font-bold">
                              Complete
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Progress Bar */}
                      <View className="mb-3">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-gray-400 text-xs">
                            Matches Progress
                          </Text>
                          <Text className="text-gray-400 text-xs">
                            {completedMatches}/{totalMatches}
                          </Text>
                        </View>
                        <View className="bg-gray-700 rounded-full h-2 overflow-hidden">
                          <View
                            className="bg-purple-600 h-full"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </View>
                      </View>

                      {/* Stats Row */}
                      <View className="flex-row">
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Current Week</Text>
                          <Text className="text-white font-bold text-lg">
                            {league.currentWeek}
                          </Text>
                        </View>
                        <View className="w-2" />
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Total Weeks</Text>
                          <Text className="text-white font-bold text-lg">
                            {league.numberOfWeeks}
                          </Text>
                        </View>
                        <View className="w-2" />
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Teams</Text>
                          <Text className="text-white font-bold text-lg">
                            {league.teamIds.length}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
