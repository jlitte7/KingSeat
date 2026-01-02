import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { usePracticeStore } from "../state/practice-store";
import { useTrainingStore, ProgramId } from "../state/training-store";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PracticeModeCard {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color1: string;
  color2: string;
  route: keyof RootStackParamList;
  category: "skill" | "mental" | "competitive";
}

export default function CornHubScreen() {
  const navigation = useNavigation<NavigationProp>();
  const practiceStats = usePracticeStore((s) => s.practiceStats);
  const ghostGames = usePracticeStore((s) => s.ghostPlayerGames);
  const bagRunSessions = usePracticeStore((s) => s.bagRunSessions);
  const airmailRunSessions = usePracticeStore((s) => s.airmailRunSessions);

  // Training programs from store
  const programs = useTrainingStore((s) => s.programs);
  const getProgramProgress = useTrainingStore((s) => s.getProgramProgress);

  // Calculate elite stats
  const eliteStats = useMemo(() => {
    const ghostWinRate = practiceStats.ghostGamesPlayed > 0
      ? ((practiceStats.ghostGamesWon / practiceStats.ghostGamesPlayed) * 100).toFixed(1)
      : "0.0";

    const situationalWinRate = practiceStats.situationalGamesPlayed > 0
      ? ((practiceStats.situationalGamesWon / practiceStats.situationalGamesPlayed) * 100).toFixed(1)
      : "0.0";

    const clutchRate = practiceStats.pressurePracticeAttempts > 0
      ? ((practiceStats.pressurePracticeSuccesses / practiceStats.pressurePracticeAttempts) * 100).toFixed(1)
      : "0.0";

    const totalSessions = practiceStats.totalBagRunSessions +
                         practiceStats.totalAirmailSessions +
                         practiceStats.ghostGamesPlayed +
                         practiceStats.situationalGamesPlayed;

    // Recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = [
      ...ghostGames,
      ...bagRunSessions,
      ...airmailRunSessions
    ].filter(s => new Date(s.createdAt) > sevenDaysAgo).length;

    return {
      ghostWinRate,
      situationalWinRate,
      clutchRate,
      totalSessions,
      recentSessions
    };
  }, [practiceStats, ghostGames, bagRunSessions, airmailRunSessions]);

  const practiceModes: PracticeModeCard[] = [
    {
      title: "Ghost Player",
      description: "Play against AI opponents at various skill levels",
      icon: "game-controller",
      color1: "#667eea",
      color2: "#764ba2",
      route: "GhostPlayer",
      category: "competitive"
    },
    {
      title: "Bag Run Challenge",
      description: "Track consecutive bags made - build consistency",
      icon: "trophy",
      color1: "#f093fb",
      color2: "#f5576c",
      route: "BagRun",
      category: "skill"
    },
    {
      title: "Airmail Precision",
      description: "Perfect your clean drops without board contact",
      icon: "airplane",
      color1: "#4facfe",
      color2: "#00f2fe",
      route: "AirmailRun",
      category: "skill"
    },
    {
      title: "Situational Games",
      description: "Train for critical game moments and scenarios",
      icon: "flash",
      color1: "#43e97b",
      color2: "#38f9d7",
      route: "SituationalGames",
      category: "mental"
    },
    {
      title: "Beat Your Best",
      description: "Compete against your peak performance",
      icon: "star",
      color1: "#fa709a",
      color2: "#fee140",
      route: "BestGameChallenge",
      category: "competitive"
    },
    {
      title: "Clutch Training",
      description: "Master high-pressure shots when it matters most",
      icon: "flame",
      color1: "#ff9a56",
      color2: "#ff6a00",
      route: "PressurePractice",
      category: "mental"
    },
  ];

  // Get practice insights
  const getInsight = () => {
    if (eliteStats.totalSessions === 0) {
      return "Start your journey to elite status. Begin with Bag Run to build consistency.";
    }

    if (eliteStats.recentSessions === 0) {
      return "Welcome back! Consistency is key - try to practice at least 3x per week.";
    }

    if (parseFloat(eliteStats.ghostWinRate) < 50) {
      return "Focus on Ghost Player games to improve competitive performance.";
    }

    if (parseFloat(eliteStats.clutchRate) < 60) {
      return "Work on Clutch Training to improve under pressure.";
    }

    if (practiceStats.bestBagRunStreak < 10) {
      return "Build consistency with Bag Run - aim for 10+ consecutive makes.";
    }

    return "Strong performance! Keep pushing to maintain elite status.";
  };

  return (
    <View className="flex-1 bg-gray-950">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-2xl font-bold">CornHub</Text>
              <Text className="text-gray-400 text-xs">Elite Training Facility</Text>
            </View>
          </View>
          <View className="bg-yellow-600 rounded-full p-2">
            <Text className="text-2xl">🌽</Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <LinearGradient
            colors={["#1e1b4b", "#0f172a"]}
            style={{ padding: 24, marginBottom: 8 }}
          >
            <View className="items-center">
              <Text className="text-white text-3xl font-bold text-center mb-2">
                Train Like a Champion
              </Text>
              <Text className="text-gray-300 text-center text-sm mb-6">
                Elite athletes are built through consistent, focused practice
              </Text>

              <View className="flex-row gap-4 mb-4">
                <View className="bg-white/10 rounded-xl px-4 py-3 items-center flex-1">
                  <Text className="text-white text-2xl font-bold">
                    {eliteStats.totalSessions}
                  </Text>
                  <Text className="text-gray-300 text-xs mt-1">Sessions</Text>
                </View>
                <View className="bg-white/10 rounded-xl px-4 py-3 items-center flex-1">
                  <Text className="text-white text-2xl font-bold">
                    {eliteStats.recentSessions}
                  </Text>
                  <Text className="text-gray-300 text-xs mt-1">This Week</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* AI Coaching Insight */}
          <View className="px-4 py-3">
            <View className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
              <View className="flex-row items-start">
                <View className="bg-blue-600 rounded-full p-2 mr-3">
                  <Ionicons name="bulb" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-400 font-bold mb-1">
                    Training Insight
                  </Text>
                  <Text className="text-blue-300 text-sm leading-5">
                    {getInsight()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View className="px-4 py-3">
            <Text className="text-white text-lg font-bold mb-3">
              Performance Metrics
            </Text>
            <View className="flex-row gap-3 mb-3">
              <View className="bg-gray-800 rounded-xl p-4 flex-1 border border-purple-700/30">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-400 text-sm">Ghost Win Rate</Text>
                  <Ionicons name="trending-up" size={16} color="#a78bfa" />
                </View>
                <Text className="text-white text-3xl font-bold">
                  {eliteStats.ghostWinRate}%
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {practiceStats.ghostGamesWon}/{practiceStats.ghostGamesPlayed} wins
                </Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1 border border-orange-700/30">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-400 text-sm">Clutch Rate</Text>
                  <Ionicons name="flame" size={16} color="#fb923c" />
                </View>
                <Text className="text-white text-3xl font-bold">
                  {eliteStats.clutchRate}%
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Under pressure
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="bg-gray-800 rounded-xl p-4 flex-1">
                <Text className="text-gray-400 text-sm">Best Bag Run</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.bestBagRunStreak}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Consecutive</Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1">
                <Text className="text-gray-400 text-sm">Best Airmail</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.bestAirmailStreak}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">In a row</Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1">
                <Text className="text-gray-400 text-sm">Situational</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {eliteStats.situationalWinRate}%
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Win rate</Text>
              </View>
            </View>
          </View>

          {/* Training Programs */}
          <View className="px-4 py-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">
                Training Programs
              </Text>
            </View>
            {programs.map((program) => {
              const progress = getProgramProgress(program.id);
              return (
                <Pressable
                  key={program.id}
                  onPress={() => navigation.navigate("TrainingProgram", { programId: program.id })}
                  className="mb-3"
                >
                  <View
                    className={`bg-gray-800 rounded-xl p-4 border ${
                      program.started && !program.completed
                        ? "border-2"
                        : "border-gray-700"
                    }`}
                    style={program.started && !program.completed ? { borderColor: program.color } : undefined}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="rounded-full p-2 mr-3"
                          style={{ backgroundColor: `${program.color}20` }}
                        >
                          <Ionicons
                            name={program.icon as keyof typeof Ionicons.glyphMap}
                            size={20}
                            color={program.color}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-bold">
                            {program.name}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-1">
                            {program.description}
                          </Text>
                        </View>
                      </View>
                      {program.completed ? (
                        <View className="bg-green-600 rounded-full p-1">
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      ) : program.started ? (
                        <Text className="text-gray-400 text-xs">
                          Day {program.currentDay}/{program.totalDays}
                        </Text>
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                      )}
                    </View>
                    {/* Progress bar */}
                    {(program.started || program.completed) && (
                      <View className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: program.completed ? "#22c55e" : program.color,
                          }}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Practice Modes */}
          <View className="px-4 py-3">
            <Text className="text-white text-lg font-bold mb-3">
              Practice Modes
            </Text>

            {/* Skill Development */}
            <Text className="text-gray-400 text-sm font-bold mb-2 mt-2">
              SKILL DEVELOPMENT
            </Text>
            {practiceModes
              .filter(m => m.category === "skill")
              .map((mode, index) => (
                <Pressable
                  key={index}
                  onPress={() => (navigation.navigate as (route: keyof RootStackParamList) => void)(mode.route)}
                  className="mb-3"
                >
                  <LinearGradient
                    colors={[mode.color1, mode.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name={mode.icon}
                            size={24}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <Text className="text-white text-xl font-bold">
                            {mode.title}
                          </Text>
                        </View>
                        <Text className="text-white text-sm opacity-90">
                          {mode.description}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}

            {/* Mental Game */}
            <Text className="text-gray-400 text-sm font-bold mb-2 mt-4">
              MENTAL GAME
            </Text>
            {practiceModes
              .filter(m => m.category === "mental")
              .map((mode, index) => (
                <Pressable
                  key={index}
                  onPress={() => (navigation.navigate as (route: keyof RootStackParamList) => void)(mode.route)}
                  className="mb-3"
                >
                  <LinearGradient
                    colors={[mode.color1, mode.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name={mode.icon}
                            size={24}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <Text className="text-white text-xl font-bold">
                            {mode.title}
                          </Text>
                        </View>
                        <Text className="text-white text-sm opacity-90">
                          {mode.description}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}

            {/* Competitive */}
            <Text className="text-gray-400 text-sm font-bold mb-2 mt-4">
              COMPETITIVE EDGE
            </Text>
            {practiceModes
              .filter(m => m.category === "competitive")
              .map((mode, index) => (
                <Pressable
                  key={index}
                  onPress={() => (navigation.navigate as (route: keyof RootStackParamList) => void)(mode.route)}
                  className="mb-3"
                >
                  <LinearGradient
                    colors={[mode.color1, mode.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name={mode.icon}
                            size={24}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <Text className="text-white text-xl font-bold">
                            {mode.title}
                          </Text>
                        </View>
                        <Text className="text-white text-sm opacity-90">
                          {mode.description}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
          </View>

          {/* Elite Tip */}
          <View className="px-4 pb-8">
            <View className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="fitness"
                  size={24}
                  color="#c084fc"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-purple-400 font-bold mb-2">
                    Elite Athlete Mindset
                  </Text>
                  <Text className="text-purple-300 text-sm leading-5">
                    Champions are made in practice, not in games. Focus on deliberate practice,
                    track your progress, and push yourself beyond your comfort zone every session.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
