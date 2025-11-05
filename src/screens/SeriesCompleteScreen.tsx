import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type SeriesCompleteRouteProp = RouteProp<RootStackParamList, "SeriesComplete">;
type SeriesCompleteNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SeriesComplete"
>;

export default function SeriesCompleteScreen() {
  const navigation = useNavigation<SeriesCompleteNavigationProp>();
  const route = useRoute<SeriesCompleteRouteProp>();
  const { seriesId } = route.params;

  const series = useTossSeriesStore((s) => s.getSeriesById(seriesId));

  if (!series) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Series not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const winner =
    series.homeTeamScore > series.awayTeamScore
      ? series.homeTeamName
      : series.awayTeamName;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Text className="text-white text-xl font-bold">Series Complete</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <View className="items-center mb-8">
            <Ionicons name="trophy" size={80} color="#fbbf24" />
            <Text className="text-white text-3xl font-bold text-center mt-4">
              {winner} Wins!
            </Text>
          </View>

          <View className="bg-gray-800 rounded-xl p-6 mb-6">
            <Text className="text-gray-400 text-center text-sm mb-4">
              Final Score
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold mb-2">
                  {series.awayTeamScore}
                </Text>
                <Text className="text-gray-400">{series.awayTeamName}</Text>
              </View>
              <View className="items-center justify-center">
                <Text className="text-gray-600 text-2xl">-</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold mb-2">
                  {series.homeTeamScore}
                </Text>
                <Text className="text-gray-400">{series.homeTeamName}</Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-800 rounded-xl p-6 mb-6">
            <Text className="text-gray-400 text-sm mb-3">Series Stats</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-300">Total Games</Text>
              <Text className="text-white font-bold">{series.games.length}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-300">Series Format</Text>
              <Text className="text-white font-bold">Best of 12</Text>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <Pressable
            onPress={() => navigation.navigate("Clubhouse")}
            className="bg-blue-600 py-4 rounded-lg items-center mb-3"
          >
            <Text className="text-white font-bold text-lg">Back to Clubhouse</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            className="bg-gray-700 py-4 rounded-lg items-center"
          >
            <Text className="text-white font-bold text-lg">Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
