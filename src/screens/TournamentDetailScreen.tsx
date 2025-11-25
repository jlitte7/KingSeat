import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTournamentStore } from "../state/tournament-store";
import { SkillTier } from "../types/tournament";
import { BracketView } from "../components/BracketView";

type TournamentDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TournamentDetail"
>;

type TournamentDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "TournamentDetail"
>;

export default function TournamentDetailScreen() {
  const navigation = useNavigation<TournamentDetailScreenNavigationProp>();
  const route = useRoute<TournamentDetailScreenRouteProp>();
  const { tournamentId } = route.params;

  const tournament = useTournamentStore((s) =>
    s.getTournament(tournamentId)
  );
  const updateTournamentStatus = useTournamentStore(
    (s) => s.updateTournamentStatus
  );
  const registerPlayer = useTournamentStore((s) => s.registerPlayer);
  const checkInPlayer = useTournamentStore((s) => s.checkInPlayer);
  const updatePlayerTier = useTournamentStore((s) => s.updatePlayerTier);
  const generateBlindDrawTeams = useTournamentStore(
    (s) => s.generateBlindDrawTeams
  );
  const generateRoundRobinSchedule = useTournamentStore(
    (s) => s.generateRoundRobinSchedule
  );
  const generateBracket = useTournamentStore((s) => s.generateBracket);
  const recordBracketResult = useTournamentStore((s) => s.recordBracketResult);

  const [playerName, setPlayerName] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  if (!tournament) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Tournament not found</Text>
      </View>
    );
  }

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      Alert.alert("Name Required", "Please enter a player name");
      return;
    }

    registerPlayer(tournamentId, playerName.trim());
    setPlayerName("");
    setShowAddPlayer(false);
  };

  const handleGenerateTeams = () => {
    if (tournament.players.filter((p) => p.checkedIn).length < 4) {
      Alert.alert(
        "Not Enough Players",
        "You need at least 4 checked-in players to generate teams"
      );
      return;
    }

    generateBlindDrawTeams(tournamentId);
    Alert.alert("Teams Generated!", "Teams have been created successfully");
  };

  const handleStartRoundRobin = () => {
    if (tournament.teams.length < tournament.minTeamsRequired) {
      Alert.alert(
        "Not Enough Teams",
        `You need at least ${tournament.minTeamsRequired} teams to start (ACL compliance)`
      );
      return;
    }

    generateRoundRobinSchedule(tournamentId);
    Alert.alert("Schedule Created!", "Round robin matches have been scheduled");
  };

  const handleGenerateBracket = (eliminationType: "single" | "double") => {
    if (tournament.teams.length < 2) {
      Alert.alert("Not Enough Teams", "You need at least 2 teams to create a bracket");
      return;
    }

    generateBracket(tournamentId, eliminationType);
    updateTournamentStatus(tournamentId, "bracket");
    Alert.alert(
      "Bracket Created!",
      `${eliminationType === "single" ? "Single" : "Double"} elimination bracket has been generated`
    );
  };

  const handleMatchPress = (matchId: string, team1Score?: number, team2Score?: number) => {
    // Navigate to tournament match screen for scoring
    navigation.navigate("TournamentMatch", {
      tournamentId,
      matchId,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "setup":
        return "#6b7280";
      case "registration":
        return "#3b82f6";
      case "check-in":
        return "#f59e0b";
      case "team-generation":
        return "#8b5cf6";
      case "round-robin":
        return "#10b981";
      case "bracket":
        return "#ef4444";
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-white/10">
            <View className="flex-row items-center mb-3">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">
                  {tournament.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View
                    className="rounded-full px-2 py-1"
                    style={{
                      backgroundColor: getStatusColor(tournament.status) + "30",
                    }}
                  >
                    <Text
                      className="text-xs font-bold capitalize"
                      style={{ color: getStatusColor(tournament.status) }}
                    >
                      {tournament.status.replace("-", " ")}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs capitalize">
                    {tournament.format.replace("-", " ")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Quick Stats */}
            <View className="px-6 py-4">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-white text-2xl font-bold">
                    {tournament.players.length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Players</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-white text-2xl font-bold">
                    {tournament.players.filter((p) => p.checkedIn).length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Checked In</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-white text-2xl font-bold">
                    {tournament.teams.length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Teams</Text>
                </View>
              </View>
            </View>

            {/* View Bracket Button - Always visible when bracket exists */}
            {tournament.bracketMatches.length > 0 && (
              <View className="px-6 py-2">
                <Pressable
                  onPress={() => navigation.navigate("TournamentBracket", { tournamentId })}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-white/20 rounded-full p-2 mr-3">
                      <Ionicons name="git-branch" size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">View Tournament Bracket</Text>
                      <Text className="text-white/80 text-xs mt-1">
                        {tournament.bracketMatches.filter(m => m.completed).length} of {tournament.bracketMatches.length} matches complete
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </Pressable>
              </View>
            )}

            {/* Bracket Preview Teaser - Show during team generation */}
            {tournament.bracketMatches.length === 0 && tournament.teams.length >= 2 && (
              <View className="px-6 py-2">
                <View className="bg-blue-900/20 border border-blue-600/50 rounded-xl p-4">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#60a5fa" style={{ marginRight: 8, marginTop: 2 }} />
                    <View className="flex-1">
                      <Text className="text-blue-400 font-bold text-sm mb-1">
                        Bracket Ready to Generate
                      </Text>
                      <Text className="text-blue-300 text-xs leading-5">
                        {tournament.teams.length} teams are ready. Generate the bracket to start the tournament and view matchups.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="px-6 py-4">
              {tournament.status === "setup" && (
                <Pressable
                  onPress={() =>
                    updateTournamentStatus(tournamentId, "registration")
                  }
                  className="bg-purple-600 rounded-xl p-4 mb-3"
                >
                  <Text className="text-white font-bold text-center">
                    Start Registration
                  </Text>
                </Pressable>
              )}

              {tournament.status === "registration" && (
                <>
                  <Pressable
                    onPress={() => setShowAddPlayer(!showAddPlayer)}
                    className="bg-blue-600 rounded-xl p-4 mb-3"
                  >
                    <Text className="text-white font-bold text-center">
                      + Add Player
                    </Text>
                  </Pressable>

                  {tournament.players.length >= 4 && (
                    <Pressable
                      onPress={() =>
                        updateTournamentStatus(tournamentId, "check-in")
                      }
                      className="bg-purple-600 rounded-xl p-4 mb-3"
                    >
                      <Text className="text-white font-bold text-center">
                        Start Check-In
                      </Text>
                    </Pressable>
                  )}
                </>
              )}

              {tournament.status === "check-in" &&
                tournament.players.filter((p) => p.checkedIn).length >= 4 && (
                  <Pressable
                    onPress={handleGenerateTeams}
                    className="bg-purple-600 rounded-xl p-4 mb-3"
                  >
                    <Text className="text-white font-bold text-center">
                      🎲 Generate Teams
                    </Text>
                  </Pressable>
                )}

              {tournament.status === "team-generation" &&
                tournament.teams.length >= tournament.minTeamsRequired && (
                  <>
                    {(tournament.format === "round-robin" || tournament.roundRobinMatches.length > 0) && (
                      <Pressable
                        onPress={handleStartRoundRobin}
                        className="bg-green-600 rounded-xl p-4 mb-3"
                      >
                        <Text className="text-white font-bold text-center">
                          Start Round Robin
                        </Text>
                      </Pressable>
                    )}

                    {tournament.format === "single-elimination" && tournament.bracketMatches.length === 0 && (
                      <Pressable
                        onPress={() => handleGenerateBracket("single")}
                        className="bg-red-600 rounded-xl p-4 mb-3"
                      >
                        <Text className="text-white font-bold text-center">
                          🏆 Generate Single Elimination Bracket
                        </Text>
                      </Pressable>
                    )}

                    {tournament.format === "double-elimination" && tournament.bracketMatches.length === 0 && (
                      <Pressable
                        onPress={() => handleGenerateBracket("double")}
                        className="bg-red-600 rounded-xl p-4 mb-3"
                      >
                        <Text className="text-white font-bold text-center">
                          🏆 Generate Double Elimination Bracket
                        </Text>
                      </Pressable>
                    )}
                  </>
                )}
            </View>

            {/* Add Player Form */}
            {showAddPlayer && tournament.status === "registration" && (
              <View className="px-6 py-4">
                <View className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-white font-bold mb-3">Add Player</Text>
                  <TextInput
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Player name"
                    placeholderTextColor="#6b7280"
                    className="bg-white/10 rounded-xl px-4 py-3 text-white mb-3"
                  />
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setShowAddPlayer(false)}
                      className="flex-1 bg-gray-600 rounded-xl p-3"
                    >
                      <Text className="text-white font-bold text-center">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddPlayer}
                      className="flex-1 bg-purple-600 rounded-xl p-3"
                    >
                      <Text className="text-white font-bold text-center">
                        Add
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Players List */}
            {tournament.players.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-white text-lg font-bold mb-3">
                  Players ({tournament.players.length})
                </Text>
                {tournament.players.map((player) => (
                  <View
                    key={player.id}
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-bold">
                          {player.name}
                        </Text>
                        {tournament.useSkillTiers && (
                          <View className="flex-row gap-2 mt-2">
                            {(["A", "B", "C"] as SkillTier[]).map((tier) => (
                              <Pressable
                                key={tier}
                                onPress={() =>
                                  updatePlayerTier(
                                    tournamentId,
                                    player.id,
                                    tier
                                  )
                                }
                                className={`px-3 py-1 rounded-lg ${
                                  player.skillTier === tier
                                    ? "bg-purple-600"
                                    : "bg-white/10"
                                }`}
                              >
                                <Text className="text-white text-xs font-bold">
                                  Tier {tier}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </View>
                      {tournament.status === "check-in" && (
                        <Pressable
                          onPress={() => checkInPlayer(tournamentId, player.id)}
                          className={`rounded-xl px-4 py-2 ${
                            player.checkedIn ? "bg-green-600" : "bg-gray-600"
                          }`}
                        >
                          <Text className="text-white text-sm font-bold">
                            {player.checkedIn ? "Checked In" : "Check In"}
                          </Text>
                        </Pressable>
                      )}
                      {player.checkedIn && tournament.status !== "check-in" && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10b981"
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Teams List */}
            {tournament.teams.length > 0 && (
              <View className="px-6 py-4 pb-8">
                <Text className="text-white text-lg font-bold mb-3">
                  Teams ({tournament.teams.length})
                </Text>
                {tournament.teams.map((team, index) => (
                  <View
                    key={team.id}
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <Text className="text-gray-400 text-xs mb-2">
                      Team {index + 1}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-bold">
                          {team.player1.name}
                        </Text>
                        <Text className="text-white font-bold">
                          {team.player2 === "ghost"
                            ? "👻 Ghost Player"
                            : team.player2.name}
                        </Text>
                      </View>
                      {tournament.useSkillTiers && (
                        <View className="flex-row gap-2">
                          <View className="bg-purple-600/20 rounded-lg px-2 py-1">
                            <Text className="text-purple-400 text-xs font-bold">
                              {team.player1.skillTier}
                            </Text>
                          </View>
                          {team.player2 !== "ghost" && (
                            <View className="bg-purple-600/20 rounded-lg px-2 py-1">
                              <Text className="text-purple-400 text-xs font-bold">
                                {team.player2.skillTier}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Round Robin Matches */}
            {tournament.roundRobinMatches.length > 0 && (
              <View className="px-6 py-4 pb-8">
                <Text className="text-white text-lg font-bold mb-3">
                  Round Robin Schedule
                </Text>
                {tournament.roundRobinMatches.map((match, index) => (
                  <View
                    key={match.id}
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <Text className="text-gray-400 text-xs mb-2">
                      Match {index + 1}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-bold">
                          {match.team1.player1.name} &{" "}
                          {match.team1.player2 === "ghost"
                            ? "Ghost"
                            : match.team1.player2.name}
                        </Text>
                        <Text className="text-gray-400 text-sm">vs</Text>
                        <Text className="text-white font-bold">
                          {match.team2.player1.name} &{" "}
                          {match.team2.player2 === "ghost"
                            ? "Ghost"
                            : match.team2.player2.name}
                        </Text>
                      </View>
                      {match.completed ? (
                        <View className="items-end">
                          <Text className="text-white text-xl font-bold">
                            {match.team1Score}
                          </Text>
                          <Text className="text-white text-xl font-bold">
                            {match.team2Score}
                          </Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() =>
                            navigation.navigate("TournamentMatch", {
                              tournamentId,
                              matchId: match.id,
                            })
                          }
                          className="bg-green-600 rounded-xl px-4 py-2"
                        >
                          <Text className="text-white text-sm font-bold">
                            Start
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Bracket View */}
            {tournament.bracketMatches.length > 0 && (
              <View className="py-4">
                <View className="px-6 mb-3">
                  <Text className="text-white text-lg font-bold">
                    Tournament Bracket
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {tournament.format === "double-elimination" ? "Double Elimination" : "Single Elimination"}
                  </Text>
                </View>
                <BracketView
                  matches={tournament.bracketMatches}
                  eliminationType={tournament.format === "double-elimination" ? "double" : "single"}
                  onMatchPress={(match) => handleMatchPress(match.id, match.team1Score, match.team2Score)}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
