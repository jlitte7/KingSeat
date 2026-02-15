import React, { useState } from "react";
import { View, Text, Pressable, Dimensions, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTossSeriesStore } from "../state/toss-series-store";
import { Ionicons } from "@expo/vector-icons";
import { Round } from "../types/toss-series";
import { LinearGradient } from "expo-linear-gradient";

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
  const [showGameOver, setShowGameOver] = useState(false);
  const [winningTeam, setWinningTeam] = useState("");
  const [finalScore, setFinalScore] = useState({ winner: 0, loser: 0 });

  // Track which player is throwing (rotates each round)
  const [awayThrowerIndex, setAwayThrowerIndex] = useState(0);
  const [homeThrowerIndex, setHomeThrowerIndex] = useState(0);

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

  // Calculate preview scores with cancellation
  const awayRawScore = awayIn * 3 + awayOn;
  const homeRawScore = homeIn * 3 + homeOn;
  const awayRoundPoints = Math.max(0, awayRawScore - homeRawScore);
  const homeRoundPoints = Math.max(0, homeRawScore - awayRawScore);
  const projectedAwayTotal = game.awayTeamScore + awayRoundPoints;
  const projectedHomeTotal = game.homeTeamScore + homeRoundPoints;

  // Calculate live stats for current thrower
  const awayThrowerRounds = game.rounds.filter(r => r.p1ThrowerId === currentAwayThrower.id);
  const homeThrowerRounds = game.rounds.filter(r => r.p2ThrowerId === currentHomeThrower.id);

  const calcStats = (rounds: typeof game.rounds) => {
    const totalIn = rounds.reduce((sum, r) => sum + r.p1In, 0);
    const totalOn = rounds.reduce((sum, r) => sum + r.p1On, 0);
    const totalThrows = rounds.length * 4;
    const ppr = rounds.length > 0 ? (rounds.reduce((sum, r) => sum + r.p1Score, 0) / rounds.length).toFixed(1) : "0.0";
    const inPct = totalThrows > 0 ? ((totalIn / totalThrows) * 100).toFixed(0) : "0";
    const onPct = totalThrows > 0 ? ((totalOn / totalThrows) * 100).toFixed(0) : "0";
    const fourBaggers = rounds.filter(r => r.p1In === 4).length;

    return { ppr, inPct, onPct, fourBaggers, totalIn, totalOn };
  };

  const awayStats = calcStats(awayThrowerRounds);
  const homeStats = calcStats(homeThrowerRounds.map(r => ({ ...r, p1In: r.p2In, p1On: r.p2On, p1Score: r.p2Score })));

  const handleReset = () => {
    setAwayIn(0);
    setAwayOn(0);
    setHomeIn(0);
    setHomeOn(0);
  };

  const handleEnterRound = () => {
    if (game.awayTeamScore >= 21 || game.homeTeamScore >= 21) {
      return;
    }

    const round: Round = {
      p1ThrowerId: currentAwayThrower.id,
      p1ThrowerName: currentAwayThrower.name,
      p1In: awayIn,
      p1On: awayOn,
      p1Score: awayRoundPoints,
      p2ThrowerId: currentHomeThrower.id,
      p2ThrowerName: currentHomeThrower.name,
      p2In: homeIn,
      p2On: homeOn,
      p2Score: homeRoundPoints,
    };

    addRoundToLeagueGame(leagueId, matchId, gameNumber, round);

    if (projectedAwayTotal >= 21 || projectedHomeTotal >= 21) {
      const winner = projectedAwayTotal >= 21 ? "away" : "home";
      completeLeagueGame(leagueId, matchId, gameNumber, winner);

      setWinningTeam(winner === "away" ? match.awayTeamName : match.homeTeamName);
      setFinalScore({
        winner: Math.max(projectedAwayTotal, projectedHomeTotal),
        loser: Math.min(projectedAwayTotal, projectedHomeTotal),
      });
      setShowGameOver(true);
    } else {
      setAwayThrowerIndex((prev) => (prev + 1) % 2);
      setHomeThrowerIndex((prev) => (prev + 1) % 2);
    }

    handleReset();
  };

  const handleCloseGame = () => {
    setShowGameOver(false);
    navigation.goBack();
  };

  const NumberSelector = ({
    label,
    value,
    onChange,
    color,
    maxValue = 4,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    color: string;
    maxValue?: number;
  }) => (
    <View className="items-center">
      <Text className={`text-xs font-bold mb-2 ${color}`}>{label}</Text>
      <View className="flex-row gap-1">
        {[0, 1, 2, 3, 4].map((num) => {
          const isDisabled = num > maxValue;
          const isSelected = value === num;
          return (
            <Pressable
              key={num}
              onPress={() => !isDisabled && onChange(num)}
              disabled={isDisabled}
              className={`w-10 h-10 rounded-lg items-center justify-center ${
                isSelected
                  ? "bg-white"
                  : isDisabled
                  ? "bg-gray-800"
                  : "bg-gray-700"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  isSelected
                    ? color.replace("text-", "text-")
                    : isDisabled
                    ? "text-gray-600"
                    : "text-gray-300"
                }`}
              >
                {num}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const { width } = Dimensions.get("window");
  const isCompact = width < 400;

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between bg-gray-900 border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View className="items-center">
            <Text className="text-white text-lg font-bold">Game {gameNumber}</Text>
            <Text className="text-gray-400 text-xs">Round {currentRound}</Text>
          </View>
          <Pressable onPress={handleReset} className="p-1">
            <Ionicons name="refresh" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Live Score Display */}
        <View className="px-4 py-6 bg-gradient-to-b from-gray-900 to-black">
          <View className="flex-row items-center justify-center gap-8 mb-4">
            <View className="items-center flex-1">
              <Text className="text-blue-400 text-sm font-bold mb-1 text-center" numberOfLines={1}>
                {match.awayTeamName}
              </Text>
              <Text
                className="text-white font-black"
                style={{
                  fontSize: isCompact ? 56 : 72,
                  textShadowColor: "rgba(59, 130, 246, 0.5)",
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 20,
                }}
              >
                {projectedAwayTotal}
              </Text>
              {awayRoundPoints > 0 && (
                <Text className="text-green-400 text-xs font-bold">
                  +{awayRoundPoints}
                </Text>
              )}
            </View>

            <Text className="text-gray-600 text-4xl font-bold">-</Text>

            <View className="items-center flex-1">
              <Text className="text-red-400 text-sm font-bold mb-1 text-center" numberOfLines={1}>
                {match.homeTeamName}
              </Text>
              <Text
                className="text-white font-black"
                style={{
                  fontSize: isCompact ? 56 : 72,
                  textShadowColor: "rgba(239, 68, 68, 0.5)",
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 20,
                }}
              >
                {projectedHomeTotal}
              </Text>
              {homeRoundPoints > 0 && (
                <Text className="text-green-400 text-xs font-bold">
                  +{homeRoundPoints}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Away Team Input */}
        <View className="flex-1 px-4 pt-4 pb-3">
          <View className="bg-gray-900 rounded-2xl p-4 mb-3 border-2 border-blue-500/30">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-blue-400 text-xs font-bold">
                  {match.awayTeamName}
                </Text>
                <Text className="text-white text-lg font-bold">
                  {currentAwayThrower.name}
                </Text>
              </View>
              <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                <Text className="text-blue-400 font-bold text-sm">
                  {awayRawScore} pts
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around mb-3 bg-gray-800/50 rounded-lg py-2">
              <View className="items-center">
                <Text className="text-gray-400 text-xs">PPR</Text>
                <Text className="text-blue-400 font-bold text-sm">{awayStats.ppr}</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">In%</Text>
                <Text className="text-blue-400 font-bold text-sm">{awayStats.inPct}%</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">On%</Text>
                <Text className="text-blue-400 font-bold text-sm">{awayStats.onPct}%</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">4B</Text>
                <Text className="text-blue-400 font-bold text-sm">{awayStats.fourBaggers}</Text>
              </View>
            </View>

            {/* Bag Selectors Stacked */}
            <View className="gap-2">
              <NumberSelector
                label="BAGS IN"
                value={awayIn}
                onChange={setAwayIn}
                color="text-blue-400"
                maxValue={4 - awayOn}
              />
              <NumberSelector
                label="BAGS ON"
                value={awayOn}
                onChange={setAwayOn}
                color="text-blue-400"
                maxValue={4 - awayIn}
              />
            </View>
          </View>

          {/* Home Team Input */}
          <View className="bg-gray-900 rounded-2xl p-4 border-2 border-red-500/30">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-red-400 text-xs font-bold">
                  {match.homeTeamName}
                </Text>
                <Text className="text-white text-lg font-bold">
                  {currentHomeThrower.name}
                </Text>
              </View>
              <View className="bg-red-500/20 px-3 py-1 rounded-full">
                <Text className="text-red-400 font-bold text-sm">
                  {homeRawScore} pts
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around mb-3 bg-gray-800/50 rounded-lg py-2">
              <View className="items-center">
                <Text className="text-gray-400 text-xs">PPR</Text>
                <Text className="text-red-400 font-bold text-sm">{homeStats.ppr}</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">In%</Text>
                <Text className="text-red-400 font-bold text-sm">{homeStats.inPct}%</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">On%</Text>
                <Text className="text-red-400 font-bold text-sm">{homeStats.onPct}%</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-xs">4B</Text>
                <Text className="text-red-400 font-bold text-sm">{homeStats.fourBaggers}</Text>
              </View>
            </View>

            {/* Bag Selectors Stacked */}
            <View className="gap-2">
              <NumberSelector
                label="BAGS IN"
                value={homeIn}
                onChange={setHomeIn}
                color="text-red-400"
                maxValue={4 - homeOn}
              />
              <NumberSelector
                label="BAGS ON"
                value={homeOn}
                onChange={setHomeOn}
                color="text-red-400"
                maxValue={4 - homeIn}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <SafeAreaView edges={["bottom"]} className="bg-gray-900 border-t border-gray-800">
          <View className="px-4 py-3">
            <Pressable
              onPress={handleEnterRound}
              disabled={awayIn + awayOn === 0 && homeIn + homeOn === 0}
              className={`py-4 rounded-xl items-center ${
                awayIn + awayOn === 0 && homeIn + homeOn === 0
                  ? "bg-gray-700"
                  : "bg-green-600"
              }`}
            >
              <Text className="text-white font-bold text-lg">
                Submit Round {currentRound}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaView>

      {/* Game Over Modal */}
      <Modal visible={showGameOver} transparent animationType="fade">
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1 items-center justify-center px-6">
            <View className="bg-gray-900 rounded-3xl p-8 w-full max-w-md border border-gray-700">
              <View className="items-center mb-6">
                <Text className="text-yellow-400 text-6xl mb-4">🏆</Text>
                <Text className="text-white text-3xl font-bold text-center mb-2">
                  {winningTeam} Wins!
                </Text>
                <Text className="text-gray-300 text-5xl font-bold">
                  {finalScore.winner} - {finalScore.loser}
                </Text>
              </View>

              <Pressable
                onPress={handleCloseGame}
                className="bg-green-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Back to Match
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
