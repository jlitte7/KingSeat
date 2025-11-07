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
  const [oppScore, setOppScore] = useState(0); // Simplified: just opponent's raw score (0-12)

  const handleStartMatch = () => {
    if (!opponent.trim()) {
      Alert.alert("Missing Info", "Please enter opponent name");
      return;
    }
    startMatch(opponent, teammate || undefined);
    startRound();
  };

  const handleCompleteRound = () => {
    // Calculate my raw score from bags
    const myRawScore = myBagsIn * 3 + myBagsOn;

    // Opponent score is directly selected (0-12)
    const oppRawScore = oppScore;

    // Apply cancellation scoring
    const myRoundScore = Math.max(0, myRawScore - oppRawScore);
    const oppRoundScore = Math.max(0, oppRawScore - myRawScore);

    const newMyScore = (currentMatch?.myScore ?? 0) + myRoundScore;
    const newOppScore = (currentMatch?.opponentScore ?? 0) + oppRoundScore;

    // For store, we need to estimate opponent bags (for stats tracking)
    // Assume best case for opponent: maximize bags in, then bags on
    const oppBagsIn = Math.min(4, Math.floor(oppRawScore / 3));
    const oppBagsOn = oppRawScore - (oppBagsIn * 3);

    completeRound(myBagsIn, myBagsOn, oppBagsIn, oppBagsOn);

    // Reset counts
    setMyBagsIn(0);
    setMyBagsOn(0);
    setOppScore(0);

    // DON'T auto-start next round - let user manually click "Start Next Round" or "End Match"
    // This prevents the loop issue where game over screen appears then disappears
  };

  const handleEndMatch = () => {
    if (!currentMatch) return;

    Alert.alert(
      "End Match",
      `Final Score: You ${currentMatch.myScore} - ${currentMatch.opponentScore} ${currentMatch.opponent}\n\nDid you win this match?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "I Lost",
          style: "destructive",
          onPress: () => {
            endMatch(false);
            navigation.navigate("PersonalStats");
          },
        },
        {
          text: "I Won",
          onPress: () => {
            endMatch(true);
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

  // Calculate comprehensive real-time stats from current match (must be before early return)
  const matchStats = React.useMemo(() => {
    if (!currentMatch) {
      return {
        totalBagsIn: 0,
        totalBagsOn: 0,
        totalBagsThrown: 0,
        totalPoints: 0,
        totalOppPoints: 0,
        fourBaggers: 0,
        threeBaggers: 0,
        roundsPlayed: 0,
        inPercent: "0.0",
        onPercent: "0.0",
        offPercent: "0.0",
        boardPercent: "0.0",
        ppr: "0.00",
        oppr: "0.00",
        ptDiff: "0.00",
        fourBaggerPercent: "0.0",
        scorePercent: "0.0",
      };
    }

    let totalBagsIn = 0;
    let totalBagsOn = 0;
    let totalBagsThrown = currentMatch.rounds.length * 4;
    let fourBaggers = 0;
    let threeBaggers = 0;

    currentMatch.rounds.forEach((round) => {
      totalBagsIn += round.myBagsIn;
      totalBagsOn += round.myBagsOn;
      if (round.myBagsIn === 4) fourBaggers++;
      if (round.myBagsIn === 3) threeBaggers++;
    });

    const roundsPlayed = currentMatch.rounds.length;
    const totalBagsOff = totalBagsThrown - totalBagsIn - totalBagsOn;

    // PPR uses RAW bag values (before cancellation)
    const totalRawPoints = (totalBagsIn * 3) + (totalBagsOn * 1);

    // For opponent PPR, calculate raw points from their bags
    let oppTotalBagsIn = 0;
    let oppTotalBagsOn = 0;
    currentMatch.rounds.forEach((round) => {
      oppTotalBagsIn += round.opponentBagsIn;
      oppTotalBagsOn += round.opponentBagsOn;
    });
    const totalOppRawPoints = (oppTotalBagsIn * 3) + (oppTotalBagsOn * 1);

    // Game scores are for display only (cumulative game score after cancellation)
    const totalGamePoints = currentMatch.myScore;
    const totalOppGamePoints = currentMatch.opponentScore ?? 0;

    // Percentages
    const inPercent = totalBagsThrown > 0 ? ((totalBagsIn / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const onPercent = totalBagsThrown > 0 ? ((totalBagsOn / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const offPercent = totalBagsThrown > 0 ? ((totalBagsOff / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const boardPercent = totalBagsThrown > 0 ? (((totalBagsIn + totalBagsOn) / totalBagsThrown) * 100).toFixed(1) : "0.0";
    const fourBaggerPercent = roundsPlayed > 0 ? ((fourBaggers / roundsPlayed) * 100).toFixed(1) : "0.0";

    // Score percentage - bags that scored (in + on) / total bags
    const bagsScored = totalBagsIn + totalBagsOn;
    const scorePercent = totalBagsThrown > 0 ? ((bagsScored / totalBagsThrown) * 100).toFixed(1) : "0.0";

    // PPR - using RAW bag values (before cancellation) divided by rounds
    const ppr = roundsPlayed > 0 ? (totalRawPoints / roundsPlayed).toFixed(2) : "0.00";
    const oppr = roundsPlayed > 0 ? (totalOppRawPoints / roundsPlayed).toFixed(2) : "0.00";
    const ptDiff = roundsPlayed > 0 ? ((totalRawPoints - totalOppRawPoints) / roundsPlayed).toFixed(2) : "0.00";

    return {
      totalBagsIn,
      totalBagsOn,
      totalBagsThrown,
      totalPoints: totalGamePoints,
      totalOppPoints: totalOppGamePoints,
      fourBaggers,
      threeBaggers,
      roundsPlayed,
      inPercent,
      onPercent,
      offPercent,
      boardPercent,
      ppr,
      oppr,
      ptDiff,
      fourBaggerPercent,
      scorePercent,
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

        {/* Compact Real-Time Stats */}
        {currentMatch.rounds.length > 0 && (
          <View className="px-4 pb-2">
            <View className="bg-gray-900/50 rounded-lg p-2 border border-gray-800">
              <Text className="text-gray-400 text-xs font-bold mb-2 text-center">
                MATCH STATS
              </Text>

              {/* Primary Stats Row */}
              <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-800">
                <View className="flex-1 items-center">
                  <Text className="text-green-400 text-lg font-bold">
                    {matchStats.inPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">IN</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-gray-800">
                  <Text className="text-blue-400 text-lg font-bold">
                    {matchStats.boardPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">BOARD</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-red-400 text-lg font-bold">
                    {matchStats.offPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">OFF</Text>
                </View>
              </View>

              {/* Scoring Stats Row */}
              <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-800">
                <View className="flex-1 items-center">
                  <Text className="text-purple-400 text-lg font-bold">
                    {matchStats.ppr}
                  </Text>
                  <Text className="text-gray-400 text-xs">PPR</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-gray-800">
                  <Text className="text-orange-400 text-lg font-bold">
                    {matchStats.oppr}
                  </Text>
                  <Text className="text-gray-400 text-xs">OPPR</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className={`text-lg font-bold ${
                    parseFloat(matchStats.ptDiff) > 0 ? "text-green-400" :
                    parseFloat(matchStats.ptDiff) < 0 ? "text-red-400" : "text-gray-400"
                  }`}>
                    {parseFloat(matchStats.ptDiff) > 0 ? "+" : ""}{matchStats.ptDiff}
                  </Text>
                  <Text className="text-gray-400 text-xs">DIFF</Text>
                </View>
              </View>

              {/* Cumulative Stats Row */}
              <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-800">
                <View className="flex-1 items-center">
                  <Text className="text-green-400 text-base font-bold">
                    {matchStats.totalPoints}
                  </Text>
                  <Text className="text-gray-400 text-xs">TOT PTS</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-gray-800">
                  <Text className="text-orange-400 text-base font-bold">
                    {matchStats.totalOppPoints}
                  </Text>
                  <Text className="text-gray-400 text-xs">OPP</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-blue-400 text-base font-bold">
                    {matchStats.roundsPlayed}
                  </Text>
                  <Text className="text-gray-400 text-xs">RNDS</Text>
                </View>
              </View>

              {/* Additional Percentages Row */}
              <View className="flex-row justify-between">
                <View className="flex-1 items-center">
                  <Text className="text-yellow-400 text-base font-bold">
                    {matchStats.fourBaggerPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">4-BAG</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-gray-800">
                  <Text className="text-cyan-400 text-base font-bold">
                    {matchStats.onPercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">ON</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-pink-400 text-base font-bold">
                    {matchStats.scorePercent}%
                  </Text>
                  <Text className="text-gray-400 text-xs">SCR</Text>
                </View>
              </View>

              {/* Achievement Badges - Compact */}
              {(matchStats.fourBaggers > 0 || matchStats.threeBaggers > 0) && (
                <View className="flex-row justify-center mt-2 pt-2 border-t border-gray-800">
                  {matchStats.fourBaggers > 0 && (
                    <View className="flex-row items-center mr-3">
                      <Ionicons name="trophy" size={14} color="#fbbf24" />
                      <Text className="text-yellow-400 font-bold text-xs ml-1">
                        {matchStats.fourBaggers} 4-Bag{matchStats.fourBaggers > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                  {matchStats.threeBaggers > 0 && (
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#a78bfa" />
                      <Text className="text-purple-400 font-bold text-xs ml-1">
                        {matchStats.threeBaggers} 3-Bag{matchStats.threeBaggers > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        <ScrollView className="flex-1">
          {/* Start Next Round Button (between rounds, game not over) - Moved above Previous Rounds */}
          {!gameOver && currentMatch.rounds.length > 0 && !currentRound && (
            <View className="px-4 pt-2 pb-4">
              <Pressable
                onPress={() => startRound()}
                className="bg-blue-600 rounded-lg p-4 items-center mb-3"
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

          {/* Current Round - Button Interface */}
          {currentRound && !gameOver && (
            <View className="px-4 pt-2">
              <Text className="text-white text-base font-bold mb-2 text-center">
                Round {currentRound.roundNumber}
              </Text>

              {/* My Bags - Side by Side Grid Layout */}
              <View className="mb-3">
                <Text className="text-white text-sm font-bold text-center mb-2">
                  {settings.myName}
                </Text>

                <View className="flex-row justify-between mb-3">
                  {/* Bags In - Left Side */}
                  <View className="flex-1 mr-1">
                    <Text className="text-green-400 text-xs font-bold text-center mb-1">
                      BAGS IN
                    </Text>
                    <View className="flex-row flex-wrap justify-center">
                      {[0, 1, 2, 3, 4].map((num) => {
                        const wouldExceed = num + myBagsOn > 4;
                        return (
                          <Pressable
                            key={`my-in-${num}`}
                            onPress={() => !wouldExceed && setMyBagsIn(num)}
                            disabled={wouldExceed}
                            className={`w-[48%] py-3 rounded-lg m-1 ${
                              myBagsIn === num
                                ? "bg-green-600 border-2 border-white"
                                : wouldExceed
                                ? "bg-gray-900 opacity-30"
                                : "bg-gray-800"
                            }`}
                          >
                            <Text className={`text-xl font-bold text-center ${
                              wouldExceed ? "text-gray-600" : "text-white"
                            }`}>
                              {num}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Bags On - Right Side */}
                  <View className="flex-1 ml-1">
                    <Text className="text-blue-400 text-xs font-bold text-center mb-1">
                      BAGS ON
                    </Text>
                    <View className="flex-row flex-wrap justify-center">
                      {[0, 1, 2, 3, 4].map((num) => {
                        const wouldExceed = myBagsIn + num > 4;
                        return (
                          <Pressable
                            key={`my-on-${num}`}
                            onPress={() => !wouldExceed && setMyBagsOn(num)}
                            disabled={wouldExceed}
                            className={`w-[48%] py-3 rounded-lg m-1 ${
                              myBagsOn === num
                                ? "bg-blue-600 border-2 border-white"
                                : wouldExceed
                                ? "bg-gray-900 opacity-30"
                                : "bg-gray-800"
                            }`}
                          >
                            <Text className={`text-xl font-bold text-center ${
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
              </View>

              {/* Opponent Score - Compact Grid */}
              <View className="mb-3">
                <Text className="text-orange-400 text-sm font-bold text-center mb-2">
                  {currentMatch.opponent}
                </Text>
                <View className="flex-row flex-wrap justify-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => {
                    return (
                      <Pressable
                        key={`opp-score-${num}`}
                        onPress={() => setOppScore(num)}
                        className={`py-2 px-3 rounded-lg m-1 ${
                          oppScore === num
                            ? "bg-orange-600 border-2 border-white"
                            : "bg-gray-800"
                        }`}
                        style={{ minWidth: 50 }}
                      >
                        <Text className="text-base font-bold text-center text-white">
                          {num}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Complete Round Buttons */}
              <View className="flex-row gap-2 pb-4">
                <Pressable
                  onPress={handleCancelMatch}
                  className="flex-1 bg-red-600 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCompleteRound}
                  className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Enter</Text>
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
