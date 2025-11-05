import React from "react";
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
    Alert.alert(
      "Generate Sample Data",
      "This will create 6 teams with 10 players each for testing. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => {
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
          <Pressable
            onPress={() => navigation.navigate("CreateTeam")}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">+ Team</Text>
          </Pressable>
        </View>

        {teams.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="people-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Teams Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Create your first team to start tracking league games
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateTeam")}
              className="bg-blue-600 px-6 py-3 rounded-lg mb-3"
            >
              <Text className="text-white font-bold">Create Team</Text>
            </Pressable>
            <Pressable
              onPress={handleGenerateSampleData}
              className="bg-gray-700 px-6 py-3 rounded-lg border border-gray-600"
            >
              <Text className="text-gray-300 font-bold">Generate Sample Data</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {teams.map((team) => (
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
                        <Text className="text-white text-xl font-bold">
                          {team.name}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-1">
                          {team.players.length}{" "}
                          {team.players.length === 1 ? "Player" : "Players"}
                        </Text>
                      </View>
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
            ))}
          </ScrollView>
        )}

        {teams.length >= 2 && (
          <View className="px-4 pb-4 pt-2 border-t border-gray-800">
            <Pressable
              onPress={() => navigation.navigate("SeriesSetup")}
              className="bg-red-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-bold text-lg">
                🎯 Start League Match
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
