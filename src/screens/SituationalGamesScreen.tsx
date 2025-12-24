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
import { usePracticeStore, GameScenario, GhostRound } from "../state/practice-store";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { LinearGradient } from "expo-linear-gradient";

const scenarios: GameScenario[] = [
  {
    name: "Comeback Time",
    description: "You're down 15-8 in round 5. Can you make the comeback?",
    playerStartScore: 8,
    ghostStartScore: 15,
    startingRound: 5,
    difficulty: "medium",
  },
  {
    name: "Close Game",
    description: "Tied 18-18 in round 8. Next score could win it!",
    playerStartScore: 18,
    ghostStartScore: 18,
    startingRound: 8,
    difficulty: "hard",
  },
  {
    name: "Hold the Lead",
    description: "You're up 12-7 in round 4. Don't let them back in!",
    playerStartScore: 12,
    ghostStartScore: 7,
    startingRound: 4,
    difficulty: "hard",
  },
  {
    name: "Clutch Moment",
    description: "Down 19-16 in round 7. Need a big round to stay alive!",
    playerStartScore: 16,
    ghostStartScore: 19,
    startingRound: 7,
    difficulty: "medium",
  },
  {
    name: "Late Game Pressure",
    description: "You're up 20-17 in round 9. Close it out!",
    playerStartScore: 20,
    ghostStartScore: 17,
    startingRound: 9,
    difficulty: "hard",
  },
  {
    name: "Blowout Recovery",
    description: "Down 18-6 in round 6. Can you pull off the miracle?",
    playerStartScore: 6,
    ghostStartScore: 18,
    startingRound: 6,
    difficulty: "easy",
  },
];

const difficultyColors: Record<string, { color1: string; color2: string }> = {
  easy: { color1: "#34d399", color2: "#10b981" },
  medium: { color1: "#fbbf24", color2: "#f59e0b" },
  hard: { color1: "#f97316", color2: "#ea580c" },
  pro: { color1: "#dc2626", color2: "#b91c1c" },
};

const difficultySettings = {
  easy: { avgBagsIn: 0.3, avgBagsOn: 1.5 },
  medium: { avgBagsIn: 0.8, avgBagsOn: 1.0 },
  hard: { avgBagsIn: 1.3, avgBagsOn: 0.9 },
  pro: { avgBagsIn: 2.0, avgBagsOn: 0.5 },
};

export default function SituationalGamesScreen() {
  const navigation = useNavigation();
  const createGame = usePracticeStore((s) => s.createSituationalGame);
  const addRound = usePracticeStore((s) => s.addSituationalRound);
  const completeGame = usePracticeStore((s) => s.completeSituationalGame);

  // Get player's PPR from personal stats to use for opponent scoring
  const playerPPR = usePersonalStatsStore((s) => s.stats.averagePointsPerRound);

  const [gameId, setGameId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showScoring, setShowScoring] = useState(false);

  const [playerIn, setPlayerIn] = useState(0);
  const [playerOn, setPlayerOn] = useState(0);
  const [roundHistory, setRoundHistory] = useState<GhostRound[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<{ won: boolean; playerScore: number; ghostScore: number } | null>(null);

  const startGame = (selectedScenario: GameScenario) => {
    const game = createGame(selectedScenario);
    setGameId(game.id);
    setScenario(selectedScenario);
    setGameStarted(true);
    setGameComplete(false);
    setFinalResult(null);
    setPlayerScore(selectedScenario.playerStartScore);
    setGhostScore(selectedScenario.ghostStartScore);
    setCurrentRound(selectedScenario.startingRound);
    setRoundHistory([]);
  };

  const generateGhostThrow = (): { bagsIn: number; bagsOn: number } => {
    if (!scenario) return { bagsIn: 0, bagsOn: 0 };

    // Use player's PPR to determine opponent strength
    // Base PPR on player's stats, with difficulty modifier
    // If player has no stats (PPR = 0), use a default of 5.0
    const basePPR = playerPPR > 0 ? playerPPR : 5.0;

    // Apply difficulty modifier to make opponent easier or harder
    // easy: opponent PPR is same as player
    // medium: opponent PPR is player + 0.5
    // hard: opponent PPR is player + 1.0
    // pro: opponent PPR is player + 1.5
    const difficultyModifier: Record<string, number> = {
      easy: 0,
      medium: 0.5,
      hard: 1.0,
      pro: 1.5,
    };

    const targetPPR = basePPR + (difficultyModifier[scenario.difficulty] || 0);

    // Convert PPR to bags in/on
    // PPR = (bagsIn * 3 + bagsOn * 1)
    // On average, we want to hit the target PPR
    // We'll estimate: prioritize bags in (3 pts) then bags on (1 pt)

    // Calculate expected bags in from target PPR
    // Assume a typical ratio: most points come from bags in
    // If targetPPR is 6, that could be 2 bags in (6 pts) or 1 in + 3 on (6 pts)
    // We'll use a weighted random approach

    let bagsIn = 0;
    let bagsOn = 0;

    // For each of 4 bags, determine outcome based on target PPR
    // Target PPR / 4 bags = points per bag needed
    // Max points per bag = 3 (in), average about 1.5-2 for good players
    const pointsPerBagTarget = targetPPR / 4;

    for (let i = 0; i < 4; i++) {
      // Probability of bag in: roughly pointsPerBagTarget / 3 (since in = 3 pts)
      // But cap probabilities reasonably
      const inChance = Math.min(0.8, Math.max(0.1, pointsPerBagTarget / 4));
      // Probability of bag on: fill remaining expected points
      const onChance = Math.min(0.5, Math.max(0.1, (pointsPerBagTarget - inChance * 3) / 1.5));

      const roll = Math.random();
      if (roll < inChance && bagsIn < 4) {
        bagsIn++;
      } else if (roll < inChance + onChance && bagsIn + bagsOn < 4) {
        bagsOn++;
      }
    }

    // Ensure we don't exceed 4 total bags
    if (bagsIn + bagsOn > 4) {
      bagsOn = 4 - bagsIn;
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

    const playerPoints = playerIn * 3 + playerOn * 1;
    const ghostPoints = ghost.bagsIn * 3 + ghost.bagsOn * 1;
    const pScore = Math.max(0, playerPoints - ghostPoints);
    const gScore = Math.max(0, ghostPoints - playerPoints);

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

    setPlayerScore(newPlayerScore);
    setGhostScore(newGhostScore);

    if (newPlayerScore >= 21 || newGhostScore >= 21) {
      const winner = newPlayerScore >= 21 ? "player" : "ghost";
      completeGame(gameId, winner);
      setFinalResult({ won: winner === "player", playerScore: newPlayerScore, ghostScore: newGhostScore });
      setGameComplete(true);
    } else {
      setCurrentRound(currentRound + 1);
    }

    setPlayerIn(0);
    setPlayerOn(0);
    setShowScoring(false);
  };

  const quitGame = () => {
    if (gameId) {
      const winner = ghostScore > playerScore ? "ghost" : "player";
      completeGame(gameId, winner);
    }
    setGameStarted(false);
    setGameComplete(false);
    setFinalResult(null);
    setGameId(null);
    setScenario(null);
    setRoundHistory([]);
  };

  const playAgain = () => {
    setGameStarted(false);
    setGameComplete(false);
    setFinalResult(null);
    setGameId(null);
    setScenario(null);
    setRoundHistory([]);
  };

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
                Situational Games
              </Text>
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
            {gameComplete && finalResult ? (
              /* Game Complete Screen */
              <View className="flex-1 px-4 py-6 items-center justify-center">
                <View className={`rounded-full w-32 h-32 items-center justify-center mb-6 ${finalResult.won ? "bg-green-600" : "bg-red-600"}`}>
                  <Ionicons
                    name={finalResult.won ? "trophy" : "close-circle"}
                    size={64}
                    color="#fff"
                  />
                </View>

                <Text className={`text-4xl font-bold mb-2 ${finalResult.won ? "text-green-400" : "text-red-400"}`}>
                  {finalResult.won ? "You Won!" : "You Lost"}
                </Text>

                {scenario && (
                  <Text className="text-gray-400 text-lg mb-6">
                    {scenario.name}
                  </Text>
                )}

                {/* Final Score */}
                <View className="flex-row gap-4 mb-8">
                  <View className="bg-blue-600 rounded-2xl px-8 py-4 items-center">
                    <Text className="text-blue-200 text-sm mb-1">You</Text>
                    <Text className="text-white text-4xl font-bold">
                      {finalResult.playerScore}
                    </Text>
                  </View>
                  <View className="bg-red-600 rounded-2xl px-8 py-4 items-center">
                    <Text className="text-red-200 text-sm mb-1">Opp</Text>
                    <Text className="text-white text-4xl font-bold">
                      {finalResult.ghostScore}
                    </Text>
                  </View>
                </View>

                {/* Round History in Complete Screen */}
                {roundHistory.length > 0 && (
                  <View className="w-full bg-gray-800 rounded-2xl p-4 mb-6">
                    <Text className="text-white text-lg font-bold mb-3 text-center">
                      Round History
                    </Text>
                    <View className="flex-row items-center pb-2 mb-2 border-b border-gray-700">
                      <Text className="text-gray-400 text-xs font-semibold w-10">RND</Text>
                      <Text className="text-blue-400 text-xs font-semibold flex-1 text-center">YOU</Text>
                      <Text className="text-red-400 text-xs font-semibold flex-1 text-center">OPP</Text>
                      <Text className="text-gray-400 text-xs font-semibold w-16 text-right">RESULT</Text>
                    </View>
                    {roundHistory.map((round, index) => {
                      const playerRawPts = round.playerIn * 3 + round.playerOn;
                      const ghostRawPts = round.ghostIn * 3 + round.ghostOn;
                      return (
                        <View
                          key={index}
                          className="flex-row items-center py-2 border-b border-gray-700/50"
                        >
                          <Text className="text-gray-300 text-sm font-bold w-10">
                            {round.roundNumber}
                          </Text>
                          <View className="flex-1 items-center">
                            <Text className="text-blue-300 text-sm">
                              {round.playerIn}in {round.playerOn}on
                            </Text>
                            <Text className="text-blue-400 text-xs">
                              ({playerRawPts} pts)
                            </Text>
                          </View>
                          <View className="flex-1 items-center">
                            <Text className="text-red-300 text-lg font-bold">
                              {ghostRawPts}
                            </Text>
                            <Text className="text-red-400 text-xs">pts</Text>
                          </View>
                          <View className="w-16 items-end">
                            {round.playerScore > 0 ? (
                              <Text className="text-green-400 text-sm font-bold">
                                +{round.playerScore}
                              </Text>
                            ) : round.ghostScore > 0 ? (
                              <Text className="text-red-400 text-sm font-bold">
                                -{round.ghostScore}
                              </Text>
                            ) : (
                              <Text className="text-gray-400 text-sm font-bold">0</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Play Again Button */}
                <Pressable
                  onPress={playAgain}
                  className="bg-purple-600 px-12 py-4 rounded-2xl"
                >
                  <Text className="text-white text-xl font-bold">
                    Play Again
                  </Text>
                </Pressable>
              </View>
            ) : !gameStarted ? (
              /* Scenario Selection */
              <View className="flex-1 px-4 py-6">
                <Text className="text-white text-2xl font-bold mb-2">
                  Choose a Scenario
                </Text>
                <Text className="text-gray-400 mb-6">
                  Practice critical game situations
                </Text>

                {scenarios.map((scen, index) => {
                  const colors = difficultyColors[scen.difficulty];
                  const basePPR = playerPPR > 0 ? playerPPR : 5.0;
                  const diffMod: Record<string, number> = { easy: 0, medium: 0.5, hard: 1.0, pro: 1.5 };
                  const oppPPR = basePPR + (diffMod[scen.difficulty] || 0);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => startGame(scen)}
                      className="mb-3"
                    >
                      <LinearGradient
                        colors={[colors.color1, colors.color2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                        }}
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 mr-3">
                            <View className="flex-row items-center mb-2">
                              <Ionicons
                                name="flash"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white text-xl font-bold">
                                {scen.name}
                              </Text>
                            </View>
                            <Text className="text-white text-sm opacity-90 mb-3">
                              {scen.description}
                            </Text>
                            <View className="flex-row items-center">
                              <View className="bg-white/20 rounded-lg px-3 py-1 mr-2">
                                <Text className="text-white text-xs font-semibold">
                                  Round {scen.startingRound}
                                </Text>
                              </View>
                              <View className="bg-white/20 rounded-lg px-3 py-1 mr-2">
                                <Text className="text-white text-xs font-semibold">
                                  {scen.playerStartScore}-{scen.ghostStartScore}
                                </Text>
                              </View>
                              <View className="bg-white/30 rounded-lg px-3 py-1">
                                <Text className="text-white text-xs font-semibold">
                                  Opp: {oppPPR.toFixed(1)} PPR
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#fff"
                          />
                        </View>
                      </LinearGradient>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              /* Active Game */
              <View className="flex-1 px-4 py-6">
                {/* Scenario Info */}
                {scenario && (
                  <View className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 mb-6">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-purple-400 font-bold mb-1">
                          {scenario.name}
                        </Text>
                        <Text className="text-purple-300 text-sm">
                          {scenario.description}
                        </Text>
                      </View>
                      <View className="bg-purple-800/50 rounded-lg px-3 py-2 ml-3">
                        <Text className="text-purple-300 text-xs">Opp PPR</Text>
                        <Text className="text-white font-bold text-center">
                          {(() => {
                            const basePPR = playerPPR > 0 ? playerPPR : 5.0;
                            const mod: Record<string, number> = { easy: 0, medium: 0.5, hard: 1.0, pro: 1.5 };
                            return (basePPR + (mod[scenario.difficulty] || 0)).toFixed(1);
                          })()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Scores */}
                <View className="flex-row gap-3 mb-6">
                  <View className="flex-1 bg-blue-600 rounded-2xl p-6">
                    <Text className="text-blue-200 text-sm mb-1">You</Text>
                    <Text className="text-white text-5xl font-bold">
                      {playerScore}
                    </Text>
                  </View>
                  <View className="flex-1 bg-red-600 rounded-2xl p-6">
                    <Text className="text-red-200 text-sm mb-1">Opponent</Text>
                    <Text className="text-white text-5xl font-bold">
                      {ghostScore}
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
                {!showScoring ? (
                  <Pressable
                    onPress={() => setShowScoring(true)}
                    className="bg-green-600 py-6 rounded-2xl items-center mb-4"
                  >
                    <Ionicons name="add-circle" size={48} color="#fff" />
                    <Text className="text-white text-xl font-bold mt-2">
                      Enter Your Score
                    </Text>
                  </Pressable>
                ) : (
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
                        className="flex-1 bg-green-600 py-3 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Submit
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Round History */}
                {roundHistory.length > 0 && (
                  <View className="bg-gray-800 rounded-2xl p-4 mb-4">
                    <Text className="text-white text-lg font-bold mb-3">
                      Round History
                    </Text>
                    {/* Header */}
                    <View className="flex-row items-center pb-2 mb-2 border-b border-gray-700">
                      <Text className="text-gray-400 text-xs font-semibold w-10">RND</Text>
                      <Text className="text-blue-400 text-xs font-semibold flex-1 text-center">YOU</Text>
                      <Text className="text-red-400 text-xs font-semibold flex-1 text-center">OPP</Text>
                      <Text className="text-gray-400 text-xs font-semibold w-16 text-right">RESULT</Text>
                    </View>
                    {/* Rounds */}
                    {roundHistory.map((round, index) => {
                      const playerRawPts = round.playerIn * 3 + round.playerOn;
                      const ghostRawPts = round.ghostIn * 3 + round.ghostOn;
                      return (
                        <View
                          key={index}
                          className="flex-row items-center py-2 border-b border-gray-700/50"
                        >
                          <Text className="text-gray-300 text-sm font-bold w-10">
                            {round.roundNumber}
                          </Text>
                          <View className="flex-1 items-center">
                            <Text className="text-blue-300 text-sm">
                              {round.playerIn}in {round.playerOn}on
                            </Text>
                            <Text className="text-blue-400 text-xs">
                              ({playerRawPts} pts)
                            </Text>
                          </View>
                          <View className="flex-1 items-center">
                            <Text className="text-red-300 text-lg font-bold">
                              {ghostRawPts}
                            </Text>
                            <Text className="text-red-400 text-xs">
                              pts
                            </Text>
                          </View>
                          <View className="w-16 items-end">
                            {round.playerScore > 0 ? (
                              <Text className="text-green-400 text-sm font-bold">
                                +{round.playerScore}
                              </Text>
                            ) : round.ghostScore > 0 ? (
                              <Text className="text-red-400 text-sm font-bold">
                                -{round.ghostScore}
                              </Text>
                            ) : (
                              <Text className="text-gray-400 text-sm font-bold">
                                0
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
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
