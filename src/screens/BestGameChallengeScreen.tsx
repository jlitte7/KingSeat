import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { usePracticeStore, GhostRound } from "../state/practice-store";
import { useTossSeriesStore } from "../state/toss-series-store";

export default function BestGameChallengeScreen() {
  const navigation = useNavigation();
  const createChallenge = usePracticeStore((s) => s.createBestGameChallenge);
  const addRound = usePracticeStore((s) => s.addBestGameRound);
  const completeChallenge = usePracticeStore((s) => s.completeBestGameChallenge);
  const games = useTossSeriesStore((s) => s.games);
  const players = useTossSeriesStore((s) => s.players);

  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [bestGameData, setBestGameData] = useState<{
    avgBagsIn: number;
    avgBagsOn: number;
    avgPPR: number;
  } | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [noBestGame, setNoBestGame] = useState(false);

  const [playerIn, setPlayerIn] = useState("");
  const [playerOn, setPlayerOn] = useState("");

  useEffect(() => {
    // Calculate best game stats from all completed games
    const completedGames = games.filter((g) => g.completed);

    if (completedGames.length === 0) {
      setNoBestGame(true);
      return;
    }

    // Find the game with best performance
    let bestGame = completedGames[0];
    let bestPPR = 0;

    completedGames.forEach((game) => {
      if (game.rounds.length === 0) return;

      // Try both players
      const p1PPR = game.player1Score / game.rounds.length;
      const p2PPR = game.player2Score / game.rounds.length;

      if (p1PPR > bestPPR) {
        bestPPR = p1PPR;
        bestGame = game;
      }
      if (p2PPR > bestPPR) {
        bestPPR = p2PPR;
        bestGame = game;
      }
    });

    if (bestGame && bestGame.rounds.length > 0) {
      // Determine which player had better PPR
      const p1PPR = bestGame.player1Score / bestGame.rounds.length;
      const p2PPR = bestGame.player2Score / bestGame.rounds.length;
      const isPlayer1 = p1PPR >= p2PPR;

      const totalBagsIn = bestGame.rounds.reduce(
        (sum, r) => sum + (isPlayer1 ? r.p1In : r.p2In),
        0
      );
      const totalBagsOn = bestGame.rounds.reduce(
        (sum, r) => sum + (isPlayer1 ? r.p1On : r.p2On),
        0
      );

      const data = {
        avgBagsIn: totalBagsIn / bestGame.rounds.length,
        avgBagsOn: totalBagsOn / bestGame.rounds.length,
        avgPPR: isPlayer1 ? p1PPR : p2PPR,
      };

      setBestGameData(data);
      setNoBestGame(false);
    } else {
      setNoBestGame(true);
    }
  }, [games]);

  const startChallenge = () => {
    if (!bestGameData) return;

    const challenge = createChallenge(bestGameData);
    setChallengeId(challenge.id);
    setGameStarted(true);
    setPlayerScore(0);
    setBestScore(0);
    setCurrentRound(1);
  };

  const generateBestGameThrow = (): { bagsIn: number; bagsOn: number } => {
    if (!bestGameData) return { bagsIn: 0, bagsOn: 0 };

    // Simulate based on best game averages with some variance
    const variance = 0.3;
    let bagsIn = 0;
    let bagsOn = 0;

    for (let i = 0; i < 4; i++) {
      const inChance = (bestGameData.avgBagsIn / 4) * (1 + (Math.random() - 0.5) * variance);
      const onChance = (bestGameData.avgBagsOn / 4) * (1 + (Math.random() - 0.5) * variance);

      const roll = Math.random();
      if (roll < inChance) {
        bagsIn++;
      } else if (roll < inChance + onChance) {
        bagsOn++;
      }
    }

    return { bagsIn, bagsOn };
  };

  const submitRound = () => {
    if (!challengeId) return;

    const pIn = parseInt(playerIn) || 0;
    const pOn = parseInt(playerOn) || 0;

    if (pIn < 0 || pIn > 4 || pOn < 0 || pOn > 4 || pIn + pOn > 4) {
      return;
    }

    const best = generateBestGameThrow();

    const playerPoints = pIn * 3 + pOn * 1;
    const bestPoints = best.bagsIn * 3 + best.bagsOn * 1;
    const pScore = Math.max(0, playerPoints - bestPoints);
    const bScore = Math.max(0, bestPoints - playerPoints);

    const round: GhostRound = {
      roundNumber: currentRound,
      playerIn: pIn,
      playerOn: pOn,
      playerScore: pScore,
      ghostIn: best.bagsIn,
      ghostOn: best.bagsOn,
      ghostScore: bScore,
    };

    addRound(challengeId, round);

    const newPlayerScore = playerScore + pScore;
    const newBestScore = bestScore + bScore;

    setPlayerScore(newPlayerScore);
    setBestScore(newBestScore);

    if (newPlayerScore >= 21 || newBestScore >= 21) {
      const winner = newPlayerScore >= 21 ? "player" : "best";
      completeChallenge(challengeId, winner);
      setGameStarted(false);
    } else {
      setCurrentRound(currentRound + 1);
    }

    setPlayerIn("");
    setPlayerOn("");
    setShowScoreModal(false);
    Keyboard.dismiss();
  };

  const quitChallenge = () => {
    if (challengeId) {
      const winner = bestScore > playerScore ? "best" : "player";
      completeChallenge(challengeId, winner);
    }
    setGameStarted(false);
    setChallengeId(null);
  };

  const playerPPR =
    currentRound > 1 ? (playerScore / (currentRound - 1)).toFixed(1) : "0.0";
  const bestPPR = bestGameData ? bestGameData.avgPPR.toFixed(1) : "0.0";

  if (noBestGame) {
    return (
      <View className="flex-1 bg-gray-950">
        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">
              Best Game Challenge
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="star-outline" size={80} color="#6b7280" />
            <Text className="text-white text-2xl font-bold text-center mt-6 mb-3">
              No Games Yet
            </Text>
            <Text className="text-gray-400 text-center leading-6">
              Play some games in Scoreboard mode first to establish your best
              game performance. Then come back to challenge yourself!
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-950">
        <SafeAreaView edges={["top"]} className="flex-1">
          {/* Header */}
          <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
            <View className="flex-row items-center">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Text className="text-white text-xl font-bold">
                Best Game Challenge
              </Text>
            </View>
            {gameStarted && (
              <Pressable onPress={quitChallenge}>
                <Text className="text-red-500 font-semibold">Quit</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {!gameStarted ? (
              /* Start Screen */
              <View className="flex-1 px-4 py-6">
                <View className="items-center mb-8 mt-4">
                  <View className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full w-32 h-32 items-center justify-center mb-6">
                    <Ionicons name="star" size={64} color="#fff" />
                  </View>
                  <Text className="text-white text-3xl font-bold text-center mb-4">
                    Beat Your Best
                  </Text>
                  <Text className="text-gray-400 text-center leading-6 px-4">
                    Challenge yourself against your personal best game
                    performance. Can you beat it?
                  </Text>
                </View>

                {/* Best Game Stats */}
                {bestGameData && (
                  <View className="bg-gray-800 rounded-2xl p-6 mb-6">
                    <Text className="text-yellow-500 font-bold text-lg mb-4 text-center">
                      Your Best Performance
                    </Text>
                    <View className="flex-row justify-around">
                      <View className="items-center">
                        <Text className="text-gray-400 text-sm mb-1">
                          Avg Bags In
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                          {bestGameData.avgBagsIn.toFixed(1)}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-gray-400 text-sm mb-1">
                          Avg Bags On
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                          {bestGameData.avgBagsOn.toFixed(1)}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-gray-400 text-sm mb-1">
                          Avg PPR
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                          {bestGameData.avgPPR.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <Pressable
                  onPress={startChallenge}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 py-6 rounded-2xl items-center"
                >
                  <Text className="text-white text-xl font-bold">
                    Start Challenge
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* Active Game */
              <View className="flex-1 px-4 py-6">
                {/* Scores */}
                <View className="flex-row gap-3 mb-6">
                  <View className="flex-1 bg-blue-600 rounded-2xl p-6">
                    <Text className="text-blue-200 text-sm mb-1">
                      Current You
                    </Text>
                    <Text className="text-white text-5xl font-bold">
                      {playerScore}
                    </Text>
                    <Text className="text-blue-200 text-xs mt-2">
                      {playerPPR} PPR
                    </Text>
                  </View>
                  <View className="flex-1 bg-yellow-600 rounded-2xl p-6">
                    <Text className="text-yellow-200 text-sm mb-1">
                      Best You
                    </Text>
                    <Text className="text-white text-5xl font-bold">
                      {bestScore}
                    </Text>
                    <Text className="text-yellow-200 text-xs mt-2">
                      {bestPPR} PPR
                    </Text>
                  </View>
                </View>

                {/* Round Info */}
                <View className="bg-gray-800 rounded-xl p-4 mb-6">
                  <Text className="text-gray-400 text-sm text-center">
                    Round {currentRound}
                  </Text>
                  <Text className="text-white text-2xl font-bold text-center mt-1">
                    Your Turn
                  </Text>
                </View>

                {/* Enter Score Button */}
                <Pressable
                  onPress={() => setShowScoreModal(true)}
                  className="bg-yellow-600 py-6 rounded-2xl items-center mb-4"
                >
                  <Ionicons name="add-circle" size={48} color="#fff" />
                  <Text className="text-white text-xl font-bold mt-2">
                    Enter Your Score
                  </Text>
                </Pressable>

                {/* Info */}
                <View className="bg-gray-800/50 rounded-xl p-4">
                  <Text className="text-gray-400 text-sm text-center leading-5">
                    You are playing against a simulation of your best game. Can
                    you outperform yourself?
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Score Input Modal */}
          <Modal
            visible={showScoreModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowScoreModal(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowScoreModal(false)}>
              <View className="flex-1 bg-black/70 justify-end">
                <TouchableWithoutFeedback>
                  <View className="bg-gray-900 rounded-t-3xl p-6">
                    <Text className="text-white text-2xl font-bold mb-6 text-center">
                      Round {currentRound}
                    </Text>

                    <View className="mb-6">
                      <Text className="text-gray-400 mb-2">Bags In (3 pts)</Text>
                      <TextInput
                        value={playerIn}
                        onChangeText={setPlayerIn}
                        keyboardType="number-pad"
                        placeholder="0-4"
                        placeholderTextColor="#6b7280"
                        className="bg-gray-800 text-white text-2xl font-bold p-4 rounded-xl text-center"
                        maxLength={1}
                      />
                    </View>

                    <View className="mb-6">
                      <Text className="text-gray-400 mb-2">Bags On (1 pt)</Text>
                      <TextInput
                        value={playerOn}
                        onChangeText={setPlayerOn}
                        keyboardType="number-pad"
                        placeholder="0-4"
                        placeholderTextColor="#6b7280"
                        className="bg-gray-800 text-white text-2xl font-bold p-4 rounded-xl text-center"
                        maxLength={1}
                      />
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setShowScoreModal(false)}
                        className="flex-1 bg-gray-700 py-4 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Cancel
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={submitRound}
                        className="flex-1 bg-yellow-600 py-4 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Submit
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
