import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type ClubhouseNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Clubhouse"
>;

export default function ClubhouseScreen() {
  const navigation = useNavigation<ClubhouseNavigationProp>();
  const teams = useTossSeriesStore((s) => s.teams);
  const deleteTeam = useTossSeriesStore((s) => s.deleteTeam);
  const generateSampleData = useTossSeriesStore((s) => s.generateSampleData);
  const toggleTeamVisibility = useTossSeriesStore((s) => s.toggleTeamVisibility);

  const [viewMode, setViewMode] = useState<"all" | "visible" | "hidden">("visible");

  // Filter teams based on view mode
  const filteredTeams = teams.filter((team) => {
    if (viewMode === "all") return true;
    if (viewMode === "visible") return !team.isHidden;
    if (viewMode === "hidden") return team.isHidden;
    return true;
  });

  const visibleTeamsCount = teams.filter((t) => !t.isHidden).length;
  const hiddenTeamsCount = teams.filter((t) => t.isHidden).length;

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete ${teamName}? This will also delete all players on this team.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTeam(teamId),
        },
      ]
    );
  };

  const handleGenerateSampleData = () => {
    console.log("Generate Sample Data button pressed");
    Alert.alert(
      "Generate Sample Data",
      "This will create 6 teams with 10 players each for testing. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => {
            console.log("User confirmed, calling generateSampleData()");
            generateSampleData();
            Alert.alert("Success", "Sample data has been generated! 6 teams with 10 players each have been created.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Clubhouse</Text>
          </View>
          <View className="flex-row items-center">
            <Pressable
              onPress={handleGenerateSampleData}
              className="bg-gray-700 px-3 py-2 rounded-lg mr-2 border border-gray-600"
            >
              <Text className="text-gray-300 font-bold text-xs">Sample Data</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("CreateTeam")}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-bold">+ Team</Text>
            </Pressable>
          </View>
        </View>

        {teams.length > 0 && (
          <View className="px-4 py-3 border-b border-gray-800">
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setViewMode("visible")}
                className={`flex-1 py-2 rounded-lg ${
                  viewMode === "visible" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                <Text className={`text-center font-bold ${
                  viewMode === "visible" ? "text-white" : "text-gray-400"
                }`}>
                  Active ({visibleTeamsCount})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode("hidden")}
                className={`flex-1 py-2 rounded-lg ${
                  viewMode === "hidden" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                <Text className={`text-center font-bold ${
                  viewMode === "hidden" ? "text-white" : "text-gray-400"
                }`}>
                  Hidden ({hiddenTeamsCount})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode("all")}
                className={`flex-1 py-2 rounded-lg ${
                  viewMode === "all" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                <Text className={`text-center font-bold ${
                  viewMode === "all" ? "text-white" : "text-gray-400"
                }`}>
                  All ({teams.length})
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {teams.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="people-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Teams Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Create your first team or generate sample data for testing
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateTeam")}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Create Team</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {filteredTeams.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Ionicons name="eye-off-outline" size={60} color="#4b5563" />
                <Text className="text-gray-400 text-lg font-bold text-center mt-4">
                  {viewMode === "hidden"
                    ? "No Hidden Teams"
                    : "No Active Teams"}
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  {viewMode === "hidden"
                    ? "You can hide teams from the team list"
                    : "All teams are currently hidden"}
                </Text>
              </View>
            ) : (
              filteredTeams.map((team) => (
                <Pressable
                  key={team.id}
                  onPress={() =>
                    navigation.navigate("TeamDetail", { teamId: team.id })
                  }
                  className="mb-3"
                >
                  <View className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <LinearGradient
                      colors={["#1f2937", "#111827"]}
                      style={{ padding: 16 }}
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-white text-xl font-bold">
                              {team.name}
                            </Text>
                            {team.isHidden && (
                              <View className="ml-2 bg-yellow-600/30 px-2 py-1 rounded">
                                <Text className="text-yellow-400 text-xs font-bold">
                                  Hidden
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-gray-400 text-sm mt-1">
                            {team.players.length}{" "}
                            {team.players.length === 1 ? "Player" : "Players"}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleTeamVisibility(team.id);
                            }}
                            className="p-2"
                          >
                            <Ionicons
                              name={team.isHidden ? "eye-outline" : "eye-off-outline"}
                              size={20}
                              color={team.isHidden ? "#10b981" : "#f59e0b"}
                            />
                          </Pressable>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteTeam(team.id, team.name);
                            }}
                            className="p-2"
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#ef4444"
                            />
                          </Pressable>
                        </View>
                      </View>

                      <View className="flex-row">
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Wins</Text>
                          <Text className="text-white font-bold text-lg">
                            {team.stats.totalWins}
                          </Text>
                        </View>
                        <View className="w-2" />
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Losses</Text>
                          <Text className="text-white font-bold text-lg">
                            {team.stats.totalLosses}
                          </Text>
                        </View>
                        <View className="w-2" />
                        <View className="flex-1 items-center bg-gray-900/50 rounded-lg py-2">
                          <Text className="text-gray-400 text-xs">Games</Text>
                          <Text className="text-white font-bold text-lg">
                            {team.stats.totalGames}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        )}

        {visibleTeamsCount >= 2 && (
          <View className="px-4 pb-4 pt-2 border-t border-gray-800">
            <Pressable
              onPress={() => navigation.navigate("LeagueList")}
              className="bg-purple-600 py-4 rounded-lg items-center mb-3"
            >
              <Text className="text-white font-bold text-lg">
                🏆 View Leagues
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("SeriesSetup")}
              className="bg-red-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-bold text-lg">
                🎯 Start Single Match
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
