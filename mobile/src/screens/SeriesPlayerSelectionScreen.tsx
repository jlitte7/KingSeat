import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AlertModal } from "../components/AlertModal";

type SeriesPlayerSelectionRouteProp = RouteProp<RootStackParamList, "SeriesPlayerSelection">;
type SeriesPlayerSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SeriesPlayerSelection"
>;

export default function SeriesPlayerSelectionScreen() {
  const navigation = useNavigation<SeriesPlayerSelectionNavigationProp>();
  const route = useRoute<SeriesPlayerSelectionRouteProp>();
  const { seriesId, isAwayTeam, awayPlayers } = route.params;

  const series = useTossSeriesStore((s) => s.getSeriesById(seriesId));
  const players = useTossSeriesStore((s) => s.players);

  const [selectedPlayers, setSelectedPlayers] = useState<Array<{ playerId: string; playerName: string }>>([]);
  const [showMaxPlayersAlert, setShowMaxPlayersAlert] = useState(false);
  const [showNotEnoughPlayersAlert, setShowNotEnoughPlayersAlert] = useState(false);

  if (!series) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Series not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const teamId = isAwayTeam ? series.awayTeamId : series.homeTeamId;
  const teamName = isAwayTeam ? series.awayTeamName : series.homeTeamName;
  const teamPlayers = players.filter((p) => p.teamId === teamId);

  const handlePlayerToggle = (playerId: string, playerName: string) => {
    const isSelected = selectedPlayers.some((p) => p.playerId === playerId);

    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.playerId !== playerId));
    } else {
      if (selectedPlayers.length >= 8) {
        setShowMaxPlayersAlert(true);
        return;
      }
      setSelectedPlayers([...selectedPlayers, { playerId, playerName }]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedPlayers.length < 8) {
      setShowNotEnoughPlayersAlert(true);
      return;
    }

    if (isAwayTeam) {
      // Away team just selected, now go to home team selection
      navigation.navigate("SeriesPlayerSelection", {
        seriesId,
        isAwayTeam: false,
        awayPlayers: selectedPlayers,
      });
    } else {
      // Both teams selected, start the first game
      navigation.navigate("SeriesGame", {
        seriesId,
        gameIndex: 0,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">Select Players</Text>
              <Text className="text-gray-400 text-sm">{teamName}</Text>
            </View>
          </View>
          <View className="bg-blue-600 px-3 py-1 rounded-lg">
            <Text className="text-white font-bold">
              {selectedPlayers.length}/8
            </Text>
          </View>
        </View>

        <View className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
          <Text className="text-gray-300 text-sm mb-1">
            {isAwayTeam ? "Away Team" : "Home Team"} Selection
          </Text>
          <Text className="text-gray-400 text-xs">
            Select 8 players for this series. Each player can play max 3 games.
          </Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {teamPlayers.map((player) => {
            const isSelected = selectedPlayers.some((p) => p.playerId === player.id);

            return (
              <Pressable
                key={player.id}
                onPress={() => handlePlayerToggle(player.id, player.name)}
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
                          {player.name}
                        </Text>
                        {player.nickname && (
                          <Text className="text-gray-400 text-sm mt-1">
                            &ldquo;{player.nickname}&rdquo;
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={28} color="#3b82f6" />
                      )}
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-4 pb-4 pt-2 border-t border-gray-800">
          <Pressable
            onPress={handleConfirmSelection}
            disabled={selectedPlayers.length < 8}
            className={`py-4 rounded-lg items-center ${
              selectedPlayers.length >= 8 ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isAwayTeam ? "Continue to Home Team" : "Start Series"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Modals */}
      <AlertModal
        visible={showMaxPlayersAlert}
        title="Maximum Players"
        message="You can select a maximum of 8 players for the series."
        onClose={() => setShowMaxPlayersAlert(false)}
      />

      <AlertModal
        visible={showNotEnoughPlayersAlert}
        title="Not Enough Players"
        message="You must select at least 8 players for the series."
        onClose={() => setShowNotEnoughPlayersAlert(false)}
      />
    </SafeAreaView>
  );
}
