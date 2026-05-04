import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { usePracticeStore } from "../state/practice-store";
import { useTrainingStore } from "../state/training-store";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface RoundSnapshot {
  made: number;
  streakBefore: number;
  longestBefore: number;
  madeCountBefore: number;
  totalBagsBefore: number;
}

export default function BagRunScreen() {
  const navigation = useNavigation();
  const createSession = usePracticeStore((s) => s.createBagRunSession);
  const updateSession = usePracticeStore((s) => s.updateBagRunSession);
  const completeSession = usePracticeStore((s) => s.completeBagRunSession);

  const activeChallenge = useTrainingStore((s) => s.activeChallenge);
  const updateChallengeProgress = useTrainingStore((s) => s.updateChallengeProgress);
  const completeActiveChallenge = useTrainingStore((s) => s.completeActiveChallenge);
  const cancelActiveChallenge = useTrainingStore((s) => s.cancelActiveChallenge);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalBags, setTotalBags] = useState(0);
  const [madeCount, setMadeCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [roundHistory, setRoundHistory] = useState<RoundSnapshot[]>([]);
  const [roundMadeHistory, setRoundMadeHistory] = useState<number[]>([]);
  const [showChallengeCompleteModal, setShowChallengeCompleteModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  const scale = useSharedValue(1);

  const isBagRunChallenge = activeChallenge?.activityType === "bagRun";
  const challengeTarget = isBagRunChallenge ? activeChallenge.goalRequirement.target : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (isBagRunChallenge && sessionStarted) {
      updateChallengeProgress(longestStreak);
      if (longestStreak >= challengeTarget && challengeTarget > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowChallengeCompleteModal(true);
      }
    }
  }, [longestStreak, isBagRunChallenge, sessionStarted, challengeTarget]);

  const startSession = () => {
    const session = createSession();
    setSessionId(session.id);
    setSessionStarted(true);
    setCurrentRound(1);
    setConsecutiveStreak(0);
    setLongestStreak(0);
    setTotalBags(0);
    setMadeCount(0);
    setRoundHistory([]);
    setRoundMadeHistory([]);
  };

  const recordRound = (made: number) => {
    if (!sessionId) return;

    const snapshot: RoundSnapshot = {
      made,
      streakBefore: consecutiveStreak,
      longestBefore: longestStreak,
      madeCountBefore: madeCount,
      totalBagsBefore: totalBags,
    };

    const newStreak = made === 4 ? consecutiveStreak + 4 : 0;
    const newLongest = Math.max(longestStreak, newStreak);
    const newMade = madeCount + made;
    const newTotal = totalBags + 4;
    const newRound = currentRound + 1;

    setRoundHistory((prev) => [...prev, snapshot]);
    setRoundMadeHistory((prev) => [...prev, made]);
    setConsecutiveStreak(newStreak);
    setLongestStreak(newLongest);
    setMadeCount(newMade);
    setTotalBags(newTotal);
    setCurrentRound(newRound);

    if (made === 4) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (made > 0) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    updateSession(sessionId, {
      totalBags: newTotal,
      madeCount: newMade,
      consecutiveBags: newStreak,
      longestStreak: newLongest,
      accuracy: (newMade / newTotal) * 100,
      rounds: newRound,
    });
  };

  const undoLastRound = () => {
    if (roundHistory.length === 0) return;
    const snapshot = roundHistory[roundHistory.length - 1];

    setRoundHistory((prev) => prev.slice(0, -1));
    setRoundMadeHistory((prev) => prev.slice(0, -1));
    setConsecutiveStreak(snapshot.streakBefore);
    setLongestStreak(snapshot.longestBefore);
    setMadeCount(snapshot.madeCountBefore);
    setTotalBags(snapshot.totalBagsBefore);
    setCurrentRound(currentRound - 1);

    if (sessionId) {
      updateSession(sessionId, {
        totalBags: snapshot.totalBagsBefore,
        madeCount: snapshot.madeCountBefore,
        consecutiveBags: snapshot.streakBefore,
        longestStreak: snapshot.longestBefore,
        accuracy:
          snapshot.totalBagsBefore > 0
            ? (snapshot.madeCountBefore / snapshot.totalBagsBefore) * 100
            : 0,
        rounds: currentRound - 1,
      });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEndPress = () => {
    if (isBagRunChallenge && longestStreak < challengeTarget) {
      setShowExitConfirmModal(true);
    } else {
      endSession();
    }
  };

  const endSession = () => {
    if (sessionId) {
      completeSession(sessionId);
    }
    setSessionStarted(false);
    setSessionId(null);
  };

  const handleExitAndCancel = () => {
    cancelActiveChallenge();
    endSession();
    setShowExitConfirmModal(false);
  };

  const handleResetChallenge = () => {
    if (sessionId) {
      completeSession(sessionId);
    }
    setSessionId(null);
    setSessionStarted(false);
    setShowExitConfirmModal(false);
  };

  const handleChallengeComplete = () => {
    completeActiveChallenge();
    setShowChallengeCompleteModal(false);
    if (sessionId) {
      completeSession(sessionId);
    }
    setSessionStarted(false);
    setSessionId(null);
    navigation.goBack();
  };

  const handleContinuePractice = () => {
    completeActiveChallenge();
    setShowChallengeCompleteModal(false);
  };

  const resetSession = () => {
    endSession();
    startSession();
  };

  const accuracy =
    totalBags > 0 ? ((madeCount / totalBags) * 100).toFixed(1) : "0.0";

  const getRoundColor = (made: number) => {
    if (made === 4) return "bg-green-600";
    if (made === 0) return "bg-red-900/70";
    return "bg-yellow-600/70";
  };

  const getNumberButtonStyle = (n: number) => {
    if (n === 4) return "bg-green-600 border-2 border-green-400";
    if (n === 3) return "bg-emerald-700 border-2 border-emerald-500";
    if (n === 2) return "bg-yellow-700 border-2 border-yellow-500";
    if (n === 1) return "bg-orange-700 border-2 border-orange-500";
    return "bg-red-800/80 border-2 border-red-600";
  };

  return (
    <View className="flex-1 bg-gray-950">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">Bag Run</Text>
              <Text className="text-gray-400 text-xs">Enter results per round</Text>
            </View>
          </View>
          {sessionStarted && (
            <View className="flex-row items-center gap-4">
              {roundHistory.length > 0 && (
                <Pressable
                  onPress={undoLastRound}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="arrow-undo" size={18} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm">Undo</Text>
                </Pressable>
              )}
              <Pressable onPress={handleEndPress}>
                <Text className="text-red-500 font-semibold">End</Text>
              </Pressable>
            </View>
          )}
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {!sessionStarted ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-pink-600/20 rounded-full w-32 h-32 items-center justify-center mb-8">
                <Ionicons name="trophy" size={64} color="#ec4899" />
              </View>
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Bag Run Challenge
              </Text>
              <Text className="text-gray-400 text-center text-base leading-6 mb-4">
                Throw all 4 bags, then tap how many you made. Perfect rounds (4/4) keep your streak going — any miss resets it!
              </Text>

              {isBagRunChallenge && (
                <View className="bg-yellow-600/20 border border-yellow-500 rounded-xl p-4 mb-6 w-full">
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="flag" size={20} color="#eab308" />
                    <Text className="text-yellow-500 font-bold ml-2 text-lg">
                      Challenge Goal: {challengeTarget}+ Streak
                    </Text>
                  </View>
                  <Text className="text-yellow-400/80 text-sm text-center mt-2">
                    Complete a streak of {challengeTarget} bags to finish this challenge
                  </Text>
                </View>
              )}

              <Pressable
                onPress={startSession}
                className="bg-pink-600 px-12 py-4 rounded-full"
              >
                <Text className="text-white text-lg font-bold">
                  {isBagRunChallenge ? "Start Challenge" : "Start Practice"}
                </Text>
              </Pressable>

              {isBagRunChallenge && (
                <Pressable
                  onPress={() => {
                    cancelActiveChallenge();
                    navigation.goBack();
                  }}
                  className="mt-4"
                >
                  <Text className="text-gray-500 text-sm">Cancel Challenge</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="flex-1 px-4 py-5">
              {/* Challenge Progress Banner */}
              {isBagRunChallenge && (
                <View className="bg-yellow-600/20 border border-yellow-500 rounded-xl p-3 mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="flag" size={16} color="#eab308" />
                      <Text className="text-yellow-500 font-bold ml-2">
                        Goal: {challengeTarget}+ Streak
                      </Text>
                    </View>
                    <Text className="text-yellow-400">
                      {longestStreak}/{challengeTarget}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <View
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${Math.min((longestStreak / challengeTarget) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Current Streak Display */}
              <Animated.View
                style={[animatedStyle]}
                className="items-center mb-5"
              >
                <Text className="text-gray-400 text-base mb-1">
                  Current Streak
                </Text>
                <Text className="text-pink-500 text-7xl font-bold">
                  {consecutiveStreak}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">bags in a row</Text>
                {longestStreak > 0 && (
                  <Text className="text-gray-600 text-xs mt-1">
                    Best this session: {longestStreak}
                  </Text>
                )}
              </Animated.View>

              {/* Round Entry */}
              <View className="bg-gray-900 rounded-2xl p-5 mb-4">
                <Text className="text-gray-400 text-sm text-center mb-1">
                  Round {currentRound}
                </Text>
                <Text className="text-white text-center font-semibold mb-4">
                  How many bags did you make?
                </Text>
                <View className="flex-row gap-2">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => recordRound(n)}
                      className={`flex-1 py-5 rounded-xl items-center justify-center ${getNumberButtonStyle(n)}`}
                    >
                      <Text className="text-white text-2xl font-bold">{n}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text className="text-gray-600 text-xs text-center mt-3">
                  Only 4/4 keeps your streak alive
                </Text>
              </View>

              {/* Round History */}
              {roundMadeHistory.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs text-center mb-2">
                    Round History ({roundMadeHistory.length} rounds)
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 2, gap: 6 }}
                  >
                    {roundMadeHistory.map((made, idx) => (
                      <View
                        key={idx}
                        className={`w-12 h-12 rounded-lg items-center justify-center ${getRoundColor(made)}`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {made}/4
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Stats Row */}
              <View className="flex-row gap-3 mb-4">
                <View className="bg-gray-800 rounded-xl p-4 flex-1">
                  <Text className="text-gray-400 text-xs">Made / Total</Text>
                  <Text className="text-white text-xl font-bold mt-1">
                    {madeCount}/{totalBags}
                  </Text>
                </View>
                <View className="bg-gray-800 rounded-xl p-4 flex-1">
                  <Text className="text-gray-400 text-xs">Accuracy</Text>
                  <Text className="text-white text-xl font-bold mt-1">
                    {accuracy}%
                  </Text>
                </View>
                <View className="bg-gray-800 rounded-xl p-4 flex-1">
                  <Text className="text-gray-400 text-xs">Best Streak</Text>
                  <Text className="text-white text-xl font-bold mt-1">
                    {longestStreak}
                  </Text>
                </View>
              </View>

              {/* Reset Button */}
              <Pressable
                onPress={resetSession}
                className="py-3 border border-gray-700 rounded-xl items-center"
              >
                <Text className="text-gray-400 font-semibold">
                  Reset Session
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Challenge Complete Modal */}
      <Modal
        visible={showChallengeCompleteModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <View className="bg-gray-800 rounded-3xl p-8 w-full max-w-sm items-center">
            <View className="bg-green-600 rounded-full w-24 h-24 items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={64} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Challenge Complete!
            </Text>
            <Text className="text-gray-400 text-center mb-2">
              You hit a streak of {longestStreak} bags!
            </Text>
            <Text className="text-green-400 text-lg font-bold mb-6">
              Goal: {challengeTarget}+ Streak
            </Text>
            <View className="w-full gap-3">
              <Pressable
                onPress={handleChallengeComplete}
                className="bg-green-600 py-4 rounded-xl items-center w-full"
              >
                <Text className="text-white font-bold text-lg">Done</Text>
              </Pressable>
              <Pressable
                onPress={handleContinuePractice}
                className="bg-gray-700 py-4 rounded-xl items-center w-full"
              >
                <Text className="text-white font-bold">Continue Practicing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exit Challenge Confirmation Modal */}
      <Modal
        visible={showExitConfirmModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <View className="bg-gray-800 rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-yellow-600/20 rounded-full w-16 h-16 items-center justify-center mb-4">
                <Ionicons name="warning" size={36} color="#eab308" />
              </View>
              <Text className="text-white text-xl font-bold text-center">
                Challenge Incomplete
              </Text>
            </View>
            <Text className="text-gray-400 text-center mb-2">
              You need {challengeTarget - longestStreak} more to reach your
              goal of {challengeTarget}+ streak.
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">
              Best streak this session: {longestStreak}
            </Text>
            <View className="gap-3">
              <Pressable
                onPress={handleResetChallenge}
                className="bg-yellow-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Reset & Try Again</Text>
              </Pressable>
              <Pressable
                onPress={handleExitAndCancel}
                className="bg-gray-700 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Exit Challenge</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowExitConfirmModal(false)}
                className="py-3 items-center"
              >
                <Text className="text-gray-400">Keep Practicing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
