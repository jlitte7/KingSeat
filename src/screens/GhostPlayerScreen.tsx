import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

type Difficulty = "easy" | "medium" | "hard" | "pro";

interface DifficultyConfig {
  name: string;
  description: string;
  avgBagsIn: number;
  avgBagsOn: number;
  color1: string;
  color2: string;
}

const difficultySettings: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: "Beginner",
    description: "New to cornhole - ~1 PPR",
    avgBagsIn: 0.3,
    avgBagsOn: 1.5,
    color1: "#34d399",
    color2: "#10b981",
  },
  medium: {
    name: "Intermediate",
    description: "Average player - ~2.5 PPR",
    avgBagsIn: 0.8,
    avgBagsOn: 1.0,
    color1: "#fbbf24",
    color2: "#f59e0b",
  },
  hard: {
    name: "Advanced",
    description: "Strong player - ~4 PPR",
    avgBagsIn: 1.3,
    avgBagsOn: 0.9,
    color1: "#f97316",
    color2: "#ea580c",
  },
  pro: {
    name: "Pro",
    description: "Expert level - ~6 PPR",
    avgBagsIn: 2.0,
    avgBagsOn: 0.5,
    color1: "#dc2626",
    color2: "#b91c1c",
  },
};

export default function GhostPlayerScreen() {
  const navigation = useNavigation();
  const createGame = usePracticeStore((s) => s.createGhostPlayerGame);
  const addRound = usePracticeStore((s) => s.addGhostRound);
  const completeGame = usePracticeStore((s) => s.completeGhostGame);

  const [gameId, setGameId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Input states
  const [playerIn, setPlayerIn] = useState("");
  const [playerOn, setPlayerOn] = useState("");

  const startGame = (selectedDifficulty: Difficulty) => {
    const game = createGame(selectedDifficulty);
    setGameId(game.id);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setPlayerScore(0);
    setGhostScore(0);
    setCurrentRound(1);
  };

  const generateGhostThrow = (): { bagsIn: number; bagsOn: number } => {
    if (!difficulty) return { bagsIn: 0, bagsOn: 0 };

    const config = difficultySettings[difficulty];
    let bagsIn = 0;
    let bagsOn = 0;

    // Simulate 4 bags with some randomness
    for (let i = 0; i < 4; i++) {
      const inChance = config.avgBagsIn / 4;
      const onChance = config.avgBagsOn / 4;

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
    if (!gameId) return;

    const pIn = parseInt(playerIn) || 0;
    const pOn = parseInt(playerOn) || 0;

    // Validate input
    if (pIn < 0 || pIn > 4 || pOn < 0 || pOn > 4 || pIn + pOn > 4) {
      return;
    }

    const ghost = generateGhostThrow();

    // Calculate cancellation scoring
    const playerPoints = pIn * 3 + pOn * 1;
    const ghostPoints = ghost.bagsIn * 3 + ghost.bagsOn * 1;
    const pScore = Math.max(0, playerPoints - ghostPoints);
    const gScore = Math.max(0, ghostPoints - playerPoints);

    const round: GhostRound = {
      roundNumber: currentRound,
      playerIn: pIn,
      playerOn: pOn,
      playerScore: pScore,
      ghostIn: ghost.bagsIn,
      ghostOn: ghost.bagsOn,
      ghostScore: gScore,
    };

    addRound(gameId, round);

    const newPlayerScore = playerScore + pScore;
    const newGhostScore = ghostScore + gScore;

    setPlayerScore(newPlayerScore);
    setGhostScore(newGhostScore);

    // Check for winner
    if (newPlayerScore >= 21 || newGhostScore >= 21) {
      const winner = newPlayerScore >= 21 ? "player" : "ghost";
      completeGame(gameId, winner);
      setGameStarted(false);
    } else {
      setCurrentRound(currentRound + 1);
    }

    // Reset inputs
    setPlayerIn("");
    setPlayerOn("");
    setShowScoreModal(false);
    Keyboard.dismiss();
  };

  const quitGame = () => {
    if (gameId) {
      const winner = ghostScore > playerScore ? "ghost" : "player";
      completeGame(gameId, winner);
    }
    setGameStarted(false);
    setGameId(null);
    setDifficulty(null);
  };

  const playerPPR =
    currentRound > 1 ? (playerScore / (currentRound - 1)).toFixed(1) : "0.0";
  const ghostPPR =
    currentRound > 1 ? (ghostScore / (currentRound - 1)).toFixed(1) : "0.0";

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
              <Text className="text-white text-xl font-bold">Ghost Player</Text>
            </View>
            {gameStarted && (
              <Pressable onPress={quitGame}>
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
              /* Difficulty Selection */
              <View className="flex-1 px-4 py-6">
                <Text className="text-white text-2xl font-bold mb-2">
                  Select Difficulty
                </Text>
                <Text className="text-gray-400 mb-6">
                  Choose your opponent level
                </Text>

                {(Object.keys(difficultySettings) as Difficulty[]).map(
                  (diff) => {
                    const config = difficultySettings[diff];
                    return (
                      <Pressable
                        key={diff}
                        onPress={() => startGame(diff)}
                        className="mb-3"
                      >
                        <LinearGradient
                          colors={[config.color1, config.color2]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            borderRadius: 16,
                            padding: 20,
                          }}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="text-white text-2xl font-bold mb-1">
                                {config.name}
                              </Text>
                              <Text className="text-white text-sm opacity-90 mb-2">
                                {config.description}
                              </Text>
                              <Text className="text-white text-xs opacity-75">
                                Avg: {config.avgBagsIn.toFixed(1)} in /{" "}
                                {config.avgBagsOn.toFixed(1)} on per round
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={28}
                              color="#fff"
                            />
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  }
                )}
              </View>
            ) : (
              /* Active Game */
              <View className="flex-1 px-4 py-6">
                {/* Scores */}
                <View className="flex-row gap-3 mb-6">
                  <View className="flex-1 bg-blue-600 rounded-2xl p-6">
                    <Text className="text-blue-200 text-sm mb-1">You</Text>
                    <Text className="text-white text-5xl font-bold">
                      {playerScore}
                    </Text>
                    <Text className="text-blue-200 text-xs mt-2">
                      {playerPPR} PPR
                    </Text>
                  </View>
                  <View className="flex-1 bg-red-600 rounded-2xl p-6">
                    <Text className="text-red-200 text-sm mb-1">
                      Ghost {difficulty && `(${difficultySettings[difficulty].name})`}
                    </Text>
                    <Text className="text-white text-5xl font-bold">
                      {ghostScore}
                    </Text>
                    <Text className="text-red-200 text-xs mt-2">
                      {ghostPPR} PPR
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
                  className="bg-purple-600 py-6 rounded-2xl items-center mb-4"
                >
                  <Ionicons name="add-circle" size={48} color="#fff" />
                  <Text className="text-white text-xl font-bold mt-2">
                    Enter Your Score
                  </Text>
                </Pressable>

                {/* Info */}
                <View className="bg-gray-800/50 rounded-xl p-4">
                  <Text className="text-gray-400 text-sm text-center leading-5">
                    Enter how many bags you got in and on the board. The ghost
                    will automatically play based on the selected difficulty.
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
                        className="flex-1 bg-purple-600 py-4 rounded-xl"
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
