import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";

type ClubhouseNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Clubhouse"
>;

export default function ClubhouseScreen() {
  const navigation = useNavigation<ClubhouseNavigationProp>();
  const teams = useTossSeriesStore((s) => s.teams);
  const visibleTeamsCount = teams.filter((t) => !t.isHidden).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Clubhouse</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="business-outline" size={80} color="#4b5563" />
          <Text className="text-gray-300 text-2xl font-bold text-center mt-4 mb-2">
            Clubhouse Home
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Manage your teams, leagues, and matches
          </Text>
        </View>

        <View className="px-4 pb-4 pt-2 border-t border-gray-800">
          <Pressable
            onPress={() => navigation.navigate("TeamsList")}
            className="bg-green-600 py-4 rounded-lg items-center mb-3"
          >
            <Text className="text-white font-bold text-lg">
              👥 Teams
            </Text>
          </Pressable>
          {visibleTeamsCount >= 2 && (
            <>
              <Pressable
                onPress={() => navigation.navigate("LeagueList")}
                className="bg-purple-600 py-4 rounded-lg items-center mb-3"
              >
                <Text className="text-white font-bold text-lg">
                  🏆 View Leagues
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("SeriesSetup")}
                className="bg-red-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-bold text-lg">
                  🎯 Start Single Match
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
