import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";
import { PersonalMatch } from "../types/personal-stats";

type MatchHistoryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MatchHistory"
>;

export default function MatchHistoryScreen() {
  const navigation = useNavigation<MatchHistoryNavigationProp>();
  const matches = usePersonalStatsStore((s) => s.matches);

  const handleMatchPress = (matchId: string) => {
    navigation.navigate("MatchDetail", { matchId });
  };

  const getMatchAccuracy = (match: PersonalMatch) => {
    const totalBags = match.rounds.length * 4;
    const totalIn = match.rounds.reduce((sum, r) => sum + r.myBagsIn, 0);
    return totalBags > 0 ? ((totalIn / totalBags) * 100).toFixed(0) : "0";
  };

  const getMatchPPR = (match: PersonalMatch) => {
    const totalRawPoints = match.rounds.reduce(
      (sum, round) => sum + round.myBagsIn * 3 + round.myBagsOn * 1,
      0
    );
    return match.rounds.length > 0
      ? (totalRawPoints / match.rounds.length).toFixed(2)
      : "0.00";
  };

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View>
            <Text className="text-white text-xl font-bold">Match History</Text>
            <Text className="text-gray-400 text-sm">
              {matches.length} {matches.length === 1 ? "game" : "games"} played
            </Text>
          </View>
        </View>

        {matches.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="calendar-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Match History
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Your completed matches will appear here
            </Text>
            <Pressable
              onPress={() => navigation.navigate("PersonalMatchLog")}
              className="bg-purple-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold text-base">
                Log Your First Match
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            {matches
              .slice()
              .reverse()
              .map((match) => {
                const accuracy = getMatchAccuracy(match);
                const ppr = getMatchPPR(match);
                const date = new Date(match.date);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <Pressable
                    key={match.id}
                    onPress={() => handleMatchPress(match.id)}
                    className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700 active:bg-gray-750"
                  >
                    {/* Match Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg mb-1">
                          {match.opponent
                            ? `vs ${match.opponent}`
                            : "Solo Practice"}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {formattedDate} at {formattedTime}
                        </Text>
                        {match.teammate && (
                          <Text className="text-gray-400 text-sm">
                            with {match.teammate}
                          </Text>
                        )}
                      </View>

                      {/* Result Badge */}
                      {match.won !== undefined && (
                        <View
                          className={`px-4 py-2 rounded-full ${
                            match.won ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <Text className="text-white text-sm font-bold">
                            {match.won ? "Won" : "Lost"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Score */}
                    <View className="flex-row items-center mb-3">
                      <Text className="text-white text-4xl font-black">
                        {match.myScore}
                      </Text>
                      <Text className="text-gray-500 text-2xl font-bold mx-3">
                        -
                      </Text>
                      <Text className="text-white text-4xl font-black">
                        {match.opponentScore ?? 0}
                      </Text>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row justify-around pt-3 border-t border-gray-700">
                      <View className="items-center">
                        <Text className="text-gray-400 text-xs mb-1">
                          Rounds
                        </Text>
                        <Text className="text-white font-bold text-lg">
                          {match.rounds.length}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-gray-400 text-xs mb-1">PPR</Text>
                        <Text className="text-purple-400 font-bold text-lg">
                          {ppr}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-gray-400 text-xs mb-1">
                          Accuracy
                        </Text>
                        <Text className="text-green-400 font-bold text-lg">
                          {accuracy}%
                        </Text>
                      </View>
                    </View>

                    {/* Notes */}
                    {match.notes && (
                      <View className="mt-3 pt-3 border-t border-gray-700">
                        <Text className="text-gray-400 text-sm italic">
                          {match.notes}
                        </Text>
                      </View>
                    )}

                    {/* Tap to view indicator */}
                    <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-700">
                      <Text className="text-purple-400 text-xs font-semibold mr-1">
                        Tap to view details
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#a855f7"
                      />
                    </View>
                  </Pressable>
                );
              })}

            <View className="h-6" />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
