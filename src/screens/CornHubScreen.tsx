import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { usePracticeStore } from "../state/practice-store";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PracticeModeCard {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color1: string;
  color2: string;
  route: keyof RootStackParamList;
}

export default function CornHubScreen() {
  const navigation = useNavigation<NavigationProp>();
  const practiceStats = usePracticeStore((s) => s.practiceStats);

  const practiceModes: PracticeModeCard[] = [
    {
      title: "Ghost Player",
      description: "Practice against AI opponents at different skill levels",
      icon: "game-controller",
      color1: "#667eea",
      color2: "#764ba2",
      route: "GhostPlayer",
    },
    {
      title: "Bag Run",
      description: "Track how many consecutive bags you can make in a row",
      icon: "trophy",
      color1: "#f093fb",
      color2: "#f5576c",
      route: "BagRun",
    },
    {
      title: "Airmail Run",
      description: "Track consecutive airmail shots without touching the board",
      icon: "airplane",
      color1: "#4facfe",
      color2: "#00f2fe",
      route: "AirmailRun",
    },
    {
      title: "Situational Games",
      description: "Drop into mid-game scenarios and play them out",
      icon: "flash",
      color1: "#43e97b",
      color2: "#38f9d7",
      route: "SituationalGames",
    },
    {
      title: "Best Game Challenge",
      description: "Try to beat your personal best performance",
      icon: "star",
      color1: "#fa709a",
      color2: "#fee140",
      route: "BestGameChallenge",
    },
    {
      title: "Pressure Practice",
      description: "Practice clutch shots in high-pressure scenarios",
      icon: "flame",
      color1: "#ff9a56",
      color2: "#ff6a00",
      route: "PressurePractice",
    },
  ];

  return (
    <View className="flex-1 bg-gray-950">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-2xl font-bold">CornHub</Text>
          </View>
          <Text className="text-4xl">🌽</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View className="px-4 py-6">
            <Text className="text-white text-lg font-bold mb-4">
              Your Practice Stats
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                <Text className="text-gray-400 text-sm">Ghost Games</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.ghostGamesWon}/{practiceStats.ghostGamesPlayed}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Wins</Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                <Text className="text-gray-400 text-sm">Best Bag Run</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.bestBagRunStreak}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Streak</Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                <Text className="text-gray-400 text-sm">Best Airmail</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.bestAirmailStreak}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Streak</Text>
              </View>
              <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                <Text className="text-gray-400 text-sm">Situational</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {practiceStats.situationalGamesWon}/
                  {practiceStats.situationalGamesPlayed}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">Wins</Text>
              </View>
            </View>
          </View>

          {/* Practice Modes */}
          <View className="px-4 pb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Practice Modes
            </Text>
            {practiceModes.map((mode, index) => (
              <Pressable
                key={index}
                onPress={() => navigation.navigate(mode.route as any)}
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

          {/* Tips Section */}
          <View className="px-4 pb-8">
            <View className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={24}
                  color="#60a5fa"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-blue-400 font-bold mb-2">
                    Practice Tips
                  </Text>
                  <Text className="text-blue-300 text-sm leading-5">
                    Consistent practice is key to improvement. Focus on one mode
                    at a time and track your progress. The Ghost Player mode
                    adapts to challenge you at your skill level.
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
