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

  const handleSelectPlayer = (gameNumber: number, team: "away" | "home", position: 1 | 2) => {
    const game = match.games.find((g) => g.gameNumber === gameNumber);
    if (!game) return;

    const playerList = team === "away" ? awayPlayers : homePlayers;

    if (playerList.length === 0) {
      Alert.alert("No Players", `${team === "away" ? match.awayTeamName : match.homeTeamName} has no players`);
      return;
    }

    // Get players already selected in this game
    const selectedInThisGame = [
      game.awayPlayer1Id,
      game.awayPlayer2Id,
      game.homePlayer1Id,
      game.homePlayer2Id,
    ].filter(Boolean);

    // Get players currently in other active games
    const playersInActiveGames = match.games
      .filter((g) => g.gameNumber !== gameNumber && g.inProgress && !g.completed)
      .flatMap((g) => [g.awayPlayer1Id, g.awayPlayer2Id, g.homePlayer1Id, g.homePlayer2Id])
      .filter(Boolean);

    // Filter available players
    const availablePlayers = playerList.filter((player) => {
      // Exclude if already selected in THIS game (can't play twice in same game)
      if (selectedInThisGame.includes(player.id)) {
        // Allow reselecting same position
        if (team === "away" && position === 1 && player.id === game.awayPlayer1Id) return true;
        if (team === "away" && position === 2 && player.id === game.awayPlayer2Id) return true;
        if (team === "home" && position === 1 && player.id === game.homePlayer1Id) return true;
        if (team === "home" && position === 2 && player.id === game.homePlayer2Id) return true;
        return false;
      }
      // Exclude if playing in another active game
      if (playersInActiveGames.includes(player.id)) return false;
      return true;
    });

    if (availablePlayers.length === 0) {
      Alert.alert("No Available Players", "All players are either already in this game or playing in another active game");
      return;
    }

    Alert.alert(
      `Select ${team === "away" ? "Away" : "Home"} Player ${position}`,
      `Choose a player for Game ${gameNumber}`,
      [
        ...availablePlayers.map((player) => ({
          text: player.nickname ? `${player.name} (${player.nickname})` : player.name,
          onPress: () => {
            if (team === "away" && position === 1) {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                awayPlayer1Id: player.id,
                awayPlayer1Name: player.name,
              });
            } else if (team === "away" && position === 2) {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                awayPlayer2Id: player.id,
                awayPlayer2Name: player.name,
              });
            } else if (team === "home" && position === 1) {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                homePlayer1Id: player.id,
                homePlayer1Name: player.name,
              });
            } else if (team === "home" && position === 2) {
              updateLeagueGame(leagueId, matchId, gameNumber, {
                homePlayer2Id: player.id,
                homePlayer2Name: player.name,
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

    const allPlayersSelected = game.awayPlayer1Id && game.awayPlayer2Id &&
                               game.homePlayer1Id && game.homePlayer2Id;

    if (!allPlayersSelected) {
      Alert.alert("Players Required", "Please select all 4 players (2 from each team) before starting the game");
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
            Tap on a game to expand and select players (2v2 doubles format)
          </Text>

          {match.games.map((game) => {
            const isExpanded = expandedGame === game.gameNumber;
            const awayTeam = `${game.awayPlayer1Name || "?"} & ${game.awayPlayer2Name || "?"}`;
            const homeTeam = `${game.homePlayer1Name || "?"} & ${game.homePlayer2Name || "?"}`;

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
                          {game.awayPlayer1Name || game.awayPlayer2Name ||
                           game.homePlayer1Name || game.homePlayer2Name ? (
                            <View>
                              <Text className="text-blue-300 text-sm">
                                {awayTeam}
                              </Text>
                              <Text className="text-red-300 text-sm">
                                vs {homeTeam}
                              </Text>
                            </View>
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
                                {game.awayTeamScore} - {game.homeTeamScore}
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
                    {/* Away Team Players */}
                    <Text className="text-blue-400 font-bold mb-2">
                      {match.awayTeamName} (Away)
                    </Text>
                    <View className="mb-3">
                      <Text className="text-gray-400 text-sm mb-2">Player 1</Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "away", 1)}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center mb-2"
                      >
                        <Text className="text-white">
                          {game.awayPlayer1Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>

                      <Text className="text-gray-400 text-sm mb-2">Player 2</Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "away", 2)}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center"
                      >
                        <Text className="text-white">
                          {game.awayPlayer2Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>
                    </View>

                    {/* Home Team Players */}
                    <Text className="text-red-400 font-bold mb-2">
                      {match.homeTeamName} (Home)
                    </Text>
                    <View className="mb-4">
                      <Text className="text-gray-400 text-sm mb-2">Player 1</Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "home", 1)}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center mb-2"
                      >
                        <Text className="text-white">
                          {game.homePlayer1Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>

                      <Text className="text-gray-400 text-sm mb-2">Player 2</Text>
                      <Pressable
                        onPress={() => handleSelectPlayer(game.gameNumber, "home", 2)}
                        className="bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 flex-row justify-between items-center"
                      >
                        <Text className="text-white">
                          {game.homePlayer2Name || "Select player..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                      </Pressable>
                    </View>

                    {/* Start Game Button */}
                    <Pressable
                      onPress={() => handleStartGame(game.gameNumber)}
                      disabled={
                        !game.awayPlayer1Id || !game.awayPlayer2Id ||
                        !game.homePlayer1Id || !game.homePlayer2Id ||
                        game.inProgress
                      }
                      className={`py-3 rounded-lg items-center ${
                        game.awayPlayer1Id && game.awayPlayer2Id &&
                        game.homePlayer1Id && game.homePlayer2Id &&
                        !game.inProgress
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                    >
                      <Text className="text-white font-bold">
                        {game.inProgress ? "Game in Progress" : "Start Game (2v2)"}
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
