import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ConfirmModal } from "../components/ConfirmModal";
import { AlertModal } from "../components/AlertModal";

type LeagueListNavigationProp = NativeStackNavigationProp<RootStackParamList, "LeagueList">;

export default function LeagueListScreen() {
  const navigation = useNavigation<LeagueListNavigationProp>();
  const leagues = useTossSeriesStore((s) => s.leagues);
  const deleteLeague = useTossSeriesStore((s) => s.deleteLeague);
  const updateLeague = useTossSeriesStore((s) => s.updateLeague);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeeks, setEditWeeks] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showEditErrorAlert, setShowEditErrorAlert] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  const handleDeleteLeague = (leagueId: string, leagueName: string) => {
    setLeagueToDelete({ id: leagueId, name: leagueName });
    setShowDeleteConfirm(true);
  };

  const handleEditLeague = (leagueId: string) => {
    const league = leagues.find((l) => l.id === leagueId);
    if (!league) return;

    setEditingLeagueId(leagueId);
    setEditName(league.name);
    setEditWeeks(league.numberOfWeeks.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingLeagueId) return;

    const trimmedName = editName.trim();
    const weeks = parseInt(editWeeks, 10);

    if (!trimmedName) {
      setEditErrorMessage("League name cannot be empty");
      setShowEditErrorAlert(true);
      return;
    }

    if (isNaN(weeks) || weeks < 1 || weeks > 52) {
      setEditErrorMessage("Please enter a valid number of weeks (1-52)");
      setShowEditErrorAlert(true);
      return;
    }

    updateLeague(editingLeagueId, {
      name: trimmedName,
      numberOfWeeks: weeks,
    });

    setEditModalVisible(false);
    setEditingLeagueId(null);
    setEditName("");
    setEditWeeks("");
  };

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
                <View key={league.id} className="mb-3">
                  <Pressable
                    onPress={() =>
                      navigation.navigate("LeagueSchedule", { leagueId: league.id })
                    }
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
                          <View className="flex-row">
                            <Pressable
                              onPress={() => handleEditLeague(league.id)}
                              className="bg-blue-600/20 p-2 rounded-lg mr-2"
                            >
                              <Ionicons name="pencil" size={18} color="#60a5fa" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDeleteLeague(league.id, league.name)}
                              className="bg-red-600/20 p-2 rounded-lg"
                            >
                              <Ionicons name="trash" size={18} color="#f87171" />
                            </Pressable>
                          </View>
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
              </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Edit League Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 items-center justify-center px-4">
          <View className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700">
            <View className="p-6">
              <Text className="text-white text-xl font-bold mb-4">Edit League</Text>

              <Text className="text-gray-400 text-sm mb-2">League Name</Text>
              <TextInput
                className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4"
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter league name"
                placeholderTextColor="#9ca3af"
              />

              <Text className="text-gray-400 text-sm mb-2">Number of Weeks</Text>
              <TextInput
                className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-6"
                value={editWeeks}
                onChangeText={setEditWeeks}
                placeholder="Enter number of weeks"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
              />

              <View className="flex-row">
                <Pressable
                  onPress={() => setEditModalVisible(false)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg mr-2"
                >
                  <Text className="text-white font-bold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveEdit}
                  className="flex-1 bg-purple-600 py-3 rounded-lg ml-2"
                >
                  <Text className="text-white font-bold text-center">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete League"
        message={`Are you sure you want to delete "${leagueToDelete?.name}"? This will permanently delete all matches, games, and scores.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmDestructive={true}
        onConfirm={() => {
          if (leagueToDelete) {
            deleteLeague(leagueToDelete.id);
          }
          setShowDeleteConfirm(false);
          setLeagueToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setLeagueToDelete(null);
        }}
      />

      <AlertModal
        visible={showEditErrorAlert}
        title="Error"
        message={editErrorMessage}
        onClose={() => setShowEditErrorAlert(false)}
      />
    </SafeAreaView>
  );
}
