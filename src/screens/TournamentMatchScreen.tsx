import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  ZoomIn,
} from "react-native-reanimated";
import { useTournamentStore } from "../state/tournament-store";

type TournamentMatchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TournamentMatch"
>;
type TournamentMatchScreenRouteProp = RouteProp<
  RootStackParamList,
  "TournamentMatch"
>;

interface Round {
  team1In: number;
  team1On: number;
  team2In: number;
  team2On: number;
  team1Score: number;
  team2Score: number;
}

export default function TournamentMatchScreen() {
  const navigation = useNavigation<TournamentMatchScreenNavigationProp>();
  const route = useRoute<TournamentMatchScreenRouteProp>();
  const { tournamentId, matchId } = route.params;

  const tournament = useTournamentStore((s) => s.getTournament(tournamentId));
  const recordRoundRobinResult = useTournamentStore(
    (s) => s.recordRoundRobinResult
  );

  const match = tournament?.roundRobinMatches.find((m) => m.id === matchId);

  const [isLandscape, setIsLandscape] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isTapMode, setIsTapMode] = useState(true);

  // Tap mode state
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  // Bags mode state
  const [team1BagsIn, setTeam1BagsIn] = useState(0);
  const [team1BagsOn, setTeam1BagsOn] = useState(0);
  const [team2BagsIn, setTeam2BagsIn] = useState(0);
  const [team2BagsOn, setTeam2BagsOn] = useState(0);

  const [rounds, setRounds] = useState<Round[]>([]);

  // Calculate scores for bags mode
  const team1RoundScore = team1BagsIn * 3 + team1BagsOn;
  const team2RoundScore = team2BagsIn * 3 + team2BagsOn;
  const roundDiff = Math.abs(team1RoundScore - team2RoundScore);
  const team1RoundPoints = team1RoundScore > team2RoundScore ? roundDiff : 0;
  const team2RoundPoints = team2RoundScore > team1RoundScore ? roundDiff : 0;

  const team1TotalScore = rounds.reduce((sum, r) => sum + r.team1Score, 0);
  const team2TotalScore = rounds.reduce((sum, r) => sum + r.team2Score, 0);

  // Use appropriate scores based on mode
  const displayTeam1Score = isTapMode ? team1Score : team1TotalScore;
  const displayTeam2Score = isTapMode ? team2Score : team2TotalScore;

  const gameWon = displayTeam1Score >= 21 || displayTeam2Score >= 21;

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get("window");
      setIsLandscape(width > height);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener("change", updateLayout);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (gameWon && !showGameOver) {
      setShowGameOver(true);
    }
  }, [gameWon, showGameOver]);

  if (!tournament || !match) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Match not found</Text>
      </View>
    );
  }

  const team1Name =
    match.team1.player2 === "ghost"
      ? `${match.team1.player1.name} & Ghost`
      : `${match.team1.player1.name} & ${match.team1.player2.name}`;

  const team2Name =
    match.team2.player2 === "ghost"
      ? `${match.team2.player1.name} & Ghost`
      : `${match.team2.player1.name} & ${match.team2.player2.name}`;

  const handleTopHalfPress = (team: 1 | 2) => {
    if (gameWon || !isTapMode) return;

    if (team === 1) {
      setTeam1Score(team1Score + 1);
    } else {
      setTeam2Score(team2Score + 1);
    }
  };

  const handleBottomHalfPress = (team: 1 | 2) => {
    if (gameWon || !isTapMode) return;

    if (team === 1) {
      setTeam1Score(Math.max(0, team1Score - 1));
    } else {
      setTeam2Score(Math.max(0, team2Score - 1));
    }
  };

  const handleEndRound = () => {
    if (!isTapMode) {
      const newRound: Round = {
        team1In: team1BagsIn,
        team1On: team1BagsOn,
        team2In: team2BagsIn,
        team2On: team2BagsOn,
        team1Score: team1RoundPoints,
        team2Score: team2RoundPoints,
      };

      setRounds([...rounds, newRound]);
      setTeam1BagsIn(0);
      setTeam1BagsOn(0);
      setTeam2BagsIn(0);
      setTeam2BagsOn(0);
      setCurrentRound(currentRound + 1);
    }
  };

  const handleFinishGame = () => {
    recordRoundRobinResult(
      tournamentId,
      matchId,
      displayTeam1Score,
      displayTeam2Score
    );
    navigation.goBack();
  };

  const handleReset = () => {
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1BagsIn(0);
    setTeam1BagsOn(0);
    setTeam2BagsIn(0);
    setTeam2BagsOn(0);
    setCurrentRound(1);
    setRounds([]);
  };

  const switchMode = () => {
    setIsTapMode(!isTapMode);
  };

  const handleUndoLastRound = () => {
    if (rounds.length > 0) {
      setRounds(rounds.slice(0, -1));
      setCurrentRound(currentRound - 1);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={isLandscape ? [] : ["top"]} className="flex-1">
        {/* Header */}
        <View
          className="bg-gray-900 px-4 border-b border-gray-800"
          style={{ paddingVertical: isLandscape ? 4 : 8 }}
        >
          <View className="flex-row justify-between items-center mb-1">
            <Pressable
              onPress={() => navigation.goBack()}
              className="p-1.5 w-20"
            >
              <Ionicons
                name="arrow-back"
                size={isLandscape ? 20 : 24}
                color="#fff"
              />
            </Pressable>
            <View className="items-center flex-1">
              <Text
                className="text-white font-bold tracking-wider"
                style={{ fontSize: isLandscape ? 16 : 20 }}
              >
                TOURNAMENT
              </Text>
            </View>
            <View className="w-20 items-end">
              <Pressable
                onPress={switchMode}
                className="bg-purple-600 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-xs font-bold">
                  {isTapMode ? "Bags" : "Tap"}
                </Text>
              </Pressable>
            </View>
          </View>
          <Text
            className="text-white text-center font-semibold"
            style={{ fontSize: isLandscape ? 10 : 12 }}
          >
            Round {currentRound}
          </Text>
        </View>

        {/* Conditional Scoreboard */}
        {isTapMode ? (
          // TAP MODE
          <View className="flex-1">
            {/* Team 1 Score */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Top Half - Increment */}
              <Pressable
                onPress={() => handleTopHalfPress(1)}
                className="flex-1 active:bg-gray-700"
              />

              {/* Divider Line */}
              <View className="absolute left-0 right-0 h-px bg-gray-700" style={{ top: "50%" }} />

              {/* Score and Team Name centered on divider line */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none"
                style={{
                  top: "50%",
                  transform: [{ translateY: isLandscape ? -90 : -120 }]
                }}
              >
                {isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-base mb-2">
                    {team1Name}
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 140 : 220,
                    textShadowColor: "rgba(239, 68, 68, 0.6)",
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 140 : 220,
                  }}
                >
                  {team1Score}
                </Text>
                {!isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-xl mt-2">
                    {team1Name}
                  </Text>
                )}
              </View>

              {/* Bottom Half - Decrement */}
              <Pressable
                onPress={() => handleBottomHalfPress(1)}
                className="flex-1 active:bg-gray-700"
              />
            </View>

            {/* Center Controls */}
            <View className="bg-gray-900 py-4 px-4">
              <View className="flex-row justify-around items-center">
                <Pressable
                  onPress={handleReset}
                  className="bg-red-600 px-6 py-3 rounded-full"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text className="text-white font-bold">Reset</Text>
                  </View>
                </Pressable>

                <View className="bg-gray-800 px-4 py-2 rounded-lg">
                  <Text className="text-gray-400 text-xs">Score</Text>
                  <View className="flex-row gap-3 mt-1">
                    <Text className="text-red-400 font-bold">
                      {team1Score}
                    </Text>
                    <Text className="text-gray-600">-</Text>
                    <Text className="text-blue-400 font-bold">
                      {team2Score}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Team 2 Score */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Top Half - Increment */}
              <Pressable
                onPress={() => handleTopHalfPress(2)}
                className="flex-1 active:bg-gray-700"
              />

              {/* Divider Line */}
              <View className="absolute left-0 right-0 h-px bg-gray-700" style={{ top: "50%" }} />

              {/* Score and Team Name centered on divider line */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none"
                style={{
                  top: "50%",
                  transform: [{ translateY: isLandscape ? -90 : -120 }]
                }}
              >
                {isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-base mb-2">
                    {team2Name}
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 140 : 220,
                    textShadowColor: "rgba(59, 130, 246, 0.6)",
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 140 : 220,
                  }}
                >
                  {team2Score}
                </Text>
                {!isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-xl mt-2">
                    {team2Name}
                  </Text>
                )}
              </View>

              {/* Bottom Half - Decrement */}
              <Pressable
                onPress={() => handleBottomHalfPress(2)}
                className="flex-1 active:bg-gray-700"
              />
            </View>
          </View>
        ) : (
          // BAGS MODE
          <View className="flex-1">
            {/* Team 1 Area */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Score Display */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none z-10"
                style={{
                  top: "50%",
                  transform: [{ translateY: isLandscape ? -70 : -100 }],
                }}
              >
                {isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-sm mb-1">
                    {team1Name}
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 100 : 160,
                    textShadowColor: "rgba(239, 68, 68, 0.6)",
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 100 : 160,
                  }}
                >
                  {team1TotalScore}
                </Text>
                {!isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-base mt-1">
                    {team1Name}
                  </Text>
                )}
              </View>

              {/* Bag Counter Overlay - Top Right */}
              <View className="absolute top-4 right-4 bg-black/60 rounded-xl p-3 z-20">
                <View className="items-center mb-2">
                  <Text className="text-green-400 text-xs mb-1">IN</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setTeam1BagsIn(Math.max(0, team1BagsIn - 1))}
                      className="bg-red-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">-</Text>
                    </Pressable>
                    <View className="bg-gray-700 rounded-lg w-10 h-8 items-center justify-center">
                      <Text className="text-white font-bold text-lg">
                        {team1BagsIn}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setTeam1BagsIn(Math.min(4, team1BagsIn + 1))}
                      className="bg-green-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="items-center">
                  <Text className="text-blue-400 text-xs mb-1">ON</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setTeam1BagsOn(Math.max(0, team1BagsOn - 1))}
                      className="bg-red-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">-</Text>
                    </Pressable>
                    <View className="bg-gray-700 rounded-lg w-10 h-8 items-center justify-center">
                      <Text className="text-white font-bold text-lg">
                        {team1BagsOn}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        setTeam1BagsOn(
                          Math.min(4 - team1BagsIn, team1BagsOn + 1)
                        )
                      }
                      className="bg-green-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="mt-2 pt-2 border-t border-white/20">
                  <Text className="text-gray-400 text-xs text-center">
                    Round: {team1RoundScore}
                  </Text>
                </View>
              </View>
            </View>

            {/* Center Controls */}
            <View className="bg-gray-900 py-3 px-4">
              <View className="flex-row justify-around items-center">
                <Pressable
                  onPress={handleEndRound}
                  className="bg-green-600 px-8 py-3 rounded-full"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text className="text-white font-bold">Enter</Text>
                  </View>
                </Pressable>

                {rounds.length > 0 && (
                  <View className="bg-gray-800 px-4 py-2 rounded-lg">
                    <Text className="text-gray-400 text-xs">Round {currentRound}</Text>
                    <View className="flex-row gap-3 mt-1">
                      <Text className="text-red-400 font-bold">
                        {team1TotalScore}
                      </Text>
                      <Text className="text-gray-600">-</Text>
                      <Text className="text-blue-400 font-bold">
                        {team2TotalScore}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Team 2 Area */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Score Display */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none z-10"
                style={{
                  top: "50%",
                  transform: [{ translateY: isLandscape ? -70 : -100 }],
                }}
              >
                {isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-sm mb-1">
                    {team2Name}
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 100 : 160,
                    textShadowColor: "rgba(59, 130, 246, 0.6)",
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 100 : 160,
                  }}
                >
                  {team2TotalScore}
                </Text>
                {!isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-base mt-1">
                    {team2Name}
                  </Text>
                )}
              </View>

              {/* Bag Counter Overlay - Bottom Right */}
              <View className="absolute top-4 right-4 bg-black/60 rounded-xl p-3 z-20">
                <View className="items-center mb-2">
                  <Text className="text-green-400 text-xs mb-1">IN</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setTeam2BagsIn(Math.max(0, team2BagsIn - 1))}
                      className="bg-red-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">-</Text>
                    </Pressable>
                    <View className="bg-gray-700 rounded-lg w-10 h-8 items-center justify-center">
                      <Text className="text-white font-bold text-lg">
                        {team2BagsIn}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setTeam2BagsIn(Math.min(4, team2BagsIn + 1))}
                      className="bg-green-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="items-center">
                  <Text className="text-blue-400 text-xs mb-1">ON</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setTeam2BagsOn(Math.max(0, team2BagsOn - 1))}
                      className="bg-red-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">-</Text>
                    </Pressable>
                    <View className="bg-gray-700 rounded-lg w-10 h-8 items-center justify-center">
                      <Text className="text-white font-bold text-lg">
                        {team2BagsOn}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        setTeam2BagsOn(
                          Math.min(4 - team2BagsIn, team2BagsOn + 1)
                        )
                      }
                      className="bg-green-600/80 rounded-lg w-8 h-8 items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="mt-2 pt-2 border-t border-white/20">
                  <Text className="text-gray-400 text-xs text-center">
                    Round: {team2RoundScore}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Game Over Modal */}
      <Modal visible={showGameOver} animationType="fade" transparent>
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(500)}
            className="bg-white/10 rounded-3xl p-8 border border-white/20 w-full max-w-md"
          >
            <Text className="text-white text-3xl font-bold text-center mb-6">
              Game Over!
            </Text>
            <View className="mb-8">
              <Text className="text-gray-400 text-center mb-2">Winner</Text>
              <Text className="text-green-500 text-2xl font-bold text-center">
                {displayTeam1Score > displayTeam2Score ? team1Name : team2Name}
              </Text>
            </View>
            <View className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <View className="flex-row justify-between mb-3">
                <Text className="text-white">{team1Name}</Text>
                <Text className="text-white font-bold text-xl">
                  {displayTeam1Score}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white">{team2Name}</Text>
                <Text className="text-white font-bold text-xl">
                  {displayTeam2Score}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleFinishGame}
              className="bg-green-600 rounded-xl p-5"
            >
              <Text className="text-white text-center text-lg font-bold">
                Finish & Save
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
