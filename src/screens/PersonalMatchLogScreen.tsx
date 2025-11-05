import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";

type PersonalMatchLogNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalMatchLog"
>;

export default function PersonalMatchLogScreen() {
  const navigation = useNavigation<PersonalMatchLogNavigationProp>();
  const currentMatch = usePersonalStatsStore((s) => s.currentMatch);
  const currentRound = usePersonalStatsStore((s) => s.currentRound);
  const startMatch = usePersonalStatsStore((s) => s.startMatch);
  const logThrow = usePersonalStatsStore((s) => s.logThrow);
  const undoLastThrow = usePersonalStatsStore((s) => s.undoLastThrow);
  const completeRound = usePersonalStatsStore((s) => s.completeRound);
  const startRound = usePersonalStatsStore((s) => s.startRound);
  const endMatch = usePersonalStatsStore((s) => s.endMatch);
  const cancelMatch = usePersonalStatsStore((s) => s.cancelMatch);

  const [opponent, setOpponent] = useState("");
  const [teammate, setTeammate] = useState("");
  const [opponentRoundScore, setOpponentRoundScore] = useState("");

  const handleStartMatch = () => {
    if (!opponent.trim()) {
      Alert.alert("Missing Info", "Please enter opponent name");
      return;
    }
    startMatch(opponent, teammate || undefined);
    startRound();
  };

  const handleCompleteRound = () => {
    if (!currentRound || !currentMatch) return;

    const inCount = currentRound.throws.filter((t) => t.result === "in").length;
    const onCount = currentRound.throws.filter((t) => t.result === "on").length;
    const myScore = inCount * 3 + onCount;

    const oppScore = opponentRoundScore
      ? parseInt(opponentRoundScore)
      : undefined;

    completeRound(myScore, oppScore);
    setOpponentRoundScore("");

    // Auto-start next round
    setTimeout(() => startRound(), 300);
  };

  const handleEndMatch = () => {
    if (!currentMatch) return;

    const myScore = currentMatch.myScore;
    const opponentScore = currentMatch.opponentScore;
    const won = opponentScore !== undefined ? myScore > opponentScore : undefined;

    endMatch(myScore, opponentScore, won);
    navigation.navigate("PersonalStats");
  };

  const handleCancelMatch = () => {
    Alert.alert(
      "Cancel Match",
      "Are you sure you want to cancel this match? Your progress will be lost.",
      [
        { text: "Keep Playing", style: "cancel" },
        {
          text: "Cancel Match",
          style: "destructive",
          onPress: () => {
            cancelMatch();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getThrowIcon = (result: "in" | "on" | "miss") => {
    if (result === "in") return "checkmark-circle";
    if (result === "on") return "remove-circle";
    return "close-circle";
  };

  const getThrowColor = (result: "in" | "on" | "miss") => {
    if (result === "in") return "text-green-400";
    if (result === "on") return "text-yellow-400";
    return "text-red-400";
  };

  // Setup screen
  if (!currentMatch) {
    return (
      <View className="flex-1 bg-gray-900">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Log Match</Text>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <Text className="text-white text-lg font-bold mb-4">
              Match Details
            </Text>

            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">
                Opponent Name *
              </Text>
              <TextInput
                value={opponent}
                onChangeText={setOpponent}
                placeholder="Enter opponent name"
                placeholderTextColor="#6b7280"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2">
                Teammate (Optional)
              </Text>
              <TextInput
                value={teammate}
                onChangeText={setTeammate}
                placeholder="Enter teammate name"
                placeholderTextColor="#6b7280"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
              />
            </View>

            <Pressable
              onPress={handleStartMatch}
              className="bg-purple-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-bold text-base">
                Start Match
              </Text>
            </Pressable>

            <View className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-gray-400 text-sm mb-2">
                During the match, you will:
              </Text>
              <Text className="text-gray-300 text-sm leading-6">
                • Log each of your bag throws{"\n"}
                • Enter opponent scores after each round{"\n"}
                • Track the full game until completion{"\n"}
                • Save complete match stats
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Active match screen
  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-800">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-xl font-bold">
              Round {currentMatch.rounds.length + 1}
            </Text>
            <Pressable onPress={handleCancelMatch}>
              <Text className="text-red-400 font-bold">Cancel</Text>
            </Pressable>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-400 text-xs">You</Text>
              <Text className="text-white text-2xl font-bold">
                {currentMatch.myScore}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 text-xs">{currentMatch.opponent}</Text>
              <Text className="text-white text-2xl font-bold">
                {currentMatch.opponentScore ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Current Round */}
          {currentRound && (
            <View className="px-4 pt-4">
              <Text className="text-white text-lg font-bold mb-3">
                Your Throws ({currentRound.throws.length}/4)
              </Text>
              <View className="flex-row flex-wrap mb-4">
                {[0, 1, 2, 3].map((index) => {
                  const throwData = currentRound.throws[index];
                  return (
                    <View
                      key={index}
                      className="w-1/4 p-2"
                    >
                      {throwData ? (
                        <View className="bg-gray-800 rounded-lg p-3 items-center border border-gray-700">
                          <Ionicons
                            name={getThrowIcon(throwData.result)}
                            size={32}
                            color={
                              throwData.result === "in"
                                ? "#4ade80"
                                : throwData.result === "on"
                                ? "#facc15"
                                : "#f87171"
                            }
                          />
                          <Text
                            className={`text-xs mt-1 font-bold ${getThrowColor(
                              throwData.result
                            )}`}
                          >
                            {throwData.result === "in"
                              ? "In"
                              : throwData.result === "on"
                              ? "On"
                              : "Miss"}
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-gray-800 rounded-lg p-3 items-center border border-gray-700">
                          <View className="w-8 h-8 rounded-full bg-gray-700" />
                          <Text className="text-gray-600 text-xs mt-1">-</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Log Throw Buttons */}
              {currentRound.throws.length < 4 && (
                <View className="mb-4">
                  <Pressable
                    onPress={() => logThrow("in")}
                    className="bg-green-600 rounded-lg p-4 mb-3 flex-row items-center justify-center"
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text className="text-white font-bold text-lg ml-2">
                      In the Hole
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => logThrow("on")}
                    className="bg-yellow-600 rounded-lg p-4 mb-3 flex-row items-center justify-center"
                  >
                    <Ionicons name="remove-circle" size={24} color="#fff" />
                    <Text className="text-white font-bold text-lg ml-2">
                      On the Board
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => logThrow("miss")}
                    className="bg-red-600 rounded-lg p-4 mb-3 flex-row items-center justify-center"
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                    <Text className="text-white font-bold text-lg ml-2">Miss</Text>
                  </Pressable>

                  {currentRound.throws.length > 0 && (
                    <Pressable
                      onPress={undoLastThrow}
                      className="bg-gray-700 rounded-lg p-3 flex-row items-center justify-center"
                    >
                      <Ionicons name="arrow-undo" size={20} color="#fff" />
                      <Text className="text-white font-bold ml-2">
                        Undo Last Throw
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Complete Round */}
              {currentRound.throws.length === 4 && (
                <View className="mb-4">
                  <View className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">
                      Opponent Round Score (Optional)
                    </Text>
                    <TextInput
                      value={opponentRoundScore}
                      onChangeText={setOpponentRoundScore}
                      placeholder="Enter score (0-12)"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg text-lg"
                    />
                  </View>

                  <Pressable
                    onPress={handleCompleteRound}
                    className="bg-purple-600 rounded-lg p-4 flex-row items-center justify-center"
                  >
                    <Text className="text-white font-bold text-lg">
                      Complete Round
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {/* Previous Rounds */}
          {currentMatch.rounds.length > 0 && (
            <View className="px-4 pb-6">
              <Text className="text-white text-lg font-bold mb-3">
                Previous Rounds
              </Text>
              {currentMatch.rounds
                .slice()
                .reverse()
                .map((round, index) => {
                  const actualIndex = currentMatch.rounds.length - index;
                  return (
                    <View
                      key={round.roundNumber}
                      className="bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white font-bold">
                          Round {actualIndex}
                        </Text>
                        <Text className="text-white">
                          {round.myScore} -{" "}
                          {round.opponentScore !== undefined
                            ? round.opponentScore
                            : "-"}
                        </Text>
                      </View>
                      <View className="flex-row">
                        {round.throws.map((throwData, i) => (
                          <Ionicons
                            key={i}
                            name={getThrowIcon(throwData.result)}
                            size={20}
                            color={
                              throwData.result === "in"
                                ? "#4ade80"
                                : throwData.result === "on"
                                ? "#facc15"
                                : "#f87171"
                            }
                            style={{ marginRight: 8 }}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          {/* End Match Button */}
          {currentMatch.rounds.length > 0 && !currentRound && (
            <View className="px-4 pb-8">
              <Pressable
                onPress={handleEndMatch}
                className="bg-purple-600 rounded-lg p-4 items-center"
              >
                <Text className="text-white font-bold text-lg">
                  End Match & Save Stats
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
