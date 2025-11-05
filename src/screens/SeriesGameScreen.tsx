import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type SeriesGameRouteProp = RouteProp<RootStackParamList, "SeriesGame">;
type SeriesGameNavigationProp = NativeStackNavigationProp<RootStackParamList, "SeriesGame">;

export default function SeriesGameScreen() {
  const navigation = useNavigation<SeriesGameNavigationProp>();
  const route = useRoute<SeriesGameRouteProp>();
  const { seriesId, gameIndex } = route.params;

  const series = useTossSeriesStore((s) => s.getSeriesById(seriesId));
  const createGame = useTossSeriesStore((s) => s.createGame);
  const addRoundToGame = useTossSeriesStore((s) => s.addRoundToGame);
  const completeGame = useTossSeriesStore((s) => s.completeGame);

  const [currentRound, setCurrentRound] = useState(1);
  const [player1In, setPlayer1In] = useState(0);
  const [player1On, setPlayer1On] = useState(0);
  const [player2In, setPlayer2In] = useState(0);
  const [player2On, setPlayer2On] = useState(0);

  if (!series) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Series not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // For now, just show a placeholder since we need to implement player selection logic
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">
                Game {gameIndex + 1} of 12
              </Text>
              <Text className="text-gray-400 text-sm">
                {series.awayTeamName} vs {series.homeTeamName}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="construct-outline" size={80} color="#4b5563" />
          <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
            Series Game Coming Soon
          </Text>
          <Text className="text-gray-500 text-center">
            The series game scoreboard is being built. For now, you can use the regular
            scoreboard to track games.
          </Text>
        </View>

        <View className="px-4 pb-4 pt-2 border-t border-gray-800">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-700 py-4 rounded-lg items-center"
          >
            <Text className="text-white font-bold text-lg">Back to Series</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
