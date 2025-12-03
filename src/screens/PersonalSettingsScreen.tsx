import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { AlertModal } from "../components/AlertModal";
import { ConfirmModal } from "../components/ConfirmModal";

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

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showNoPlayersAlert, setShowNoPlayersAlert] = useState(false);
  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [showLinkedAlert, setShowLinkedAlert] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showUnlinkedAlert, setShowUnlinkedAlert] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetCompleteAlert, setShowResetCompleteAlert] = useState(false);

  const linkedPlayer = settings.linkedPlayerId
    ? getPlayerById(settings.linkedPlayerId)
    : null;

  const handleSave = () => {
    if (!myName.trim()) {
      setShowErrorAlert(true);
      return;
    }

    updateSettings({
      myName: myName.trim(),
      showQuickLog,
      syncWithTeamStats,
    });

    setShowSuccessAlert(true);
  };

  const handleLinkPlayer = () => {
    if (players.length === 0) {
      setShowNoPlayersAlert(true);
      return;
    }

    // For now, just link the first player - in a real app you'd show a picker
    const player = players[0];
    setSelectedPlayerId(player.id);
    setSelectedPlayerName(player.name);
    setShowLinkConfirm(true);
  };

  const handleConfirmLink = () => {
    if (selectedPlayerId && selectedPlayerName) {
      updateSettings({ linkedPlayerId: selectedPlayerId, myName: selectedPlayerName });
      setMyName(selectedPlayerName);
      setShowLinkConfirm(false);
      setShowLinkedAlert(true);
    }
  };

  const handleUnlinkPlayer = () => {
    setShowUnlinkConfirm(true);
  };

  const handleConfirmUnlink = () => {
    updateSettings({ linkedPlayerId: undefined, syncWithTeamStats: false });
    setSyncWithTeamStats(false);
    setShowUnlinkConfirm(false);
    setShowUnlinkedAlert(true);
  };

  const handleResetStats = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    resetPersonalStats();
    setShowResetConfirm(false);
    setShowResetCompleteAlert(true);
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

      {/* Modals */}
      <AlertModal
        visible={showErrorAlert}
        title="Error"
        message="Please enter your name"
        onClose={() => setShowErrorAlert(false)}
      />

      <AlertModal
        visible={showSuccessAlert}
        title="Success"
        message="Settings saved successfully"
        onClose={() => setShowSuccessAlert(false)}
      />

      <ConfirmModal
        visible={showNoPlayersAlert}
        title="No Players"
        message="You need to create at least one player in the Clubhouse first."
        confirmText="Go to Clubhouse"
        cancelText="Cancel"
        onConfirm={() => {
          setShowNoPlayersAlert(false);
          navigation.navigate("Clubhouse");
        }}
        onCancel={() => setShowNoPlayersAlert(false)}
      />

      <ConfirmModal
        visible={showLinkConfirm}
        title="Link Player"
        message={`Link your personal stats to ${selectedPlayerName}?`}
        confirmText="Link"
        cancelText="Cancel"
        onConfirm={handleConfirmLink}
        onCancel={() => setShowLinkConfirm(false)}
      />

      <AlertModal
        visible={showLinkedAlert}
        title="Linked"
        message={`Your personal stats are now linked to ${selectedPlayerName}`}
        onClose={() => setShowLinkedAlert(false)}
      />

      <ConfirmModal
        visible={showUnlinkConfirm}
        title="Unlink Player"
        message="Are you sure you want to unlink your player profile? Your personal stats will remain but won't sync with team stats."
        confirmText="Unlink"
        cancelText="Cancel"
        confirmDestructive={true}
        onConfirm={handleConfirmUnlink}
        onCancel={() => setShowUnlinkConfirm(false)}
      />

      <AlertModal
        visible={showUnlinkedAlert}
        title="Unlinked"
        message="Player profile has been unlinked"
        onClose={() => setShowUnlinkedAlert(false)}
      />

      <ConfirmModal
        visible={showResetConfirm}
        title="Reset All Stats"
        message="This will permanently delete all your personal bag tracking data, matches, and statistics. This cannot be undone!"
        confirmText="Reset Everything"
        cancelText="Cancel"
        confirmDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <AlertModal
        visible={showResetCompleteAlert}
        title="Reset Complete"
        message="All personal stats have been cleared"
        onClose={() => setShowResetCompleteAlert(false)}
      />
    </View>
  );
}
