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
  const logMyThrow = usePersonalStatsStore((s) => s.logMyThrow);
  const undoMyLastThrow = usePersonalStatsStore((s) => s.undoMyLastThrow);
  const completeRound = usePersonalStatsStore((s) => s.completeRound);
  const startRound = usePersonalStatsStore((s) => s.startRound);
  const endMatch = usePersonalStatsStore((s) => s.endMatch);
  const cancelMatch = usePersonalStatsStore((s) => s.cancelMatch);

  const [opponent, setOpponent] = useState("");
  const [teammate, setTeammate] = useState("");

  // Round completion inputs
  const [myBagsIn, setMyBagsIn] = useState("");
  const [myBagsOn, setMyBagsOn] = useState("");
  const [oppBagsIn, setOppBagsIn] = useState("");
  const [oppBagsOn, setOppBagsOn] = useState("");

  const handleStartMatch = () => {
    if (!opponent.trim()) {
      Alert.alert("Missing Info", "Please enter opponent name");
      return;
    }
    startMatch(opponent, teammate || undefined);
    startRound();
  };

  const handleCompleteRound = () => {
    const mIn = parseInt(myBagsIn) || 0;
    const mOn = parseInt(myBagsOn) || 0;
    const oIn = parseInt(oppBagsIn) || 0;
    const oOn = parseInt(oppBagsOn) || 0;

    // Validation
    if (mIn < 0 || mIn > 4 || mOn < 0 || mOn > 4) {
      Alert.alert("Invalid Input", "Your bags must be between 0-4");
      return;
    }
    if (oIn < 0 || oIn > 4 || oOn < 0 || oOn > 4) {
      Alert.alert("Invalid Input", "Opponent bags must be between 0-4");
      return;
    }
    if (mIn + mOn > 4) {
      Alert.alert("Invalid Input", "Your total bags cannot exceed 4");
      return;
    }
    if (oIn + oOn > 4) {
      Alert.alert("Invalid Input", "Opponent total bags cannot exceed 4");
      return;
    }

    completeRound(mIn, mOn, oIn, oOn);

    // Reset inputs
    setMyBagsIn("");
    setMyBagsOn("");
    setOppBagsIn("");
    setOppBagsOn("");

    // Auto-start next round if game not over
    setTimeout(() => {
      if (currentMatch && currentMatch.myScore < 21 && (currentMatch.opponentScore ?? 0) < 21) {
        startRound();
      }
    }, 300);
  };

  const handleEndMatch = () => {
    if (!currentMatch) return;

    Alert.alert(
      "End Match",
      `Final Score: You ${currentMatch.myScore} - ${currentMatch.opponentScore} ${currentMatch.opponent}\n\nSave this match?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Match",
          onPress: () => {
            endMatch();
            navigation.navigate("PersonalStats");
          },
        },
      ]
    );
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
                During each round, you will need to log:
              </Text>
              <Text className="text-gray-300 text-sm leading-6">
                • Your bags in the hole (0-4){"\n"}
                • Your bags on the board (0-4){"\n"}
                • Opponent bags in the hole (0-4){"\n"}
                • Opponent bags on the board (0-4){"\n"}
                {"\n"}
                Scores are calculated automatically using cancellation scoring.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Active match screen
  const gameOver = currentMatch.myScore >= 21 || (currentMatch.opponentScore ?? 0) >= 21;

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-800">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-xl font-bold">
              Round {currentMatch.rounds.length + (currentRound ? 1 : 0)}
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
          {/* Current Round - Enter bag counts */}
          {currentRound && !gameOver && (
            <View className="px-4 pt-4">
              <Text className="text-white text-lg font-bold mb-4">
                Round {currentRound.roundNumber} - Enter Results
              </Text>

              {/* Your Bags */}
              <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <Text className="text-white font-bold mb-3">Your Bags</Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-2">In Hole</Text>
                    <TextInput
                      value={myBagsIn}
                      onChangeText={setMyBagsIn}
                      placeholder="0-4"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={1}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg text-lg text-center"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-2">On Board</Text>
                    <TextInput
                      value={myBagsOn}
                      onChangeText={setMyBagsOn}
                      placeholder="0-4"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={1}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg text-lg text-center"
                    />
                  </View>
                </View>
              </View>

              {/* Opponent Bags */}
              <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <Text className="text-white font-bold mb-3">
                  {currentMatch.opponent} Bags
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-2">In Hole</Text>
                    <TextInput
                      value={oppBagsIn}
                      onChangeText={setOppBagsIn}
                      placeholder="0-4"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={1}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg text-lg text-center"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-2">On Board</Text>
                    <TextInput
                      value={oppBagsOn}
                      onChangeText={setOppBagsOn}
                      placeholder="0-4"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={1}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg text-center text-lg"
                    />
                  </View>
                </View>
              </View>

              <Pressable
                onPress={handleCompleteRound}
                className="bg-purple-600 rounded-lg p-4 items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Complete Round
                </Text>
              </Pressable>
            </View>
          )}

          {/* Previous Rounds */}
          {currentMatch.rounds.length > 0 && (
            <View className="px-4 py-4">
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
                      className="bg-gray-800 rounded-lg p-4 mb-2 border border-gray-700"
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white font-bold text-base">
                          Round {actualIndex}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-green-400 font-bold text-lg mr-2">
                            {round.myScore}
                          </Text>
                          <Text className="text-gray-400">-</Text>
                          <Text className="text-red-400 font-bold text-lg ml-2">
                            {round.opponentScore}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between">
                        <View className="flex-1">
                          <Text className="text-gray-400 text-xs mb-1">You</Text>
                          <Text className="text-white text-sm">
                            {round.myBagsIn} in, {round.myBagsOn} on
                          </Text>
                        </View>
                        <View className="flex-1 items-end">
                          <Text className="text-gray-400 text-xs mb-1">
                            {currentMatch.opponent}
                          </Text>
                          <Text className="text-white text-sm">
                            {round.opponentBagsIn} in, {round.opponentBagsOn} on
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          {/* End Match Button */}
          {(gameOver || (currentMatch.rounds.length > 0 && !currentRound)) && (
            <View className="px-4 pb-8">
              {gameOver && (
                <View className="bg-purple-600/20 border border-purple-600 rounded-lg p-4 mb-4">
                  <Text className="text-purple-400 font-bold text-center text-lg">
                    Game Over!
                  </Text>
                  <Text className="text-white text-center mt-1">
                    {currentMatch.myScore > (currentMatch.opponentScore ?? 0)
                      ? "You Win!"
                      : "You Lose"}
                  </Text>
                </View>
              )}
              <Pressable
                onPress={handleEndMatch}
                className="bg-purple-600 rounded-lg p-4 items-center"
              >
                <Text className="text-white font-bold text-lg">
                  {gameOver ? "Save Match & View Stats" : "End Match Early & Save"}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
