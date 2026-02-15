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
  const recordBracketResult = useTournamentStore(
    (s) => s.recordBracketResult
  );

  // Try to find match in either round robin or bracket matches
  const roundRobinMatch = tournament?.roundRobinMatches.find((m) => m.id === matchId);
  const bracketMatch = tournament?.bracketMatches.find((m) => m.id === matchId);
  const match = roundRobinMatch || bracketMatch;
  const isBracketMatch = !!bracketMatch;

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

  // Type guard to check if team is valid (not TBD or undefined)
  const isValidTeam = (team: any): team is { player1: any; player2: any } => {
    return team && team !== "TBD" && team.player1 && team.player2;
  };

  if (!isValidTeam(match.team1) || !isValidTeam(match.team2)) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Teams not ready</Text>
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

  const setBagCount = (team: number, type: "in" | "on", value: number) => {
    if (team === 1) {
      if (type === "in") {
        setTeam1BagsIn(Math.min(value, 4 - team1BagsOn));
      } else {
        setTeam1BagsOn(Math.min(value, 4 - team1BagsIn));
      }
    } else {
      if (type === "in") {
        setTeam2BagsIn(Math.min(value, 4 - team2BagsOn));
      } else {
        setTeam2BagsOn(Math.min(value, 4 - team2BagsIn));
      }
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
    if (isBracketMatch) {
      recordBracketResult(
        tournamentId,
        matchId,
        displayTeam1Score,
        displayTeam2Score
      );
    } else {
      recordRoundRobinResult(
        tournamentId,
        matchId,
        displayTeam1Score,
        displayTeam2Score
      );
    }
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

  const BagCounter = ({
    label,
    count,
    onSelect,
    color,
    disabled,
  }: {
    label: string;
    count: number;
    onSelect: (num: number) => void;
    color: string;
    disabled?: (num: number) => boolean;
  }) => (
    <View className="items-center gap-1">
      <Text className={`text-xs font-bold ${color}`}>{label}</Text>
      <View className="gap-0.5">
        {[0, 1, 2, 3, 4].map((num) => (
          <Pressable
            key={num}
            onPress={() => onSelect(num)}
            disabled={disabled && disabled(num)}
            className={`rounded-lg font-bold ${
              isLandscape ? "w-9 h-4" : "w-14 h-12"
            } items-center justify-center ${
              num === count
                ? "bg-gray-900 border-2 border-gray-700"
                : disabled && disabled(num)
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-gray-700 border-2 border-gray-600"
            }`}
          >
            <Text
              className={`font-bold ${isLandscape ? "text-xs" : "text-2xl"} ${
                num === count
                  ? "text-white"
                  : disabled && disabled(num)
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

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
            {/* Team Scores Display */}
            <View className="flex-1 items-center justify-center">
              <View className="flex-row items-center justify-center w-full px-4">
                <View className="flex-1 items-center">
                  {isLandscape && (
                    <Text className="text-red-500 font-bold uppercase tracking-wide text-base mb-2">
                      {team1Name}
                    </Text>
                  )}
                  <View style={{ minWidth: isLandscape ? 200 : 280 }}>
                    <Text
                      className="font-black text-white text-center"
                      style={{
                        fontSize: isLandscape ? 140 : 220,
                        textShadowColor: "rgba(239, 68, 68, 0.6)",
                        textShadowOffset: { width: 0, height: 8 },
                        textShadowRadius: 30,
                        lineHeight: isLandscape ? 140 : 220,
                      }}
                    >
                      {team1TotalScore}
                    </Text>
                  </View>
                  <View className={`h-px bg-red-500 ${isLandscape ? "w-2/3" : "w-3/4"} my-2`} />
                  {!isLandscape && (
                    <Text className="text-red-500 font-bold uppercase tracking-wide text-xl">
                      {team1Name}
                    </Text>
                  )}
                </View>

                <Text className="text-gray-700 font-bold px-4" style={{ fontSize: isLandscape ? 60 : 100 }}>
                  -
                </Text>

                <View className="flex-1 items-center">
                  {isLandscape && (
                    <Text className="text-blue-500 font-bold uppercase tracking-wide text-base mb-2">
                      {team2Name}
                    </Text>
                  )}
                  <View style={{ minWidth: isLandscape ? 200 : 280 }}>
                    <Text
                      className="font-black text-white text-center"
                      style={{
                        fontSize: isLandscape ? 140 : 220,
                        textShadowColor: "rgba(59, 130, 246, 0.6)",
                        textShadowOffset: { width: 0, height: 8 },
                        textShadowRadius: 30,
                        lineHeight: isLandscape ? 140 : 220,
                      }}
                    >
                      {team2TotalScore}
                    </Text>
                  </View>
                  <View className={`h-px bg-blue-500 ${isLandscape ? "w-2/3" : "w-3/4"} my-2`} />
                  {!isLandscape && (
                    <Text className="text-blue-500 font-bold uppercase tracking-wide text-xl">
                      {team2Name}
                    </Text>
                  )}
                </View>
              </View>

              {/* Bag Counters */}
              <View className={`flex-row justify-around w-full max-w-2xl gap-4 px-4 ${isLandscape ? "mt-4" : "mt-8"}`}>
                <View className="items-center gap-1">
                  <Text className={`font-bold text-red-500 ${isLandscape ? "text-xs" : "text-lg"}`}>
                    {team1Name}
                  </Text>
                  <View className="flex-row gap-2">
                    <BagCounter
                      label={isLandscape ? "IN" : "BAGS IN"}
                      count={team1BagsIn}
                      onSelect={(value) => setBagCount(1, "in", value)}
                      disabled={(value) => value > 4 - team1BagsOn}
                      color="text-red-500"
                    />
                    <BagCounter
                      label={isLandscape ? "ON" : "BAGS ON"}
                      count={team1BagsOn}
                      onSelect={(value) => setBagCount(1, "on", value)}
                      disabled={(value) => value > 4 - team1BagsIn}
                      color="text-red-500"
                    />
                  </View>
                </View>

                <View className="items-center gap-1">
                  <Text className={`font-bold text-blue-500 ${isLandscape ? "text-xs" : "text-lg"}`}>
                    {team2Name}
                  </Text>
                  <View className="flex-row gap-2">
                    <BagCounter
                      label={isLandscape ? "IN" : "BAGS IN"}
                      count={team2BagsIn}
                      onSelect={(value) => setBagCount(2, "in", value)}
                      disabled={(value) => value > 4 - team2BagsOn}
                      color="text-blue-500"
                    />
                    <BagCounter
                      label={isLandscape ? "ON" : "BAGS ON"}
                      count={team2BagsOn}
                      onSelect={(value) => setBagCount(2, "on", value)}
                      disabled={(value) => value > 4 - team2BagsIn}
                      color="text-blue-500"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Controls */}
            <View className="bg-gray-900 py-3 px-4">
              <View className="flex-row justify-around items-center">
                <Pressable
                  onPress={() => {
                    setTeam1BagsIn(0);
                    setTeam1BagsOn(0);
                    setTeam2BagsIn(0);
                    setTeam2BagsOn(0);
                  }}
                  className="bg-red-600 px-6 py-3 rounded-full"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text className="text-white font-bold">Cancel</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleEndRound}
                  className="bg-green-600 px-8 py-3 rounded-full"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text className="text-white font-bold">Enter Round</Text>
                  </View>
                </Pressable>
              </View>

              {rounds.length > 0 && (
                <View className="bg-gray-800 px-4 py-2 rounded-lg mt-3 items-center">
                  <Text className="text-gray-400 text-xs">Score</Text>
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
