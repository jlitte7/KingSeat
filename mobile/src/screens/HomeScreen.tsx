import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTossSeriesStore } from "../state/toss-series-store";
import { usePracticeStore } from "../state/practice-store";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { useProfileStore } from "../state/profile-store";

const { width } = Dimensions.get("window");

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [greeting, setGreeting] = useState("");

  // Get all data
  const games = useTossSeriesStore((s) => s.games);
  const players = useTossSeriesStore((s) => s.players);
  const teams = useTossSeriesStore((s) => s.teams);
  const practiceStats = usePracticeStore((s) => s.practiceStats);
  const personalStats = usePersonalStatsStore((s) => s.stats);
  const personalMatches = usePersonalStatsStore((s) => s.matches);
  const profile = useProfileStore((s) => s.profile);

  // Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Calculate insights
  const insights = useMemo(() => {
    const totalGames = games.length;
    const totalTeams = teams.length;
    const totalPlayers = players.length;
    const totalPracticeSessions = practiceStats.totalBagRunSessions +
                                  practiceStats.totalAirmailSessions +
                                  practiceStats.ghostGamesPlayed;

    const personalBags = personalStats.totalBagsThrown;
    const personalAccuracy = personalStats.bagsInPercentage;
    const recentActivity = personalMatches.length;

    // Today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayGames = games.filter(g =>
      g.completedAt && new Date(g.completedAt) >= today
    ).length;

    // This week's activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekGames = games.filter(g =>
      g.completedAt && new Date(g.completedAt) >= weekAgo
    ).length;

    // Get hot streak
    let currentStreak = 0;
    const sortedGames = [...games]
      .filter(g => g.completed)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

    for (const game of sortedGames) {
      if (game.winnerId) {
        currentStreak++;
      } else break;
    }

    return {
      totalGames,
      totalTeams,
      totalPlayers,
      totalPracticeSessions,
      personalBags,
      personalAccuracy,
      recentActivity,
      todayGames,
      weekGames,
      currentStreak
    };
  }, [games, teams, players, practiceStats, personalStats, personalMatches]);

  // Get smart recommendation
  const getRecommendation = () => {
    if (insights.totalGames === 0) {
      return {
        title: "Start Your Journey",
        message: "Tap Quick Game to play your first match",
        icon: "rocket" as const,
        action: () => navigation.navigate("ScoreboardSetup")
      };
    }

    if (insights.totalPracticeSessions === 0) {
      return {
        title: "Level Up Your Skills",
        message: "Try CornHub practice modes to improve",
        icon: "fitness" as const,
        action: () => navigation.navigate("CornHub")
      };
    }

    if (insights.personalBags === 0) {
      return {
        title: "Track Your Performance",
        message: "Use My Stats to monitor your progress",
        icon: "trending-up" as const,
        action: () => navigation.navigate("PersonalStats")
      };
    }

    if (insights.totalTeams < 2) {
      return {
        title: "Build Your League",
        message: "Create teams in Clubhouse for organized play",
        icon: "people" as const,
        action: () => navigation.navigate("Clubhouse")
      };
    }

    return {
      title: "You're on Fire! 🔥",
      message: `${insights.weekGames} games this week. Keep it up!`,
      icon: "flame" as const,
      action: () => navigation.navigate("ScoreboardSetup")
    };
  };

  const recommendation = getRecommendation();

  const mainFeatures = [
    {
      id: "quickgame",
      title: "Quick Game",
      subtitle: "Start playing instantly",
      description: "Fast setup, live scoring",
      icon: "play-circle" as const,
      colors: ["#dc2626", "#991b1b"] as const,
      accentColor: "#fca5a5",
      stat: insights.todayGames > 0 ? `${insights.todayGames} today` : "Let's play",
      onPress: () => navigation.navigate("ScoreboardSetup"),
    },
    {
      id: "mystats",
      title: "My Stats",
      subtitle: "Personal performance",
      description: "Track every throw",
      icon: "stats-chart" as const,
      colors: ["#7c3aed", "#5b21b6"] as const,
      accentColor: "#c4b5fd",
      stat: insights.personalBags > 0 ? `${insights.personalAccuracy.toFixed(0)}% in` : "Start tracking",
      onPress: () => navigation.navigate("PersonalStats"),
    },
  ];

  const quickAccess = [
    {
      id: "clubhouse",
      title: "Clubhouse",
      subtitle: "Teams & leagues",
      icon: "business" as const,
      colors: ["#2563eb", "#1e40af"] as const,
      stat: insights.totalTeams > 0 ? `${insights.totalTeams} teams` : "Get started",
      badge: insights.totalTeams > 0 ? insights.totalTeams : null,
      onPress: () => navigation.navigate("Clubhouse"),
    },
    {
      id: "cornhub",
      title: "CornHub",
      subtitle: "Elite training",
      icon: "barbell" as const,
      colors: ["#d97706", "#b45309"] as const,
      stat: `${insights.totalPracticeSessions} sessions`,
      badge: insights.totalPracticeSessions > 10 ? "🔥" : null,
      onPress: () => navigation.navigate("CornHub"),
    },
    {
      id: "cornholeiq",
      title: "CornholeIQ",
      subtitle: "Analytics",
      icon: "analytics" as const,
      colors: ["#7c3aed", "#6d28d9"] as const,
      stat: insights.totalPlayers > 0 ? `${insights.totalPlayers} players` : "No data yet",
      badge: null,
      onPress: () => navigation.navigate("CornholeIQ"),
    },
    {
      id: "tossoff",
      title: "TossOff",
      subtitle: "Tournaments",
      icon: "trophy" as const,
      colors: ["#059669", "#047857"] as const,
      stat: "",
      badge: "NEW",
      onPress: () => navigation.navigate("TossOff"),
    },
  ];

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {/* Premium Header */}
            <View className="px-6 pt-6 pb-4">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm mb-1">
                    {greeting}
                  </Text>
                  <Text className="text-white text-3xl font-black">
                    KINGSEAT
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    Ultimate Cornhole Experience
                  </Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate("Profile")}
                  className="rounded-2xl p-3"
                  style={{ backgroundColor: profile.favoriteColor + "50" }}
                >
                  <Text style={{ fontSize: 28 }}>{profile.avatar}</Text>
                </Pressable>
              </View>

              {/* Live Stats Bar */}
              {insights.totalGames > 0 && (
                <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 items-center">
                      <Text className="text-white text-2xl font-bold">
                        {insights.totalGames}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">Games</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="flex-1 items-center">
                      <Text className="text-white text-2xl font-bold">
                        {insights.weekGames}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">This Week</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="flex-1 items-center">
                      <Text className="text-white text-2xl font-bold">
                        {insights.currentStreak > 0 ? insights.currentStreak : "-"}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">Streak</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Smart Recommendation */}
            <View className="px-6 mb-6">
              <Pressable onPress={recommendation.action}>
                <LinearGradient
                  colors={["#6366f1", "#4f46e5", "#4338ca"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <View className="flex-row items-center">
                    <View className="bg-white/20 rounded-full p-3 mr-4">
                      <Ionicons name={recommendation.icon} size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold mb-1">
                        {recommendation.title}
                      </Text>
                      <Text className="text-white/80 text-sm">
                        {recommendation.message}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Hero Feature Cards */}
            <View className="px-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">
                  Play & Track
                </Text>
                <View className="bg-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-green-400 text-xs font-bold">LIVE</Text>
                </View>
              </View>
              <View className="gap-4">
                {mainFeatures.map((feature) => (
                  <Pressable
                    key={feature.id}
                    onPress={feature.onPress}
                    className="w-full rounded-3xl overflow-hidden"
                    style={{
                      shadowColor: feature.colors[0],
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 16,
                      elevation: 12,
                    }}
                  >
                    <LinearGradient
                      colors={[...feature.colors, "#000000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.5, y: 1 }}
                      style={{
                        padding: 24,
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Text className="text-white text-2xl font-black">
                              {feature.title}
                            </Text>
                          </View>
                          <Text className="text-white/70 text-sm mb-1">
                            {feature.subtitle}
                          </Text>
                          <Text className="text-white/50 text-xs">
                            {feature.description}
                          </Text>
                        </View>
                        <View
                          className="rounded-2xl p-4"
                          style={{ backgroundColor: feature.accentColor + "30" }}
                        >
                          <Ionicons name={feature.icon} size={36} color={feature.accentColor} />
                        </View>
                      </View>

                      <View className="bg-white/10 rounded-xl p-3">
                        <Text
                          className="text-xs font-bold"
                          style={{ color: feature.accentColor }}
                        >
                          {feature.stat}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Quick Access Grid */}
            <View className="px-6 pb-8">
              <Text className="text-white text-xl font-bold mb-4">
                Explore Features
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {quickAccess.map((feature) => (
                  <Pressable
                    key={feature.id}
                    onPress={feature.onPress}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: (width - 60) / 2,
                      shadowColor: feature.colors[0],
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <LinearGradient
                      colors={[...feature.colors, "#000000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.2, y: 1 }}
                      style={{ padding: 20, minHeight: 160 }}
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="bg-white/20 p-3 rounded-xl">
                          <Ionicons name={feature.icon} size={24} color="#fff" />
                        </View>
                        {feature.badge && (
                          <View className="bg-white/20 px-2 py-1 rounded-lg">
                            <Text className="text-white text-xs font-bold">
                              {feature.badge}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-white text-lg font-bold mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-white/60 text-xs mb-3">
                        {feature.subtitle}
                      </Text>
                      <Text className="text-white/80 text-xs font-bold">
                        {feature.stat}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Pro Tip */}
            <View className="px-6 pb-8">
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)"
                }}
              >
                <View className="flex-row items-start">
                  <View className="bg-blue-500/20 rounded-full p-2 mr-3">
                    <Ionicons name="bulb" size={20} color="#60a5fa" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold mb-2">
                      Pro Tip 💎
                    </Text>
                    <Text className="text-gray-400 text-sm leading-6">
                      Link your My Stats profile to your Clubhouse player for unified tracking across all games and practice sessions.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
