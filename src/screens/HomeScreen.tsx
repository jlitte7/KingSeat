import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const mainFeatures = [
    {
      id: "scoreboard",
      title: "Quick Game",
      subtitle: "Start playing now",
      icon: "game-controller" as const,
      colors: ["#ef4444", "#dc2626"] as const,
      onPress: () => navigation.navigate("ScoreboardSetup"),
    },
    {
      id: "mystats",
      title: "My Stats",
      subtitle: "Track your performance",
      icon: "stats-chart" as const,
      colors: ["#a855f7", "#9333ea"] as const,
      onPress: () => navigation.navigate("PersonalStats"),
    },
  ];

  const features = [
    {
      id: "clubhouse",
      title: "Clubhouse",
      subtitle: "Teams & leagues",
      icon: "people" as const,
      colors: ["#3b82f6", "#2563eb"] as const,
      onPress: () => navigation.navigate("Clubhouse"),
    },
    {
      id: "cornholeiq",
      title: "CornholeIQ",
      subtitle: "Team statistics",
      icon: "analytics" as const,
      colors: ["#8b5cf6", "#7c3aed"] as const,
      onPress: () => navigation.navigate("CornholeIQ"),
    },
    {
      id: "cornhub",
      title: "CornHub",
      subtitle: "Practice modes",
      icon: "fitness" as const,
      colors: ["#f59e0b", "#d97706"] as const,
      onPress: () => navigation.navigate("CornHub"),
    },
    {
      id: "tossoff",
      title: "TossOff",
      subtitle: "Coming soon",
      icon: "trophy" as const,
      colors: ["#10b981", "#059669"] as const,
      onPress: () => navigation.navigate("TossOff"),
    },
  ];

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#000000"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="px-6 pt-8 pb-6">
              <Text className="text-white text-4xl font-black mb-2">
                TOSS SERIES
              </Text>
              <Text className="text-gray-400 text-base">
                Ultimate Cornhole Tracker
              </Text>
            </View>

            {/* Main Action Cards */}
            <View className="px-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4">
                Quick Actions
              </Text>
              <View className="gap-4">
                {mainFeatures.map((feature) => (
                  <Pressable
                    key={feature.id}
                    onPress={feature.onPress}
                    className="w-full rounded-3xl overflow-hidden"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <LinearGradient
                      colors={feature.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        padding: 24,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View className="flex-1">
                        <Text className="text-white text-2xl font-bold mb-1">
                          {feature.title}
                        </Text>
                        <Text className="text-white/80 text-sm">
                          {feature.subtitle}
                        </Text>
                      </View>
                      <View className="bg-white/20 p-4 rounded-2xl">
                        <Ionicons name={feature.icon} size={32} color="#fff" />
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Feature Grid */}
            <View className="px-6 pb-8">
              <Text className="text-white text-lg font-bold mb-4">
                More Features
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {features.map((feature) => (
                  <Pressable
                    key={feature.id}
                    onPress={feature.onPress}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: "48%",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 5,
                    }}
                  >
                    <LinearGradient
                      colors={feature.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 20, minHeight: 140 }}
                    >
                      <View className="bg-white/20 p-3 rounded-xl mb-3 self-start">
                        <Ionicons name={feature.icon} size={24} color="#fff" />
                      </View>
                      <Text className="text-white text-lg font-bold mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-white/70 text-xs">
                        {feature.subtitle}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Stats Summary (Optional) */}
            <View className="px-6 pb-8">
              <View className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <Text className="text-white text-base font-bold mb-3">
                  💡 Pro Tip
                </Text>
                <Text className="text-gray-400 text-sm leading-6">
                  Use My Stats to track your personal bag throwing performance across all games.
                  Link it to your Clubhouse player profile for comprehensive tracking!
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
