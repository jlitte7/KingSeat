import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type CreateLeagueNavigationProp = NativeStackNavigationProp<RootStackParamList, "CreateLeague">;

export default function CreateLeagueScreen() {
  const navigation = useNavigation<CreateLeagueNavigationProp>();
  const teams = useTossSeriesStore((s) => s.teams);
  const createLeague = useTossSeriesStore((s) => s.createLeague);
  const setCurrentLeague = useTossSeriesStore((s) => s.setCurrentLeague);

  const [leagueName, setLeagueName] = useState("");
  const [numberOfWeeks, setNumberOfWeeks] = useState("8");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const handleTeamToggle = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleCreateLeague = () => {
    if (!leagueName.trim()) {
      Alert.alert("League Name Required", "Please enter a name for your league");
      return;
    }

    if (selectedTeamIds.length < 2) {
      Alert.alert("Not Enough Teams", "You need at least 2 teams to create a league");
      return;
    }

    const weeks = parseInt(numberOfWeeks, 10);
    if (isNaN(weeks) || weeks < 1) {
      Alert.alert("Invalid Weeks", "Please enter a valid number of weeks (minimum 1)");
      return;
    }

    try {
      const league = createLeague(leagueName.trim(), selectedTeamIds, weeks);
      setCurrentLeague(league);

      Alert.alert(
        "League Created!",
        `${leagueName} has been created with ${selectedTeamIds.length} teams for ${weeks} weeks.`,
        [
          {
            text: "View Schedule",
            onPress: () => navigation.navigate("LeagueSchedule", { leagueId: league.id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create league");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Create League</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* League Name */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">League Name</Text>
            <TextInput
              value={leagueName}
              onChangeText={setLeagueName}
              placeholder="Enter league name..."
              placeholderTextColor="#6b7280"
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
            />
          </View>

          {/* Number of Weeks */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">Number of Weeks</Text>
            <TextInput
              value={numberOfWeeks}
              onChangeText={setNumberOfWeeks}
              placeholder="8"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
            />
            <Text className="text-gray-400 text-sm mt-2">
              Each team will play one match per week in a round-robin format
            </Text>
          </View>

          {/* Team Selection */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">
              Select Teams ({selectedTeamIds.length} selected)
            </Text>
            {teams.length === 0 ? (
              <View className="bg-gray-800/50 rounded-lg p-6 items-center">
                <Ionicons name="people-outline" size={48} color="#6b7280" />
                <Text className="text-gray-400 text-center mt-3">
                  No teams available. Create teams first.
                </Text>
              </View>
            ) : (
              teams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);

                return (
                  <Pressable
                    key={team.id}
                    onPress={() => handleTeamToggle(team.id)}
                    className="mb-3"
                  >
                    <View
                      className={`rounded-xl overflow-hidden border-2 ${
                        isSelected ? "border-blue-600" : "border-gray-700"
                      }`}
                    >
                      <LinearGradient
                        colors={
                          isSelected
                            ? ["#1e40af", "#1e3a8a"] as const
                            : ["#1f2937", "#111827"] as const
                        }
                        style={{ padding: 16 }}
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <Text className="text-white text-lg font-bold">
                              {team.name}
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1">
                              {team.players.length} players
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={28} color="#3b82f6" />
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          {/* Info Box */}
          <View className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
            <Text className="text-blue-300 text-sm font-bold mb-2">League Format:</Text>
            <Text className="text-blue-200 text-sm">• Round-robin scheduling</Text>
            <Text className="text-blue-200 text-sm">• Each team plays every other team</Text>
            <Text className="text-blue-200 text-sm">• 12 games per match</Text>
            <Text className="text-blue-200 text-sm">• One match per week per team</Text>
            <Text className="text-blue-200 text-sm">• Rotates through all teams before repeating</Text>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <Pressable
            onPress={handleCreateLeague}
            disabled={!leagueName.trim() || selectedTeamIds.length < 2}
            className={`py-4 rounded-lg items-center ${
              leagueName.trim() && selectedTeamIds.length >= 2
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
          >
            <Text className="text-white font-bold text-lg">Create League</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
