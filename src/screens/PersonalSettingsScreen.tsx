import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";

type PersonalSettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalSettings"
>;

export default function PersonalSettingsScreen() {
  const navigation = useNavigation<PersonalSettingsNavigationProp>();
  const settings = usePersonalStatsStore((s) => s.settings);
  const updateSettings = usePersonalStatsStore((s) => s.updateSettings);
  const resetPersonalStats = usePersonalStatsStore((s) => s.resetPersonalStats);
  const players = useTossSeriesStore((s) => s.players);
  const getPlayerById = useTossSeriesStore((s) => s.getPlayerById);

  const [myName, setMyName] = useState(settings.myName);
  const [showQuickLog, setShowQuickLog] = useState(settings.showQuickLog);
  const [syncWithTeamStats, setSyncWithTeamStats] = useState(settings.syncWithTeamStats);

  const linkedPlayer = settings.linkedPlayerId
    ? getPlayerById(settings.linkedPlayerId)
    : null;

  const handleSave = () => {
    if (!myName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    updateSettings({
      myName: myName.trim(),
      showQuickLog,
      syncWithTeamStats,
    });

    Alert.alert("Success", "Settings saved successfully");
  };

  const handleLinkPlayer = () => {
    if (players.length === 0) {
      Alert.alert(
        "No Players",
        "You need to create at least one player in the Clubhouse first.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Clubhouse",
            onPress: () => navigation.navigate("Clubhouse"),
          },
        ]
      );
      return;
    }

    // Show player selection
    Alert.alert(
      "Link Player",
      "Select which player profile represents you:",
      [
        ...players.map((player) => ({
          text: `${player.name}${player.nickname ? ` (${player.nickname})` : ""}`,
          onPress: () => {
            updateSettings({ linkedPlayerId: player.id, myName: player.name });
            setMyName(player.name);
            Alert.alert("Linked", `Your personal stats are now linked to ${player.name}`);
          },
        })),
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleUnlinkPlayer = () => {
    Alert.alert(
      "Unlink Player",
      "Are you sure you want to unlink your player profile? Your personal stats will remain but won't sync with team stats.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: () => {
            updateSettings({ linkedPlayerId: undefined, syncWithTeamStats: false });
            setSyncWithTeamStats(false);
            Alert.alert("Unlinked", "Player profile has been unlinked");
          },
        },
      ]
    );
  };

  const handleResetStats = () => {
    Alert.alert(
      "Reset All Stats",
      "This will permanently delete all your personal bag tracking data, matches, and statistics. This cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            resetPersonalStats();
            Alert.alert("Reset Complete", "All personal stats have been cleared");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Personal Settings</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Basic Info */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Basic Info</Text>
            <View className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-gray-400 text-sm mb-2">Your Name</Text>
              <TextInput
                value={myName}
                onChangeText={setMyName}
                placeholder="Enter your name"
                placeholderTextColor="#6b7280"
                className="bg-gray-700 text-white px-4 py-3 rounded-lg text-base"
              />
            </View>
          </View>

          {/* Player Linking */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Link to Team Player
            </Text>
            <View className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-gray-400 text-sm mb-3">
                Link your personal stats to a player profile in the team system.
                This ensures your stats are tracked correctly across all games.
              </Text>

              {linkedPlayer ? (
                <View className="bg-gray-700 rounded-lg p-3 mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-bold">
                        {linkedPlayer.name}
                      </Text>
                      {linkedPlayer.nickname && (
                        <Text className="text-gray-400 text-sm">
                          {linkedPlayer.nickname}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  </View>
                </View>
              ) : (
                <View className="bg-gray-700 rounded-lg p-3 mb-3">
                  <Text className="text-gray-400 text-sm text-center">
                    No player linked
                  </Text>
                </View>
              )}

              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleLinkPlayer}
                  className="flex-1 bg-purple-600 py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-bold">
                    {linkedPlayer ? "Change Player" : "Link Player"}
                  </Text>
                </Pressable>
                {linkedPlayer && (
                  <Pressable
                    onPress={handleUnlinkPlayer}
                    className="flex-1 bg-gray-700 py-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold">Unlink</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Tracking Options */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Tracking Options
            </Text>

            <View className="bg-gray-800 rounded-lg border border-gray-700">
              <View className="p-4 border-b border-gray-700">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-bold mb-1">
                      Show Quick Log
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Display quick log option during games
                    </Text>
                  </View>
                  <Switch
                    value={showQuickLog}
                    onValueChange={setShowQuickLog}
                    trackColor={{ false: "#374151", true: "#9333ea" }}
                    thumbColor={showQuickLog ? "#a855f7" : "#6b7280"}
                  />
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-bold mb-1">
                      Sync with Team Stats
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {linkedPlayer
                        ? "Automatically update team player stats from personal logs"
                        : "Link a player first to enable syncing"}
                    </Text>
                  </View>
                  <Switch
                    value={syncWithTeamStats}
                    onValueChange={setSyncWithTeamStats}
                    disabled={!linkedPlayer}
                    trackColor={{ false: "#374151", true: "#9333ea" }}
                    thumbColor={
                      syncWithTeamStats && linkedPlayer ? "#a855f7" : "#6b7280"
                    }
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            className="bg-purple-600 py-4 rounded-lg items-center mb-6"
          >
            <Text className="text-white font-bold text-base">Save Settings</Text>
          </Pressable>

          {/* Danger Zone */}
          <View className="mb-8">
            <Text className="text-red-400 text-lg font-bold mb-4">Danger Zone</Text>
            <Pressable
              onPress={handleResetStats}
              className="bg-red-600/20 border border-red-600 py-4 rounded-lg items-center"
            >
              <Text className="text-red-400 font-bold text-base">
                Reset All Personal Stats
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
