import React, { useState, useEffect } from "react";
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

  const [awayIn, setAwayIn] = useState(0);
  const [awayOn, setAwayOn] = useState(0);
  const [homeIn, setHomeIn] = useState(0);
  const [homeOn, setHomeOn] = useState(0);

  // Track which player is throwing (rotates each round)
  const [awayThrowerIndex, setAwayThrowerIndex] = useState(0); // 0 = player1, 1 = player2
  const [homeThrowerIndex, setHomeThrowerIndex] = useState(0); // 0 = player1, 1 = player2

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

  const awayPlayers = [
    { id: game.awayPlayer1Id, name: game.awayPlayer1Name || "?" },
    { id: game.awayPlayer2Id, name: game.awayPlayer2Name || "?" },
  ];

  const homePlayers = [
    { id: game.homePlayer1Id, name: game.homePlayer1Name || "?" },
    { id: game.homePlayer2Id, name: game.homePlayer2Name || "?" },
  ];

  const currentAwayThrower = awayPlayers[awayThrowerIndex];
  const currentHomeThrower = homePlayers[homeThrowerIndex];

  const currentRound = game.rounds.length + 1;

  const handleReset = () => {
    setAwayIn(0);
    setAwayOn(0);
    setHomeIn(0);
    setHomeOn(0);
  };

  const handleEnterRound = () => {
    if (game.awayTeamScore >= 21 || game.homeTeamScore >= 21) {
      Alert.alert("Game Over", "This game has already been completed");
      return;
    }

    // Cancellation scoring
    const awayRawScore = awayIn * 3 + awayOn;
    const homeRawScore = homeIn * 3 + homeOn;
    const awayScore = Math.max(0, awayRawScore - homeRawScore);
    const homeScore = Math.max(0, homeRawScore - awayRawScore);

    const round: Round = {
      // Away team thrower
      p1ThrowerId: currentAwayThrower.id,
      p1ThrowerName: currentAwayThrower.name,
      p1In: awayIn,
      p1On: awayOn,
      p1Score: awayScore,

      // Home team thrower
      p2ThrowerId: currentHomeThrower.id,
      p2ThrowerName: currentHomeThrower.name,
      p2In: homeIn,
      p2On: homeOn,
      p2Score: homeScore,
    };

    addRoundToLeagueGame(leagueId, matchId, gameNumber, round);

    const newAwayTotal = game.awayTeamScore + awayScore;
    const newHomeTotal = game.homeTeamScore + homeScore;

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
    } else {
      // Rotate to next thrower for next round
      setAwayThrowerIndex((prev) => (prev + 1) % 2);
      setHomeThrowerIndex((prev) => (prev + 1) % 2);
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
      <Text className={`text-center font-bold mb-3 text-lg ${color}`}>{label}</Text>
      <View className="flex-row items-center justify-center">
        <Pressable
          onPress={onDecrement}
          className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center"
          disabled={value === 0}
        >
          <Ionicons name="remove" size={28} color={value === 0 ? "#4b5563" : "#fff"} />
        </Pressable>
        <Text className="text-white text-5xl font-bold mx-8 w-16 text-center">
          {value}
        </Text>
        <Pressable
          onPress={onIncrement}
          className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center"
          disabled={value === 4}
        >
          <Ionicons name="add" size={28} color={value === 4 ? "#4b5563" : "#fff"} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
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

        {/* Score Display - Compact */}
        <View className="px-6 py-4 border-b border-gray-800">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text className="text-blue-400 text-xs">{match.awayTeamName}</Text>
              <Text className="text-blue-400 text-sm font-bold">
                {awayPlayers[0].name} & {awayPlayers[1].name}
              </Text>
            </View>
            <Text className="text-blue-400 text-4xl font-bold">{game.awayTeamScore}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-red-400 text-xs">{match.homeTeamName}</Text>
              <Text className="text-red-400 text-sm font-bold">
                {homePlayers[0].name} & {homePlayers[1].name}
              </Text>
            </View>
            <Text className="text-red-400 text-4xl font-bold">{game.homeTeamScore}</Text>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Away Team Thrower */}
          <View className="px-6 py-8 border-b-4 border-blue-600">
            <Text className="text-blue-400 text-2xl font-bold mb-1 text-center">
              {match.awayTeamName}
            </Text>
            <Text className="text-blue-300 text-base text-center mb-6">
              {currentAwayThrower.name}
            </Text>
            <View className="flex-row">
              <Counter
                label="IN"
                value={awayIn}
                onIncrement={() => setAwayIn(Math.min(4, awayIn + 1))}
                onDecrement={() => setAwayIn(Math.max(0, awayIn - 1))}
                color="text-blue-400"
              />
              <View className="w-8" />
              <Counter
                label="ON"
                value={awayOn}
                onIncrement={() => setAwayOn(Math.min(4, awayOn + 1))}
                onDecrement={() => setAwayOn(Math.max(0, awayOn - 1))}
                color="text-blue-400"
              />
            </View>
          </View>

          {/* Home Team Thrower */}
          <View className="px-6 py-8 border-b-4 border-red-600">
            <Text className="text-red-400 text-2xl font-bold mb-1 text-center">
              {match.homeTeamName}
            </Text>
            <Text className="text-red-300 text-base text-center mb-6">
              {currentHomeThrower.name}
            </Text>
            <View className="flex-row">
              <Counter
                label="IN"
                value={homeIn}
                onIncrement={() => setHomeIn(Math.min(4, homeIn + 1))}
                onDecrement={() => setHomeIn(Math.max(0, homeIn - 1))}
                color="text-red-400"
              />
              <View className="w-8" />
              <Counter
                label="ON"
                value={homeOn}
                onIncrement={() => setHomeOn(Math.min(4, homeOn + 1))}
                onDecrement={() => setHomeOn(Math.max(0, homeOn - 1))}
                color="text-red-400"
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-6 py-4 flex-row border-t border-gray-800">
          <Pressable
            onPress={handleReset}
            className="flex-1 bg-gray-700 py-4 rounded-lg mr-2"
          >
            <Text className="text-white font-bold text-center text-lg">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleEnterRound}
            className="flex-1 bg-green-600 py-4 rounded-lg ml-2"
          >
            <Text className="text-white font-bold text-center text-lg">Enter</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
