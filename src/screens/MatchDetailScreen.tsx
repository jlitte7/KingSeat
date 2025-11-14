import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";

type MatchDetailRouteProp = RouteProp<RootStackParamList, "MatchDetail">;
type MatchDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MatchDetail"
>;

export default function MatchDetailScreen() {
  const navigation = useNavigation<MatchDetailNavigationProp>();
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;

  const matches = usePersonalStatsStore((s) => s.matches);
  const match = matches.find((m) => m.id === matchId);

  if (!match) {
    return (
      <View className="flex-1 bg-gray-900">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Match Detail</Text>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-gray-400 text-lg text-center">
              Match not found
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const date = new Date(match.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Calculate match stats
  const totalBags = match.rounds.length * 4;
  const totalBagsIn = match.rounds.reduce((sum, r) => sum + r.myBagsIn, 0);
  const totalBagsOn = match.rounds.reduce((sum, r) => sum + r.myBagsOn, 0);
  const totalBagsMissed = totalBags - totalBagsIn - totalBagsOn;

  const bagsInPct = totalBags > 0 ? ((totalBagsIn / totalBags) * 100).toFixed(1) : "0.0";
  const bagsOnPct = totalBags > 0 ? ((totalBagsOn / totalBags) * 100).toFixed(1) : "0.0";
  const boardPct = totalBags > 0 ? (((totalBagsIn + totalBagsOn) / totalBags) * 100).toFixed(1) : "0.0";

  const totalRawPoints = match.rounds.reduce(
    (sum, round) => sum + round.myBagsIn * 3 + round.myBagsOn * 1,
    0
  );
  const oppRawPoints = match.rounds.reduce(
    (sum, round) => sum + round.opponentBagsIn * 3 + round.opponentBagsOn * 1,
    0
  );

  const myPPR = match.rounds.length > 0 ? (totalRawPoints / match.rounds.length).toFixed(2) : "0.00";
  const oppPPR = match.rounds.length > 0 ? (oppRawPoints / match.rounds.length).toFixed(2) : "0.00";
  const dpr = match.rounds.length > 0 ? (totalBagsMissed / match.rounds.length).toFixed(2) : "0.00";

  const fourBaggers = match.rounds.filter((r) => r.myBagsIn === 4).length;
  const threeBaggers = match.rounds.filter((r) => r.myBagsIn === 3).length;
  const zeroBagRounds = match.rounds.filter((r) => r.myBagsIn === 0 && r.myBagsOn === 0).length;

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">Match Detail</Text>
              <Text className="text-gray-400 text-sm">
                {match.opponent ? `vs ${match.opponent}` : "Solo Practice"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Match Info Card */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white font-bold text-xl mb-1">
                  {match.opponent ? `vs ${match.opponent}` : "Solo Practice"}
                </Text>
                <Text className="text-gray-400 text-sm">{formattedDate}</Text>
                <Text className="text-gray-400 text-sm">{formattedTime}</Text>
                {match.teammate && (
                  <Text className="text-gray-400 text-sm mt-1">
                    with {match.teammate}
                  </Text>
                )}
              </View>

              {/* Result Badge */}
              {match.won !== undefined && (
                <View
                  className={`px-5 py-2 rounded-full ${
                    match.won ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <Text className="text-white text-base font-bold">
                    {match.won ? "Won" : "Lost"}
                  </Text>
                </View>
              )}
            </View>

            {/* Final Score */}
            <View className="bg-gray-700 rounded-xl p-4 items-center">
              <Text className="text-gray-400 text-xs mb-2">FINAL SCORE</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-5xl font-black">
                  {match.myScore}
                </Text>
                <Text className="text-gray-500 text-3xl font-bold mx-4">-</Text>
                <Text className="text-white text-5xl font-black">
                  {match.opponentScore ?? 0}
                </Text>
              </View>
            </View>

            {match.notes && (
              <View className="mt-4 pt-4 border-t border-gray-700">
                <Text className="text-gray-400 text-xs mb-2">NOTES</Text>
                <Text className="text-white text-sm">{match.notes}</Text>
              </View>
            )}
          </View>

          {/* Match Summary Stats */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">
              Match Summary
            </Text>

            <View className="flex-row justify-around mb-4 pb-4 border-b border-gray-700">
              <View className="items-center">
                <Text className="text-white text-3xl font-bold">
                  {match.rounds.length}
                </Text>
                <Text className="text-gray-400 text-xs">Rounds</Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-400 text-3xl font-bold">
                  {myPPR}
                </Text>
                <Text className="text-gray-400 text-xs">Your PPR</Text>
              </View>
              <View className="items-center">
                <Text className="text-orange-400 text-3xl font-bold">
                  {dpr}
                </Text>
                <Text className="text-gray-400 text-xs">DPR</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-400 text-3xl font-bold">{oppPPR}</Text>
                <Text className="text-gray-400 text-xs">Opp PPR</Text>
              </View>
            </View>

            {/* Accuracy Breakdown */}
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-green-500" />
                  <Text className="text-white font-semibold">Bags In</Text>
                </View>
                <Text className="text-green-400 font-bold text-lg">
                  {totalBagsIn} ({bagsInPct}%)
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-blue-500" />
                  <Text className="text-white font-semibold">Bags On</Text>
                </View>
                <Text className="text-blue-400 font-bold text-lg">
                  {totalBagsOn} ({bagsOnPct}%)
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-red-500" />
                  <Text className="text-white font-semibold">Bags Missed</Text>
                </View>
                <Text className="text-red-400 font-bold text-lg">
                  {totalBagsMissed}
                </Text>
              </View>

              <View className="flex-row justify-between items-center pt-3 border-t border-gray-700">
                <Text className="text-gray-400">Board Percentage</Text>
                <Text className="text-green-400 font-bold text-lg">
                  {boardPct}%
                </Text>
              </View>
            </View>
          </View>

          {/* Notable Stats */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">
              Notable Stats
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                <Text className="text-gray-400 text-xs mb-1">Four Baggers</Text>
                <Text className="text-yellow-400 text-3xl font-bold">
                  {fourBaggers}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                <Text className="text-gray-400 text-xs mb-1">Three Baggers</Text>
                <Text className="text-white text-3xl font-bold">
                  {threeBaggers}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-700 rounded-xl p-4">
                <Text className="text-gray-400 text-xs mb-1">Zero Rounds</Text>
                <Text className="text-white text-3xl font-bold">
                  {zeroBagRounds}
                </Text>
              </View>
            </View>
          </View>

          {/* Round by Round */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">
              Round by Round
            </Text>

            {match.rounds.map((round, index) => {
              const roundRawPoints = round.myBagsIn * 3 + round.myBagsOn * 1;
              const oppRoundRawPoints =
                round.opponentBagsIn * 3 + round.opponentBagsOn * 1;

              return (
                <View
                  key={index}
                  className="bg-gray-700 rounded-xl p-4 mb-3 last:mb-0"
                >
                  {/* Round Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white font-bold text-lg">
                      Round {round.roundNumber}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-white font-bold text-xl">
                        {round.myScore}
                      </Text>
                      <Text className="text-gray-500 font-bold">-</Text>
                      <Text className="text-white font-bold text-xl">
                        {round.opponentScore}
                      </Text>
                    </View>
                  </View>

                  {/* Your Performance */}
                  <View className="bg-gray-800 rounded-lg p-3 mb-2">
                    <Text className="text-gray-400 text-xs mb-2">
                      YOUR PERFORMANCE
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row gap-4">
                        <View>
                          <Text className="text-gray-400 text-xs">In</Text>
                          <Text className="text-green-400 font-bold text-lg">
                            {round.myBagsIn}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-400 text-xs">On</Text>
                          <Text className="text-blue-400 font-bold text-lg">
                            {round.myBagsOn}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-400 text-xs">Miss</Text>
                          <Text className="text-red-400 font-bold text-lg">
                            {4 - round.myBagsIn - round.myBagsOn}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-400 text-xs">Raw Pts</Text>
                        <Text className="text-white font-bold text-lg">
                          {roundRawPoints}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Opponent Performance */}
                  <View className="bg-gray-800 rounded-lg p-3">
                    <Text className="text-gray-400 text-xs mb-2">OPPONENT</Text>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row gap-4">
                        <View>
                          <Text className="text-gray-400 text-xs">In</Text>
                          <Text className="text-green-400 font-bold text-lg">
                            {round.opponentBagsIn}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-400 text-xs">On</Text>
                          <Text className="text-blue-400 font-bold text-lg">
                            {round.opponentBagsOn}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-400 text-xs">Miss</Text>
                          <Text className="text-red-400 font-bold text-lg">
                            {4 - round.opponentBagsIn - round.opponentBagsOn}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-400 text-xs">Raw Pts</Text>
                        <Text className="text-white font-bold text-lg">
                          {oppRoundRawPoints}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
