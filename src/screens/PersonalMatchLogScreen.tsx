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
  const completeRound = usePersonalStatsStore((s) => s.completeRound);
  const startRound = usePersonalStatsStore((s) => s.startRound);
  const endMatch = usePersonalStatsStore((s) => s.endMatch);
  const cancelMatch = usePersonalStatsStore((s) => s.cancelMatch);
  const settings = usePersonalStatsStore((s) => s.settings);

  const [opponent, setOpponent] = useState("");
  const [teammate, setTeammate] = useState("");

  // Round bag counts
  const [myBagsIn, setMyBagsIn] = useState(0);
  const [myBagsOn, setMyBagsOn] = useState(0);
  const [oppBagsIn, setOppBagsIn] = useState(0);
  const [oppBagsOn, setOppBagsOn] = useState(0);

  const handleStartMatch = () => {
    if (!opponent.trim()) {
      Alert.alert("Missing Info", "Please enter opponent name");
      return;
    }
    startMatch(opponent, teammate || undefined);
    startRound();
  };

  const handleCompleteRound = () => {
    // Calculate what the new scores will be (cancellation scoring)
    const myRawScore = myBagsIn * 3 + myBagsOn;
    const oppRawScore = oppBagsIn * 3 + oppBagsOn;
    const myRoundScore = Math.max(0, myRawScore - oppRawScore);
    const oppRoundScore = Math.max(0, oppRawScore - myRawScore);

    const newMyScore = (currentMatch?.myScore ?? 0) + myRoundScore;
    const newOppScore = (currentMatch?.opponentScore ?? 0) + oppRoundScore;

    completeRound(myBagsIn, myBagsOn, oppBagsIn, oppBagsOn);

    // Reset counts
    setMyBagsIn(0);
    setMyBagsOn(0);
    setOppBagsIn(0);
    setOppBagsOn(0);

    // DON'T auto-start next round - let user manually click "Start Next Round" or "End Match"
    // This prevents the loop issue where game over screen appears then disappears
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

  // Calculate real-time stats from current match (must be before early return)
  // Updated to fix hook ordering
  const matchStats = React.useMemo(() => {
    if (!currentMatch) {
      return {
        totalBagsIn: 0,
        totalBagsOn: 0,
        totalBagsThrown: 0,
        totalPoints: 0,
        fourBaggers: 0,
        threeBaggers: 0,
        inPercent: "0.0",
        onPercent: "0.0",
        boardPercent: "0.0",
        ppr: "0.00",
      };
    }

    let totalBagsIn = 0;
    let totalBagsOn = 0;
    let totalBagsThrown = currentMatch.rounds.length * 4;
    let totalPoints = 0;
    let fourBaggers = 0;
    let threeBaggers = 0;

    currentMatch.rounds.forEach((round) => {
      totalBagsIn += round.myBagsIn;
      totalBagsOn += round.myBagsOn;
      totalPoints += round.myScore;
      if (round.myBagsIn === 4) fourBaggers++;
      if (round.myBagsIn === 3) threeBaggers++;
    });

    const inPercent = totalBagsThrown > 0 ? ((totalBagsIn / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const onPercent = totalBagsThrown > 0 ? ((totalBagsOn / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const boardPercent = totalBagsThrown > 0 ? (((totalBagsIn + totalBagsOn) / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const ppr = currentMatch.rounds.length > 0 ? (totalPoints / currentMatch.rounds.length).toFixed(2) : "0.00";

    return {
      totalBagsIn,
      totalBagsOn,
      totalBagsThrown,
      totalPoints,
      fourBaggers,
      threeBaggers,
      inPercent,
      onPercent,
      boardPercent,
      ppr,
    };
  }, [currentMatch]);

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

            <View className="mt-6 bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#60a5fa" style={{ marginRight: 8, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-blue-400 font-bold text-sm mb-2">
                    Tracking YOUR Performance
                  </Text>
                  <Text className="text-blue-300 text-sm leading-6">
                    {"This tracks YOUR personal bag throws only. In doubles, just log your 4 bags - not your partner's throws. The opponent score is their team's total (both players combined)."}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Active match screen
  const gameOver = currentMatch.myScore >= 21 || (currentMatch.opponentScore ?? 0) >= 21;

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">
            Round {currentMatch.rounds.length + 1}
          </Text>
          <Pressable onPress={handleCancelMatch}>
            <Text className="text-red-500 font-bold text-base">Cancel</Text>
          </Pressable>
        </View>

        {/* Score Display */}
        <View className="px-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-sm">{settings.myName}</Text>
            <Text className="text-white text-5xl font-bold">
              {currentMatch.myScore}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-sm">{currentMatch.opponent}</Text>
            <Text className="text-white text-5xl font-bold">
              {currentMatch.opponentScore ?? 0}
            </Text>
          </View>
        </View>

        {/* Real-Time Stats */}
        {currentMatch.rounds.length > 0 && (
          <View className="px-4 pb-4">
            <View className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <Text className="text-gray-400 text-xs font-bold mb-3 text-center">
                YOUR MATCH STATS
              </Text>
              <View className="flex-row justify-between">
                <View className="flex-1 items-center">
                  <Text className="text-green-400 text-2xl font-bold">
                    {matchStats.inPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">IN%</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-gray-800">
                  <Text className="text-blue-400 text-2xl font-bold">
                    {matchStats.boardPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">BOARD%</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-purple-400 text-2xl font-bold">
                    {matchStats.ppr}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">PPR</Text>
                </View>
              </View>
              {(matchStats.fourBaggers > 0 || matchStats.threeBaggers > 0) && (
                <View className="flex-row justify-center mt-3 pt-3 border-t border-gray-800">
                  {matchStats.fourBaggers > 0 && (
                    <View className="flex-row items-center mr-4">
                      <Ionicons name="trophy" size={16} color="#fbbf24" />
                      <Text className="text-yellow-400 font-bold ml-1">
                        {matchStats.fourBaggers} 4-Bagger{matchStats.fourBaggers > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                  {matchStats.threeBaggers > 0 && (
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#a78bfa" />
                      <Text className="text-purple-400 font-bold ml-1">
                        {matchStats.threeBaggers} 3-Bagger{matchStats.threeBaggers > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        <ScrollView className="flex-1">
          {/* Current Round - Button Interface */}
          {currentRound && !gameOver && (
            <View className="px-4 pt-4">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                Round {currentRound.roundNumber} - Tap to Select
              </Text>

              <View className="flex-row justify-between mb-8">
                {/* Your Bags Column */}
                <View className="flex-1 mr-2">
                  <Text className="text-red-500 text-xl font-bold text-center mb-2">
                    {settings.myName}
                  </Text>

                  {/* Bags In */}
                  <Text className="text-red-500 text-sm font-bold text-center mb-2">
                    BAGS IN
                  </Text>
                  <View className="items-center mb-4">
                    {[0, 1, 2, 3, 4].map((num) => {
                      const wouldExceed = num + myBagsOn > 4;
                      return (
                        <Pressable
                          key={`my-in-${num}`}
                          onPress={() => !wouldExceed && setMyBagsIn(num)}
                          disabled={wouldExceed}
                          className={`w-full py-3 rounded-lg mb-2 ${
                            myBagsIn === num
                              ? "bg-gray-700 border-2 border-white"
                              : wouldExceed
                              ? "bg-gray-900 opacity-30"
                              : "bg-gray-800"
                          }`}
                        >
                          <Text className={`text-2xl font-bold text-center ${
                            wouldExceed ? "text-gray-600" : "text-white"
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Bags On */}
                  <Text className="text-red-500 text-sm font-bold text-center mb-2">
                    BAGS ON
                  </Text>
                  <View className="items-center">
                    {[0, 1, 2, 3, 4].map((num) => {
                      const wouldExceed = myBagsIn + num > 4;
                      return (
                        <Pressable
                          key={`my-on-${num}`}
                          onPress={() => !wouldExceed && setMyBagsOn(num)}
                          disabled={wouldExceed}
                          className={`w-full py-3 rounded-lg mb-2 ${
                            myBagsOn === num
                              ? "bg-gray-700 border-2 border-white"
                              : wouldExceed
                              ? "bg-gray-900 opacity-30"
                              : "bg-gray-800"
                          }`}
                        >
                          <Text className={`text-2xl font-bold text-center ${
                            wouldExceed ? "text-gray-600" : "text-white"
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Opponent Bags Column */}
                <View className="flex-1 ml-2">
                  <Text className="text-blue-500 text-xl font-bold text-center mb-2">
                    {currentMatch.opponent}
                  </Text>

                  {/* Bags In */}
                  <Text className="text-blue-500 text-sm font-bold text-center mb-2">
                    BAGS IN
                  </Text>
                  <View className="items-center mb-4">
                    {[0, 1, 2, 3, 4].map((num) => {
                      const wouldExceed = num + oppBagsOn > 4;
                      return (
                        <Pressable
                          key={`opp-in-${num}`}
                          onPress={() => !wouldExceed && setOppBagsIn(num)}
                          disabled={wouldExceed}
                          className={`w-full py-3 rounded-lg mb-2 ${
                            oppBagsIn === num
                              ? "bg-gray-700 border-2 border-white"
                              : wouldExceed
                              ? "bg-gray-900 opacity-30"
                              : "bg-gray-800"
                          }`}
                        >
                          <Text className={`text-2xl font-bold text-center ${
                            wouldExceed ? "text-gray-600" : "text-white"
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Bags On */}
                  <Text className="text-blue-500 text-sm font-bold text-center mb-2">
                    BAGS ON
                  </Text>
                  <View className="items-center">
                    {[0, 1, 2, 3, 4].map((num) => {
                      const wouldExceed = oppBagsIn + num > 4;
                      return (
                        <Pressable
                          key={`opp-on-${num}`}
                          onPress={() => !wouldExceed && setOppBagsOn(num)}
                          disabled={wouldExceed}
                          className={`w-full py-3 rounded-lg mb-2 ${
                            oppBagsOn === num
                              ? "bg-gray-700 border-2 border-white"
                              : wouldExceed
                              ? "bg-gray-900 opacity-30"
                              : "bg-gray-800"
                          }`}
                        >
                          <Text className={`text-2xl font-bold text-center ${
                            wouldExceed ? "text-gray-600" : "text-white"
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Complete Round Buttons */}
              <View className="flex-row gap-3 px-4 pb-6">
                <Pressable
                  onPress={handleCancelMatch}
                  className="flex-1 bg-red-600 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-lg">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCompleteRound}
                  className="flex-1 bg-green-600 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-lg">Enter</Text>
                </Pressable>
              </View>
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

          {/* Start Next Round Button (between rounds, game not over) */}
          {!gameOver && currentMatch.rounds.length > 0 && !currentRound && (
            <View className="px-4 pb-8">
              <Pressable
                onPress={() => startRound()}
                className="bg-blue-600 rounded-lg p-4 items-center mb-4"
              >
                <Text className="text-white font-bold text-lg">
                  Start Next Round
                </Text>
              </Pressable>
              <Pressable
                onPress={handleEndMatch}
                className="bg-gray-700 rounded-lg p-4 items-center"
              >
                <Text className="text-white font-bold text-base">
                  End Match Early & Save
                </Text>
              </Pressable>
            </View>
          )}

          {/* End Match Button (game over) */}
          {gameOver && (
            <View className="px-4 pb-8">
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
              <Pressable
                onPress={handleEndMatch}
                className="bg-purple-600 rounded-lg p-4 items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Save Match & View Stats
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
