import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTournamentStore } from "../state/tournament-store";
import { BracketView } from "../components/BracketView";
import { BracketMatch } from "../types/tournament";

type TournamentBracketScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TournamentBracket"
>;

type TournamentBracketScreenRouteProp = RouteProp<
  RootStackParamList,
  "TournamentBracket"
>;

export default function TournamentBracketScreen() {
  const navigation = useNavigation<TournamentBracketScreenNavigationProp>();
  const route = useRoute<TournamentBracketScreenRouteProp>();
  const { tournamentId } = route.params;

  const tournament = useTournamentStore((s) => s.getTournament(tournamentId));

  // Get upcoming matches (not completed)
  const upcomingMatches = useMemo(() => {
    if (!tournament) return [];
    return tournament.bracketMatches
      .filter((m) => !m.completed && m.team1 && m.team1 !== "TBD" && m.team2 && m.team2 !== "TBD")
      .sort((a, b) => a.roundNumber - b.roundNumber);
  }, [tournament]);

  // Get completed matches
  const completedMatches = useMemo(() => {
    if (!tournament) return [];
    return tournament.bracketMatches.filter((m) => m.completed);
  }, [tournament]);

  if (!tournament) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Tournament not found</Text>
      </View>
    );
  }

  const handleMatchPress = (match: BracketMatch) => {
    if (!match.completed && match.team1 && match.team1 !== "TBD" && match.team2 && match.team2 !== "TBD") {
      navigation.navigate("TournamentMatch", {
        tournamentId,
        matchId: match.id,
      });
    }
  };

  const getRoundName = (roundNumber: number): string => {
    if (roundNumber === 1) return "Finals";
    if (roundNumber === 2) return "Semi-Finals";
    if (roundNumber === 3) return "Quarter-Finals";
    const matchesInRound = Math.pow(2, roundNumber - 1);
    return `Round of ${matchesInRound * 2}`;
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
            <View className="flex-row items-center mb-2">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">
                  Tournament Bracket
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {tournament.name}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Coming Up Section */}
            {upcomingMatches.length > 0 && (
              <View className="px-6 py-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={20} color="#10b981" />
                  <Text className="text-white text-lg font-bold ml-2">
                    Coming Up ({upcomingMatches.length})
                  </Text>
                </View>
                {upcomingMatches.slice(0, 3).map((match) => {
                  const team1Name = match.team1 && match.team1 !== "TBD"
                    ? `${match.team1.player1.name} / ${match.team1.player2 === "ghost" ? "Ghost" : match.team1.player2.name}`
                    : "TBD";
                  const team2Name = match.team2 && match.team2 !== "TBD"
                    ? `${match.team2.player1.name} / ${match.team2.player2 === "ghost" ? "Ghost" : match.team2.player2.name}`
                    : "TBD";

                  return (
                    <Pressable
                      key={match.id}
                      onPress={() => handleMatchPress(match)}
                      className="bg-green-900/20 border border-green-600/50 rounded-xl p-4 mb-3"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-green-400 text-xs font-bold">
                          {getRoundName(match.roundNumber)}
                        </Text>
                        <View className="bg-green-600 rounded-full px-3 py-1">
                          <Text className="text-white text-xs font-bold">Ready</Text>
                        </View>
                      </View>
                      <Text className="text-white font-bold text-sm mb-1">{team1Name}</Text>
                      <Text className="text-gray-400 text-xs mb-1">vs</Text>
                      <Text className="text-white font-bold text-sm">{team2Name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Stats Summary */}
            <View className="px-6 py-4">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-white text-2xl font-bold">
                    {tournament.bracketMatches.length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Total Matches</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-green-400 text-2xl font-bold">
                    {completedMatches.length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Completed</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                  <Text className="text-blue-400 text-2xl font-bold">
                    {upcomingMatches.length}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">Upcoming</Text>
                </View>
              </View>
            </View>

            {/* Full Bracket */}
            <View className="py-4">
              <View className="px-6 mb-3">
                <Text className="text-white text-lg font-bold">
                  Full Bracket
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {tournament.format === "double-elimination" ? "Double Elimination" : "Single Elimination"}
                </Text>
              </View>

              {tournament.bracketMatches.length > 0 ? (
                <BracketView
                  matches={tournament.bracketMatches}
                  eliminationType={tournament.format === "double-elimination" ? "double" : "single"}
                  onMatchPress={handleMatchPress}
                />
              ) : (
                <View className="px-6">
                  <View className="bg-white/5 rounded-xl p-8 border border-white/10 items-center">
                    <Ionicons name="git-branch-outline" size={48} color="#6b7280" />
                    <Text className="text-gray-400 text-center mt-4 font-bold">
                      Bracket Not Generated Yet
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                      Complete team generation to create the bracket
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="h-8" />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
