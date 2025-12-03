import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTournamentStore } from "../state/tournament-store";
import { isACLCompliant } from "../types/tournament";

const { width } = Dimensions.get("window");

const TOURNAMENT_FEATURES = [
  { icon: "shuffle" as const, title: "Blind Draw Doubles", desc: "Auto-generate balanced teams with skill tiers" },
  { icon: "repeat" as const, title: "Switcholio", desc: "Rotate partners each game for individual rankings" },
  { icon: "grid" as const, title: "Round Robin", desc: "Everyone plays everyone with automatic scheduling" },
  { icon: "git-branch" as const, title: "Brackets", desc: "Single or double elimination tournaments" },
  { icon: "ribbon" as const, title: "ACL Compliant", desc: "Follows American Cornhole League standards" },
  { icon: "calendar" as const, title: "Season Tracking", desc: "Track multiple events and cumulative stats" },
];

type TossOffScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TossOff"
>;

export default function TossOffScreen() {
  const navigation = useNavigation<TossOffScreenNavigationProp>();
  const tournaments = useTournamentStore((s) => s.tournaments);
  const seasons = useTournamentStore((s) => s.seasons);

  const stats = useMemo(() => {
    const active = tournaments.filter((t) => t.status !== "completed").length;
    const completed = tournaments.filter((t) => t.status === "completed").length;
    const totalPlayers = tournaments.reduce((sum, t) => sum + t.players.length, 0);

    return { active, completed, totalPlayers, total: tournaments.length };
  }, [tournaments]);

  const activeTournaments = tournaments.filter((t) => t.status !== "completed");
  const completedTournaments = tournaments
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    .slice(0, 5);

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case "blind-draw-doubles":
        return "Blind Draw";
      case "switcholio":
        return "Switcholio";
      case "round-robin":
        return "Round Robin";
      case "single-elimination":
        return "Single Elim";
      case "double-elimination":
        return "Double Elim";
      default:
        return type;
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "setup":
        return "Setup";
      case "registration":
        return "Registration";
      case "check-in":
        return "Check-In";
      case "team-generation":
        return "Team Gen";
      case "round-robin":
        return "Round Robin";
      case "bracket":
        return "Bracket";
      case "completed":
        return "Completed";
      default:
        return status;
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
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/10">
            <View className="flex-row items-center flex-1">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <View>
                <Text className="text-white text-2xl font-black">TossOff</Text>
                <Text className="text-gray-400 text-xs">Tournaments & Brackets</Text>
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate("CreateTournament")}
              className="bg-purple-600 rounded-xl px-4 py-2"
            >
              <Text className="text-white text-sm font-bold">+ New</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Stats Overview */}
            {tournaments.length > 0 && (
              <View className="px-6 py-4">
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {stats.total}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Total Events</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-green-400 text-2xl font-bold">
                      {stats.active}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Active</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {stats.completed}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Completed</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-purple-400 text-2xl font-bold">
                      {stats.totalPlayers}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Total Players</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Start Guide */}
            {tournaments.length === 0 && (
              <View className="px-6 py-6">
                <LinearGradient
                  colors={["#7c3aed", "#5b21b6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 20, padding: 24 }}
                >
                  <View className="items-center">
                    <View className="bg-white/20 rounded-full p-4 mb-4">
                      <Ionicons name="trophy" size={40} color="#fff" />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2 text-center">
                      Run Your First Tournament
                    </Text>
                    <Text className="text-white/80 text-center mb-6">
                      Create blind draw events, Switcholio rounds, or bracket tournaments with ease
                    </Text>
                    <Pressable
                      onPress={() => navigation.navigate("CreateTournament")}
                      className="bg-white rounded-xl px-6 py-3"
                    >
                      <Text className="text-purple-600 font-bold">Create Tournament</Text>
                    </Pressable>
                  </View>
                </LinearGradient>

                {/* Feature List */}
                <View className="mt-6 space-y-3">
                  <Text className="text-white text-lg font-bold mb-2">Features</Text>
                  {TOURNAMENT_FEATURES.map((feature, index) => (
                    <View
                      key={index}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 flex-row items-center"
                    >
                      <View className="bg-purple-600/20 rounded-full p-3 mr-4">
                        <Ionicons name={feature.icon} size={20} color="#a78bfa" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold mb-1">
                          {feature.title}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {feature.desc}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Active Tournaments */}
            {activeTournaments.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-white text-lg font-bold mb-3">
                  Active Tournaments
                </Text>
                {activeTournaments.map((tournament) => (
                  <Pressable
                    key={tournament.id}
                    onPress={() =>
                      navigation.navigate("TournamentDetail", {
                        tournamentId: tournament.id,
                      })
                    }
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">
                          {tournament.name}
                        </Text>
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <View
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: getStatusColor(tournament.status) + "30" }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: getStatusColor(tournament.status) }}
                            >
                              {getStatusLabel(tournament.status)}
                            </Text>
                          </View>
                          <Text className="text-gray-400 text-xs">
                            {formatTypeLabel(tournament.format)}
                          </Text>
                          <Text className="text-gray-400 text-xs">•</Text>
                          <Text className="text-gray-400 text-xs capitalize">
                            {tournament.type}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>

                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <Ionicons name="people" size={16} color="#a78bfa" />
                        <Text className="text-gray-400 text-sm ml-1">
                          {tournament.players.length} players
                        </Text>
                      </View>
                      {tournament.teams.length > 0 && (
                        <View className="flex-row items-center">
                          <Ionicons name="shield" size={16} color="#a78bfa" />
                          <Text className="text-gray-400 text-sm ml-1">
                            {tournament.teams.length} teams
                          </Text>
                        </View>
                      )}
                      {!isACLCompliant(tournament) && tournament.status !== "setup" && (
                        <View className="flex-row items-center">
                          <Ionicons name="warning" size={16} color="#f59e0b" />
                          <Text className="text-amber-500 text-xs ml-1">
                            Needs {tournament.minTeamsRequired - tournament.teams.length} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Recent Completed */}
            {completedTournaments.length > 0 && (
              <View className="px-6 py-4 pb-8">
                <Text className="text-white text-lg font-bold mb-3">
                  Recently Completed
                </Text>
                {completedTournaments.map((tournament) => (
                  <Pressable
                    key={tournament.id}
                    onPress={() =>
                      navigation.navigate("TournamentDetail", {
                        tournamentId: tournament.id,
                      })
                    }
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-white font-bold mb-1">
                          {tournament.name}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {formatTypeLabel(tournament.format)} • {tournament.teams.length} teams
                        </Text>
                      </View>
                      {tournament.winnerId && (
                        <View className="bg-yellow-600/20 rounded-full p-2">
                          <Ionicons name="trophy" size={16} color="#fbbf24" />
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-500 text-xs">
                      Completed {new Date(tournament.completedAt!).toLocaleDateString()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Seasons */}
            {seasons.length > 0 && (
              <View className="px-6 py-4 pb-8">
                <Text className="text-white text-lg font-bold mb-3">Seasons</Text>
                {seasons.map((season) => (
                  <View
                    key={season.id}
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-bold mb-1">{season.name}</Text>
                        <Text className="text-gray-400 text-sm">
                          {season.tournamentIds.length} tournaments
                        </Text>
                      </View>
                      {season.active && (
                        <View className="bg-green-600/20 rounded-full px-3 py-1">
                          <Text className="text-green-400 text-xs font-bold">Active</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
