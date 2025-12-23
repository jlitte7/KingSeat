import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
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
    name: "Ghost Easy (1-3)",
    description: "New to cornhole",
    avgBagsIn: 0.5,   // ~1.5 pts from ins
    avgBagsOn: 1.0,   // ~1 pt from ons = ~2.5 PPR avg
    color1: "#34d399",
    color2: "#10b981",
  },
  medium: {
    name: "Ghost Medium (4-6)",
    description: "Average player",
    avgBagsIn: 1.2,   // ~3.6 pts from ins
    avgBagsOn: 1.5,   // ~1.5 pts from ons = ~5 PPR avg
    color1: "#fbbf24",
    color2: "#f59e0b",
  },
  hard: {
    name: "Ghost Hard (7-9)",
    description: "Strong player",
    avgBagsIn: 2.2,   // ~6.6 pts from ins
    avgBagsOn: 1.5,   // ~1.5 pts from ons = ~8 PPR avg
    color1: "#f97316",
    color2: "#ea580c",
  },
  pro: {
    name: "Ghost Expert (10-12)",
    description: "Expert level",
    avgBagsIn: 3.2,   // ~9.6 pts from ins
    avgBagsOn: 0.8,   // ~0.8 pts from ons + remaining = ~11 PPR avg
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
  const [showScoring, setShowScoring] = useState(false);
  const [showGhostResult, setShowGhostResult] = useState(false);
  const [lastGhostThrow, setLastGhostThrow] = useState<{ bagsIn: number; bagsOn: number } | null>(null);
  const [lastRoundResult, setLastRoundResult] = useState<{ playerPoints: number; ghostPoints: number } | null>(null);

  // Bag counter states
  const [playerIn, setPlayerIn] = useState(0);
  const [playerOn, setPlayerOn] = useState(0);

  // Track raw points for PPR calculation (before cancellation)
  const [playerRawPoints, setPlayerRawPoints] = useState(0);
  const [ghostRawPoints, setGhostRawPoints] = useState(0);

  // Track rounds for display
  const [roundHistory, setRoundHistory] = useState<GhostRound[]>([]);

  const startGame = (selectedDifficulty: Difficulty) => {
    const game = createGame(selectedDifficulty);
    setGameId(game.id);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setPlayerScore(0);
    setGhostScore(0);
    setPlayerRawPoints(0);
    setGhostRawPoints(0);
    setRoundHistory([]);
    setCurrentRound(1);
  };

  const generateGhostThrow = (): { bagsIn: number; bagsOn: number } => {
    if (!difficulty) return { bagsIn: 0, bagsOn: 0 };

    const config = difficultySettings[difficulty];

    // Target average raw points per round based on difficulty:
    // easy: 1-3 PPR, medium: 4-6 PPR, hard: 7-9 PPR, pro: 10-12 PPR
    // Use weighted random to achieve target averages

    let bagsIn = 0;
    let bagsOn = 0;

    // Simulate 4 bags with probabilities tuned to hit target PPR ranges
    for (let i = 0; i < 4; i++) {
      const remainingBags = 4 - bagsIn - bagsOn;
      if (remainingBags <= 0) break;

      const roll = Math.random();
      // inChance: probability of this bag going in the hole
      // onChance: probability of this bag landing on the board
      const inChance = config.avgBagsIn / 4;
      const onChance = config.avgBagsOn / 4;

      if (roll < inChance) {
        bagsIn++;
      } else if (roll < inChance + onChance) {
        bagsOn++;
      }
      // else: bag misses
    }

    return { bagsIn, bagsOn };
  };

  const setBagCount = (type: 'in' | 'on', value: number) => {
    if (type === 'in') {
      setPlayerIn(Math.min(value, 4 - playerOn));
    } else {
      setPlayerOn(Math.min(value, 4 - playerIn));
    }
  };

  const submitRound = () => {
    if (!gameId) return;

    const ghost = generateGhostThrow();

    // Calculate raw points (before cancellation) for PPR
    const playerRawPts = playerIn * 3 + playerOn * 1;
    const ghostRawPts = ghost.bagsIn * 3 + ghost.bagsOn * 1;

    // Calculate cancellation scoring for game score
    const pScore = Math.max(0, playerRawPts - ghostRawPts);
    const gScore = Math.max(0, ghostRawPts - playerRawPts);

    const round: GhostRound = {
      roundNumber: currentRound,
      playerIn: playerIn,
      playerOn: playerOn,
      playerScore: pScore,
      ghostIn: ghost.bagsIn,
      ghostOn: ghost.bagsOn,
      ghostScore: gScore,
    };

    addRound(gameId, round);
    setRoundHistory((prev) => [...prev, round]);

    const newPlayerScore = playerScore + pScore;
    const newGhostScore = ghostScore + gScore;
    const newPlayerRawPoints = playerRawPoints + playerRawPts;
    const newGhostRawPoints = ghostRawPoints + ghostRawPts;

    setPlayerScore(newPlayerScore);
    setGhostScore(newGhostScore);
    setPlayerRawPoints(newPlayerRawPoints);
    setGhostRawPoints(newGhostRawPoints);
    setLastGhostThrow(ghost);
    setLastRoundResult({ playerPoints: pScore, ghostPoints: gScore });

    // Show ghost result
    setShowScoring(false);
    setShowGhostResult(true);

    // Check for winner after showing result
    setTimeout(() => {
      setShowGhostResult(false);

      if (newPlayerScore >= 21 || newGhostScore >= 21) {
        const winner = newPlayerScore >= 21 ? "player" : "ghost";
        completeGame(gameId, winner);
        setGameStarted(false);
      } else {
        setCurrentRound(currentRound + 1);
      }

      // Reset inputs
      setPlayerIn(0);
      setPlayerOn(0);
    }, 3000);
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

  // PPR = raw points per round (before cancellation scoring)
  // Number of completed rounds = currentRound - 1 (since currentRound is the upcoming round)
  const completedRounds = currentRound - 1;
  const playerPPR = completedRounds > 0 ? (playerRawPoints / completedRounds).toFixed(1) : "0.0";
  const ghostPPR = completedRounds > 0 ? (ghostRawPoints / completedRounds).toFixed(1) : "0.0";

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
                              <Text className="text-white text-sm opacity-90">
                                {config.description}
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
                      {difficulty && difficultySettings[difficulty].name}
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

                {/* Ghost Result Display */}
                {showGhostResult && lastGhostThrow && lastRoundResult ? (
                  <View className="bg-gray-800 rounded-2xl p-6 mb-4 border-2 border-red-600">
                    <Text className="text-white text-lg font-bold mb-4 text-center">
                      Ghost Threw
                    </Text>
                    <View className="flex-row justify-center gap-8 mb-4">
                      <View className="items-center">
                        <Text className="text-red-400 text-sm mb-2">IN</Text>
                        <View className="bg-red-600 rounded-full w-16 h-16 items-center justify-center">
                          <Text className="text-white text-3xl font-bold">{lastGhostThrow.bagsIn}</Text>
                        </View>
                      </View>
                      <View className="items-center">
                        <Text className="text-red-400 text-sm mb-2">ON</Text>
                        <View className="bg-red-600 rounded-full w-16 h-16 items-center justify-center">
                          <Text className="text-white text-3xl font-bold">{lastGhostThrow.bagsOn}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="border-t border-gray-700 pt-4">
                      <Text className="text-gray-400 text-sm text-center mb-2">Round Points</Text>
                      <View className="flex-row justify-center gap-6">
                        <View className="items-center">
                          <Text className="text-blue-400 text-xs mb-1">You</Text>
                          <Text className="text-white text-2xl font-bold">{lastRoundResult.playerPoints}</Text>
                        </View>
                        <Text className="text-gray-600 text-2xl font-bold">-</Text>
                        <View className="items-center">
                          <Text className="text-red-400 text-xs mb-1">Ghost</Text>
                          <Text className="text-white text-2xl font-bold">{lastRoundResult.ghostPoints}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* Enter Score Button */}
                {!showScoring && !showGhostResult && (
                  <Pressable
                    onPress={() => setShowScoring(true)}
                    className="bg-purple-600 py-6 rounded-2xl items-center mb-4"
                  >
                    <Ionicons name="add-circle" size={48} color="#fff" />
                    <Text className="text-white text-xl font-bold mt-2">
                      Enter Your Score
                    </Text>
                  </Pressable>
                )}

                {/* Scoring Input */}
                {showScoring && (
                  <View className="bg-gray-800 rounded-2xl p-6 mb-4">
                    <Text className="text-white text-lg font-bold mb-4 text-center">
                      Your Bags - Round {currentRound}
                    </Text>
                    <View className="flex-row justify-center gap-6 mb-6">
                      <BagCounter
                        label="BAGS IN"
                        count={playerIn}
                        onSelect={(value) => setBagCount('in', value)}
                        disabled={(value) => value > 4 - playerOn}
                        color="text-blue-400"
                      />
                      <BagCounter
                        label="BAGS ON"
                        count={playerOn}
                        onSelect={(value) => setBagCount('on', value)}
                        disabled={(value) => value > 4 - playerIn}
                        color="text-blue-400"
                      />
                    </View>
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => {
                          setPlayerIn(0);
                          setPlayerOn(0);
                          setShowScoring(false);
                        }}
                        className="flex-1 bg-red-600 py-3 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Cancel
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={submitRound}
                        className="flex-1 bg-purple-600 py-3 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Submit
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Info */}
                {!showScoring && !showGhostResult && (
                  <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
                    <Text className="text-gray-400 text-sm text-center leading-5">
                      Enter how many bags you got in and on the board. The ghost
                      will automatically play based on the selected difficulty.
                    </Text>
                  </View>
                )}

                {/* Round by Round Stats */}
                {roundHistory.length > 0 && !showScoring && !showGhostResult && (
                  <View className="bg-gray-800 rounded-2xl p-4">
                    <Text className="text-white text-lg font-bold mb-3">
                      Round History
                    </Text>

                    {/* Header Row */}
                    <View className="flex-row border-b border-gray-700 pb-2 mb-2">
                      <Text className="text-gray-400 text-xs font-bold w-10">RND</Text>
                      <View className="flex-1 flex-row">
                        <Text className="text-blue-400 text-xs font-bold flex-1 text-center">YOU</Text>
                        <Text className="text-red-400 text-xs font-bold flex-1 text-center">GHOST</Text>
                      </View>
                      <View className="w-16 flex-row">
                        <Text className="text-gray-400 text-xs font-bold flex-1 text-center">PTS</Text>
                      </View>
                    </View>

                    {/* Round Rows */}
                    {roundHistory.map((round, index) => {
                      const playerRaw = round.playerIn * 3 + round.playerOn * 1;
                      const ghostRaw = round.ghostIn * 3 + round.ghostOn * 1;
                      const playerWonRound = round.playerScore > 0;
                      const ghostWonRound = round.ghostScore > 0;

                      return (
                        <View
                          key={index}
                          className={`flex-row py-2 ${
                            index < roundHistory.length - 1 ? "border-b border-gray-700/50" : ""
                          }`}
                        >
                          <Text className="text-gray-500 text-sm font-bold w-10">
                            {round.roundNumber}
                          </Text>
                          <View className="flex-1 flex-row">
                            {/* Player stats */}
                            <View className="flex-1 items-center">
                              <Text className="text-white text-sm">
                                <Text className="text-blue-400">{round.playerIn}</Text>
                                <Text className="text-gray-500"> in </Text>
                                <Text className="text-blue-300">{round.playerOn}</Text>
                                <Text className="text-gray-500"> on</Text>
                              </Text>
                              <Text className="text-gray-500 text-xs">({playerRaw} raw)</Text>
                            </View>
                            {/* Ghost stats */}
                            <View className="flex-1 items-center">
                              <Text className="text-white text-sm">
                                <Text className="text-red-400">{round.ghostIn}</Text>
                                <Text className="text-gray-500"> in </Text>
                                <Text className="text-red-300">{round.ghostOn}</Text>
                                <Text className="text-gray-500"> on</Text>
                              </Text>
                              <Text className="text-gray-500 text-xs">({ghostRaw} raw)</Text>
                            </View>
                          </View>
                          {/* Round points */}
                          <View className="w-16 flex-row items-center justify-center">
                            <Text className={`text-sm font-bold ${playerWonRound ? "text-blue-400" : ghostWonRound ? "text-red-400" : "text-gray-500"}`}>
                              {playerWonRound ? `+${round.playerScore}` : ghostWonRound ? `-${round.ghostScore}` : "0"}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    {/* Summary Row */}
                    <View className="flex-row pt-3 mt-2 border-t border-gray-600">
                      <Text className="text-gray-400 text-xs font-bold w-10">AVG</Text>
                      <View className="flex-1 flex-row">
                        <View className="flex-1 items-center">
                          <Text className="text-blue-400 text-sm font-bold">{playerPPR} PPR</Text>
                        </View>
                        <View className="flex-1 items-center">
                          <Text className="text-red-400 text-sm font-bold">{ghostPPR} PPR</Text>
                        </View>
                      </View>
                      <View className="w-16 items-center">
                        <Text className={`text-sm font-bold ${playerScore > ghostScore ? "text-blue-400" : ghostScore > playerScore ? "text-red-400" : "text-gray-400"}`}>
                          {playerScore}-{ghostScore}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

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
          className={`rounded-lg font-bold w-14 h-12 items-center justify-center ${
            num === count
              ? 'bg-gray-900 border-2 border-gray-700'
              : disabled && disabled(num)
              ? 'bg-gray-800 border-2 border-gray-700'
              : 'bg-gray-700 border-2 border-gray-600'
          }`}
        >
          <Text
            className={`font-bold text-2xl ${
              num === count
                ? 'text-white'
                : disabled && disabled(num)
                ? 'text-gray-600'
                : 'text-gray-400'
            }`}
          >
            {num}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);
