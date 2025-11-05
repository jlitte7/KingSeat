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
import { usePracticeStore, GameScenario, GhostRound } from "../state/practice-store";
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

  const [gameId, setGameId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const [playerIn, setPlayerIn] = useState("");
  const [playerOn, setPlayerOn] = useState("");

  const startGame = (selectedScenario: GameScenario) => {
    const game = createGame(selectedScenario);
    setGameId(game.id);
    setScenario(selectedScenario);
    setGameStarted(true);
    setPlayerScore(selectedScenario.playerStartScore);
    setGhostScore(selectedScenario.ghostStartScore);
    setCurrentRound(selectedScenario.startingRound);
  };

  const generateGhostThrow = (): { bagsIn: number; bagsOn: number } => {
    if (!scenario) return { bagsIn: 0, bagsOn: 0 };

    const config = difficultySettings[scenario.difficulty];
    let bagsIn = 0;
    let bagsOn = 0;

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

    if (pIn < 0 || pIn > 4 || pOn < 0 || pOn > 4 || pIn + pOn > 4) {
      return;
    }

    const ghost = generateGhostThrow();

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

    if (newPlayerScore >= 21 || newGhostScore >= 21) {
      const winner = newPlayerScore >= 21 ? "player" : "ghost";
      completeGame(gameId, winner);
      setGameStarted(false);
    } else {
      setCurrentRound(currentRound + 1);
    }

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
    setScenario(null);
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
            {!gameStarted ? (
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
                              <View className="bg-white/20 rounded-lg px-3 py-1">
                                <Text className="text-white text-xs font-semibold">
                                  {scen.playerStartScore}-{scen.ghostStartScore}
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
                    <Text className="text-purple-400 font-bold mb-1">
                      {scenario.name}
                    </Text>
                    <Text className="text-purple-300 text-sm">
                      {scenario.description}
                    </Text>
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
                <Pressable
                  onPress={() => setShowScoreModal(true)}
                  className="bg-green-600 py-6 rounded-2xl items-center mb-4"
                >
                  <Ionicons name="add-circle" size={48} color="#fff" />
                  <Text className="text-white text-xl font-bold mt-2">
                    Enter Your Score
                  </Text>
                </Pressable>
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
                        className="flex-1 bg-green-600 py-4 rounded-xl"
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
