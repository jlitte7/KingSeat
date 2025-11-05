import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type LeagueMatchDetailRouteProp = RouteProp<RootStackParamList, "LeagueMatchDetail">;
type LeagueMatchDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LeagueMatchDetail"
>;

export default function LeagueMatchDetailScreen() {
  const navigation = useNavigation<LeagueMatchDetailNavigationProp>();
  const route = useRoute<LeagueMatchDetailRouteProp>();
  const { matchId, leagueId } = route.params;

  const match = useTossSeriesStore((s) => s.getMatchById(matchId, leagueId));
  const players = useTossSeriesStore((s) => s.players);
  const updateLeagueGame = useTossSeriesStore((s) => s.updateLeagueGame);

  const [expandedGame, setExpandedGame] = useState<number | null>(null);

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Match not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const awayPlayers = players.filter((p) => p.teamId === match.awayTeamId);
  const homePlayers = players.filter((p) => p.teamId === match.homeTeamId);

  const handleSelectPlayer = (gameNumber: number, side: "away" | "home") => {
    const game = match.games.find((g) => g.gameNumber === gameNumber);
    if (!game) return;

    const playerList = side === "away" ? awayPlayers : homePlayers;

    if (playerList.length === 0) {
      Alert.alert("No Players", `${side === "away" ? match.awayTeamName : match.homeTeamName} has no players`);
      return;
    }

    Alert.alert(
      `Select ${side === "away" ? "Away" : "Home"} Player`,
      `Choose a player for Game ${gameNumber}`,
      [
        ...playerList.map((player) => ({
          text: player.nickname ? `${player.name} (${player.nickname})` : player.name,
          onPress: () => {
            if (side === "away") {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                player1Id: player.id,
                player1Name: player.name,
              });
            } else {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                player2Id: player.id,
                player2Name: player.name,
              });
            }
          },
        })),
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleStartGame = (gameNumber: number) => {
    const game = match.games.find((g) => g.gameNumber === gameNumber);
    if (!game) return;

    if (!game.player1Id || !game.player2Id) {
      Alert.alert("Players Required", "Please select both players before starting the game");
      return;
    }

    // Mark game as in progress
    updateLeagueGame(leagueId, matchId, gameNumber, { inProgress: true });

    // Navigate to game scoreboard
    navigation.navigate("LeagueGameScoreboard", {
      matchId,
      leagueId,
      gameNumber,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Match Details</Text>
              <Text className="text-gray-400 text-sm">
                Week {match.weekNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Match Score Header */}
        <View className="px-4 py-4 bg-gray-800/50 border-b border-gray-700">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-lg font-bold flex-1">
              {match.awayTeamName}
            </Text>
            <View className="bg-blue-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-bold text-xl">
                {match.awayTeamScore}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg font-bold flex-1">
              {match.homeTeamName}
            </Text>
            <View className="bg-red-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-bold text-xl">
                {match.homeTeamScore}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          <Text className="text-gray-400 text-sm mb-3">
            Tap on a game to expand and select players
          </Text>

          {match.games.map((game) => {
            const isExpanded = expandedGame === game.gameNumber;

            return (
              <View key={game.gameNumber} className="mb-3">
                <Pressable
                  onPress={() =>
                    setExpandedGame(isExpanded ? null : game.gameNumber)
                  }
                >
                  <View className="rounded-xl overflow-hidden border border-gray-700">
                    <LinearGradient
                      colors={
                        game.completed
                          ? ["#065f46", "#064e3b"] as const
                          : game.inProgress
                          ? ["#7c2d12", "#78350f"] as const
                          : ["#1f2937", "#111827"] as const
                      }
                      style={{ padding: 16 }}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="text-white text-lg font-bold mb-1">
                            Game {game.gameNumber}
                          </Text>
                          {game.player1Name && game.player2Name ? (
                            <Text className="text-gray-300 text-sm">
                              {game.player1Name} vs {game.player2Name}
                            </Text>
                          ) : (
                            <Text className="text-gray-500 text-sm">
                              No players selected
                            </Text>
                          )}
                        </View>
                        <View className="flex-row items-center">
                          {game.completed && (
                            <View className="bg-green-600/20 px-3 py-1 rounded mr-2">
                              <Text className="text-green-400 text-sm font-bold">
                                {game.player1Score} - {game.player2Score}
                              </Text>
                            </View>
                          )}
                          {game.inProgress && (
                            <View className="bg-orange-600/20 px-3 py-1 rounded mr-2">
                              <Text className="text-orange-400 text-sm font-bold">
                                Live
                              </Text>
                            </View>
                          )}
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#9ca3af"
                          />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </Pressable>

                {/* Expanded content */}
                {isExpanded && !game.completed && (
                  <View className="bg-gray-800 rounded-b-xl border-x border-b border-gray-700 p-4 mt-[-8px]">
                    {/* Away Player Selection */}
                    <View className="mb-3">
                      <Text className="text-gray-400 text-sm mb-2">
                        {match.awayTeamName} Player
                      </Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "away")}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center"
                      >
                        <Text className="text-white">
                          {game.player1Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>
                    </View>

                    {/* Home Player Selection */}
                    <View className="mb-4">
                      <Text className="text-gray-400 text-sm mb-2">
                        {match.homeTeamName} Player
                      </Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "home")}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center"
                      >
                        <Text className="text-white">
                          {game.player2Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>
                    </View>

                    {/* Start Game Button */}
                    <Pressable
                      onPress={() => handleStartGame(game.gameNumber)}
                      disabled={!game.player1Id || !game.player2Id || game.inProgress}
                      className={`py-3 rounded-lg items-center ${
                        game.player1Id && game.player2Id && !game.inProgress
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                    >
                      <Text className="text-white font-bold">
                        {game.inProgress ? "Game in Progress" : "Start Game"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
