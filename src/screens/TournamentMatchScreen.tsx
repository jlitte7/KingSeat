import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
  FadeInUp,
  ZoomIn,
  RotateInDownLeft,
  RotateInDownRight,
  BounceIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
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

  const [showScoring, setShowScoring] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [showGameOver, setShowGameOver] = useState(false);

  const [team1BagsIn, setTeam1BagsIn] = useState(0);
  const [team1BagsOn, setTeam1BagsOn] = useState(0);
  const [team2BagsIn, setTeam2BagsIn] = useState(0);
  const [team2BagsOn, setTeam2BagsOn] = useState(0);

  const [rounds, setRounds] = useState<Round[]>([]);

  const team1RoundScore = team1BagsIn * 3 + team1BagsOn;
  const team2RoundScore = team2BagsIn * 3 + team2BagsOn;
  const roundDiff = Math.abs(team1RoundScore - team2RoundScore);
  const team1RoundPoints = team1RoundScore > team2RoundScore ? roundDiff : 0;
  const team2RoundPoints = team2RoundScore > team1RoundScore ? roundDiff : 0;

  const team1TotalScore = rounds.reduce((sum, r) => sum + r.team1Score, 0);
  const team2TotalScore = rounds.reduce((sum, r) => sum + r.team2Score, 0);

  const gameWon = team1TotalScore >= 21 || team2TotalScore >= 21;

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

  const handleEndRound = () => {
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
    setShowScoring(false);
  };

  const handleFinishGame = () => {
    recordRoundRobinResult(
      tournamentId,
      matchId,
      team1TotalScore,
      team2TotalScore
    );
    navigation.goBack();
  };

  const handleUndoLastRound = () => {
    if (rounds.length > 0) {
      setRounds(rounds.slice(0, -1));
      setCurrentRound(currentRound - 1);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-white/10 flex-row items-center justify-between">
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-lg font-bold">
              Round {currentRound}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1">
            {/* Scoreboard */}
            <View className="px-6 py-8">
              {/* Team 1 */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">{team1Name}</Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-6xl font-bold ${
                      team1TotalScore > team2TotalScore
                        ? "text-green-500"
                        : "text-white"
                    }`}
                  >
                    {team1TotalScore}
                  </Text>
                  <Pressable
                    onPress={() => setShowScoring(true)}
                    className="bg-purple-600 rounded-xl px-6 py-3"
                  >
                    <Text className="text-white font-bold">Score Round</Text>
                  </Pressable>
                </View>
              </View>

              {/* VS Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-gray-400 mx-4">VS</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Team 2 */}
              <View className="mt-6">
                <Text className="text-gray-400 text-sm mb-2">{team2Name}</Text>
                <Text
                  className={`text-6xl font-bold ${
                    team2TotalScore > team1TotalScore
                      ? "text-green-500"
                      : "text-white"
                  }`}
                >
                  {team2TotalScore}
                </Text>
              </View>
            </View>

            {/* Round History */}
            {rounds.length > 0 && (
              <View className="px-6 py-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white text-lg font-bold">
                    Round History
                  </Text>
                  {rounds.length > 0 && (
                    <Pressable onPress={handleUndoLastRound}>
                      <Text className="text-red-500 font-bold">Undo Last</Text>
                    </Pressable>
                  )}
                </View>
                {rounds.map((round, index) => (
                  <View
                    key={index}
                    className="bg-white/5 rounded-xl p-4 mb-2 border border-white/10"
                  >
                    <Text className="text-gray-400 text-xs mb-2">
                      Round {index + 1}
                    </Text>
                    <View className="flex-row justify-between">
                      <View className="flex-1">
                        <Text className="text-white text-sm">
                          {round.team1In}🎯 {round.team1On}📍
                        </Text>
                        <Text className="text-green-500 font-bold text-lg">
                          +{round.team1Score}
                        </Text>
                      </View>
                      <View className="flex-1 items-end">
                        <Text className="text-white text-sm">
                          {round.team2In}🎯 {round.team2On}📍
                        </Text>
                        <Text className="text-green-500 font-bold text-lg">
                          +{round.team2Score}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Scoring Modal */}
      <Modal visible={showScoring} animationType="slide" transparent>
        <View className="flex-1 bg-black/90">
          <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 px-6 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-2xl font-bold">
                  Round {currentRound}
                </Text>
                <Pressable onPress={() => setShowScoring(false)}>
                  <Ionicons name="close" size={32} color="#fff" />
                </Pressable>
              </View>

              <ScrollView className="flex-1">
                {/* Team 1 Scoring */}
                <View className="mb-8">
                  <Text className="text-white text-lg font-bold mb-4">
                    {team1Name}
                  </Text>
                  <View className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-white text-lg">Bags In</Text>
                      <View className="flex-row items-center gap-4">
                        <Pressable
                          onPress={() =>
                            setTeam1BagsIn(Math.max(0, team1BagsIn - 1))
                          }
                          className="bg-red-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            -
                          </Text>
                        </Pressable>
                        <Text className="text-white text-3xl font-bold w-12 text-center">
                          {team1BagsIn}
                        </Text>
                        <Pressable
                          onPress={() =>
                            setTeam1BagsIn(Math.min(4, team1BagsIn + 1))
                          }
                          className="bg-green-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            +
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-lg">Bags On</Text>
                      <View className="flex-row items-center gap-4">
                        <Pressable
                          onPress={() =>
                            setTeam1BagsOn(Math.max(0, team1BagsOn - 1))
                          }
                          className="bg-red-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            -
                          </Text>
                        </Pressable>
                        <Text className="text-white text-3xl font-bold w-12 text-center">
                          {team1BagsOn}
                        </Text>
                        <Pressable
                          onPress={() =>
                            setTeam1BagsOn(
                              Math.min(4 - team1BagsIn, team1BagsOn + 1)
                            )
                          }
                          className="bg-green-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            +
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="mt-4 pt-4 border-t border-white/10">
                      <Text className="text-gray-400 text-sm">
                        Round Score:{" "}
                        <Text className="text-white font-bold text-lg">
                          {team1RoundScore}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Team 2 Scoring */}
                <View className="mb-8">
                  <Text className="text-white text-lg font-bold mb-4">
                    {team2Name}
                  </Text>
                  <View className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-white text-lg">Bags In</Text>
                      <View className="flex-row items-center gap-4">
                        <Pressable
                          onPress={() =>
                            setTeam2BagsIn(Math.max(0, team2BagsIn - 1))
                          }
                          className="bg-red-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            -
                          </Text>
                        </Pressable>
                        <Text className="text-white text-3xl font-bold w-12 text-center">
                          {team2BagsIn}
                        </Text>
                        <Pressable
                          onPress={() =>
                            setTeam2BagsIn(Math.min(4, team2BagsIn + 1))
                          }
                          className="bg-green-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            +
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-lg">Bags On</Text>
                      <View className="flex-row items-center gap-4">
                        <Pressable
                          onPress={() =>
                            setTeam2BagsOn(Math.max(0, team2BagsOn - 1))
                          }
                          className="bg-red-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            -
                          </Text>
                        </Pressable>
                        <Text className="text-white text-3xl font-bold w-12 text-center">
                          {team2BagsOn}
                        </Text>
                        <Pressable
                          onPress={() =>
                            setTeam2BagsOn(
                              Math.min(4 - team2BagsIn, team2BagsOn + 1)
                            )
                          }
                          className="bg-green-600 rounded-full w-12 h-12 items-center justify-center"
                        >
                          <Text className="text-white text-2xl font-bold">
                            +
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="mt-4 pt-4 border-t border-white/10">
                      <Text className="text-gray-400 text-sm">
                        Round Score:{" "}
                        <Text className="text-white font-bold text-lg">
                          {team2RoundScore}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Round Points Preview */}
                <View className="bg-purple-600/20 rounded-xl p-6 border border-purple-600/50 mb-6">
                  <Text className="text-white text-lg font-bold mb-4">
                    Round Points
                  </Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-400 text-sm">
                        {team1Name}
                      </Text>
                      <Text className="text-white text-3xl font-bold">
                        +{team1RoundPoints}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-400 text-sm">
                        {team2Name}
                      </Text>
                      <Text className="text-white text-3xl font-bold">
                        +{team2RoundPoints}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* End Round Button */}
                <Pressable
                  onPress={handleEndRound}
                  className="bg-green-600 rounded-xl p-5 mb-4"
                >
                  <Text className="text-white text-center text-lg font-bold">
                    End Round
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

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
                {team1TotalScore > team2TotalScore ? team1Name : team2Name}
              </Text>
            </View>
            <View className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <View className="flex-row justify-between mb-3">
                <Text className="text-white">{team1Name}</Text>
                <Text className="text-white font-bold text-xl">
                  {team1TotalScore}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white">{team2Name}</Text>
                <Text className="text-white font-bold text-xl">
                  {team2TotalScore}
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
