import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type LeagueScheduleRouteProp = RouteProp<RootStackParamList, "LeagueSchedule">;
type LeagueScheduleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LeagueSchedule"
>;

export default function LeagueScheduleScreen() {
  const navigation = useNavigation<LeagueScheduleNavigationProp>();
  const route = useRoute<LeagueScheduleRouteProp>();
  const { leagueId } = route.params;

  const league = useTossSeriesStore((s) => s.getLeagueById(leagueId));

  if (!league) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">League not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{league.name}</Text>
            <Text className="text-gray-400 text-sm">
              {league.teamIds.length} Teams · {league.numberOfWeeks} Weeks
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {league.schedule.map((week) => (
            <View key={week.weekNumber} className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-600 px-3 py-1 rounded-lg mr-3">
                  <Text className="text-white font-bold">Week {week.weekNumber}</Text>
                </View>
                <Text className="text-gray-400 text-sm">
                  {week.matches.length} {week.matches.length === 1 ? "Match" : "Matches"}
                </Text>
              </View>

              {week.matches.map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() =>
                    navigation.navigate("LeagueMatchDetail", {
                      matchId: match.id,
                      leagueId: league.id,
                    })
                  }
                  className="mb-3"
                >
                  <View className="rounded-xl overflow-hidden border border-gray-700">
                    <LinearGradient
                      colors={
                        match.completed
                          ? ["#065f46", "#064e3b"] as const
                          : ["#1f2937", "#111827"] as const
                      }
                      style={{ padding: 16 }}
                    >
                      {/* Teams */}
                      <View className="mb-3">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-white text-lg font-bold flex-1">
                            {match.awayTeamName}
                          </Text>
                          <View className="bg-gray-800/50 px-3 py-1 rounded">
                            <Text className="text-white font-bold">
                              {match.awayTeamScore}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-white text-lg font-bold flex-1">
                            {match.homeTeamName}
                          </Text>
                          <View className="bg-gray-800/50 px-3 py-1 rounded">
                            <Text className="text-white font-bold">
                              {match.homeTeamScore}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Status */}
                      <View className="flex-row items-center justify-between pt-3 border-t border-gray-700">
                        <View className="flex-row items-center">
                          <Ionicons
                            name={
                              match.completed
                                ? "checkmark-circle"
                                : "time-outline"
                            }
                            size={16}
                            color={match.completed ? "#10b981" : "#6b7280"}
                          />
                          <Text
                            className={`ml-2 text-sm ${
                              match.completed ? "text-green-400" : "text-gray-400"
                            }`}
                          >
                            {match.completed ? "Completed" : "Not Started"}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-gray-400 text-sm mr-1">
                            {match.games.filter((g) => g.completed).length}/12 games
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#6b7280"
                          />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
