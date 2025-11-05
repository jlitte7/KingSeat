import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { Round } from "../types/toss-series";

type LeagueGameScoreboardRouteProp = RouteProp<RootStackParamList, "LeagueGameScoreboard">;
type LeagueGameScoreboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LeagueGameScoreboard"
>;

export default function LeagueGameScoreboardScreen() {
  const navigation = useNavigation<LeagueGameScoreboardNavigationProp>();
  const route = useRoute<LeagueGameScoreboardRouteProp>();
  const { matchId, leagueId, gameNumber } = route.params;

  const match = useTossSeriesStore((s) => s.getMatchById(matchId, leagueId));
  const addRoundToLeagueGame = useTossSeriesStore((s) => s.addRoundToLeagueGame);
  const completeLeagueGame = useTossSeriesStore((s) => s.completeLeagueGame);

  const [p1In, setP1In] = useState(0);
  const [p1On, setP1On] = useState(0);
  const [p2In, setP2In] = useState(0);
  const [p2On, setP2On] = useState(0);

  const game = match?.games.find((g) => g.gameNumber === gameNumber);

  if (!match || !game) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Game not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const awayTeamName = `${game.awayPlayer1Name || "?"} & ${game.awayPlayer2Name || "?"}`;
  const homeTeamName = `${game.homePlayer1Name || "?"} & ${game.homePlayer2Name || "?"}`;
  const currentRound = game.rounds.length + 1;

  const handleReset = () => {
    setP1In(0);
    setP1On(0);
    setP2In(0);
    setP2On(0);
  };

  const handleEnterRound = () => {
    if (game.awayTeamScore >= 21 || game.homeTeamScore >= 21) {
      Alert.alert("Game Over", "This game has already been completed");
      return;
    }

    // Cancellation scoring
    const p1RawScore = p1In * 3 + p1On;
    const p2RawScore = p2In * 3 + p2On;
    const p1Score = Math.max(0, p1RawScore - p2RawScore);
    const p2Score = Math.max(0, p2RawScore - p1RawScore);

    const round: Round = {
      p1In,
      p1On,
      p2In,
      p2On,
      p1Score,
      p2Score,
    };

    addRoundToLeagueGame(leagueId, matchId, gameNumber, round);

    const newAwayTotal = game.awayTeamScore + p1Score;
    const newHomeTotal = game.homeTeamScore + p2Score;

    // Check if game is over
    if (newAwayTotal >= 21 || newHomeTotal >= 21) {
      const winningTeam = newAwayTotal >= 21 ? "away" : "home";
      completeLeagueGame(leagueId, matchId, gameNumber, winningTeam);

      Alert.alert(
        "Game Complete!",
        `${winningTeam === "away" ? match.awayTeamName : match.homeTeamName} wins ${Math.max(newAwayTotal, newHomeTotal)} - ${Math.min(newAwayTotal, newHomeTotal)}`,
        [
          {
            text: "Back to Match",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }

    handleReset();
  };

  const Counter = ({
    label,
    value,
    onIncrement,
    onDecrement,
    color,
  }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    color: string;
  }) => (
    <View className="flex-1">
      <Text className={`text-center font-bold mb-2 ${color}`}>{label}</Text>
      <View className="flex-row items-center justify-center">
        <Pressable
          onPress={onDecrement}
          className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          disabled={value === 0}
        >
          <Ionicons name="remove" size={24} color={value === 0 ? "#4b5563" : "#fff"} />
        </Pressable>
        <Text className="text-white text-3xl font-bold mx-6 w-12 text-center">
          {value}
        </Text>
        <Pressable
          onPress={onIncrement}
          className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center"
          disabled={value === 4}
        >
          <Ionicons name="add" size={24} color={value === 4 ? "#4b5563" : "#fff"} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">
                Game {gameNumber} - 2v2
              </Text>
              <Text className="text-gray-400 text-sm">Round {currentRound}</Text>
            </View>
          </View>
        </View>

        {/* Score Display */}
        <View className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-blue-400 text-xs mb-1">{match.awayTeamName}</Text>
              <Text className="text-blue-400 text-sm font-bold">
                {awayTeamName}
              </Text>
            </View>
            <Text className="text-blue-400 text-3xl font-bold">{game.awayTeamScore}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-red-400 text-xs mb-1">{match.homeTeamName}</Text>
              <Text className="text-red-400 text-sm font-bold">
                {homeTeamName}
              </Text>
            </View>
            <Text className="text-red-400 text-3xl font-bold">{game.homeTeamScore}</Text>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Away Team Counters */}
          <View className="px-6 py-6 border-b-2 border-blue-600">
            <Text className="text-blue-400 text-xl font-bold mb-2 text-center">
              {match.awayTeamName}
            </Text>
            <Text className="text-blue-300 text-sm text-center mb-4">
              {awayTeamName}
            </Text>
            <View className="flex-row">
              <Counter
                label="IN"
                value={p1In}
                onIncrement={() => setP1In(Math.min(4, p1In + 1))}
                onDecrement={() => setP1In(Math.max(0, p1In - 1))}
                color="text-blue-400"
              />
              <View className="w-4" />
              <Counter
                label="ON"
                value={p1On}
                onIncrement={() => setP1On(Math.min(4, p1On + 1))}
                onDecrement={() => setP1On(Math.max(0, p1On - 1))}
                color="text-blue-400"
              />
            </View>
          </View>

          {/* Home Team Counters */}
          <View className="px-6 py-6 border-b-2 border-red-600">
            <Text className="text-red-400 text-xl font-bold mb-2 text-center">
              {match.homeTeamName}
            </Text>
            <Text className="text-red-300 text-sm text-center mb-4">
              {homeTeamName}
            </Text>
            <View className="flex-row">
              <Counter
                label="IN"
                value={p2In}
                onIncrement={() => setP2In(Math.min(4, p2In + 1))}
                onDecrement={() => setP2In(Math.max(0, p2In - 1))}
                color="text-red-400"
              />
              <View className="w-4" />
              <Counter
                label="ON"
                value={p2On}
                onIncrement={() => setP2On(Math.min(4, p2On + 1))}
                onDecrement={() => setP2On(Math.max(0, p2On - 1))}
                color="text-red-400"
              />
            </View>
          </View>

          {/* Round History */}
          {game.rounds.length > 0 && (
            <View className="px-6 py-4">
              <Text className="text-gray-400 text-sm font-bold mb-3">
                Round History
              </Text>
              {game.rounds.slice().reverse().map((round, index) => (
                <View
                  key={game.rounds.length - index}
                  className="bg-gray-800 rounded-lg p-3 mb-2"
                >
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-blue-400 text-sm">
                      {match.awayTeamName}: {round.p1In}in {round.p1On}on
                    </Text>
                    <Text className="text-blue-400 text-sm font-bold">
                      {round.p1Score}pts
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-red-400 text-sm">
                      {match.homeTeamName}: {round.p2In}in {round.p2On}on
                    </Text>
                    <Text className="text-red-400 text-sm font-bold">
                      {round.p2Score}pts
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs text-right mt-1">
                    Round {game.rounds.length - index}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <View className="flex-row mb-3">
            <Pressable
              onPress={handleReset}
              className="flex-1 bg-gray-700 py-4 rounded-lg mr-2"
            >
              <Text className="text-white font-bold text-center">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleEnterRound}
              className="flex-1 bg-green-600 py-4 rounded-lg ml-2"
            >
              <Text className="text-white font-bold text-center">Enter</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
