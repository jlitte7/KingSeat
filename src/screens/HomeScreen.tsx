import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#1a1a1a", "#000000", "#7f1d1d"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-6">
            <View className="mb-16">
              <Text className="text-7xl font-black text-center mb-2">
                <Text className="text-red-500">TOSS</Text>
              </Text>
              <Text className="text-7xl font-black text-center text-white">
                SERIES
              </Text>
              <Text className="text-xl text-center text-gray-300 mt-4">
                Ultimate Cornhole Tracker
              </Text>
            </View>

            <View className="w-full max-w-md gap-4">
              <Pressable
                onPress={() => navigation.navigate("ScoreboardSetup")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#dc2626", "#b91c1c"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    📊 Scoreboard
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Track a quick game
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Clubhouse")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#2563eb", "#1e40af"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    🏆 Clubhouse
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Manage teams & players
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("CornholeIQ")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#7c3aed", "#6d28d9"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    📈 CornholeIQ
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    View team statistics
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("PersonalStats")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#a855f7", "#9333ea"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    📊 My Stats
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Track your personal bags
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("TossOff")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#16a34a", "#15803d"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    🎯 TossOff
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Coming soon
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("CornHub")}
                className="w-full rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#ca8a04", "#a16207"]}
                  style={{ padding: 20, alignItems: "center" }}
                >
                  <Text className="text-white font-bold text-xl">
                    🌽 CornHub
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Coming soon
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
