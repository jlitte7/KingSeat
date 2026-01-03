import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
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

export default function BagRunScreen() {
  const navigation = useNavigation();
  const createSession = usePracticeStore((s) => s.createBagRunSession);
  const updateSession = usePracticeStore((s) => s.updateBagRunSession);
  const completeSession = usePracticeStore((s) => s.completeBagRunSession);

  // Challenge tracking
  const activeChallenge = useTrainingStore((s) => s.activeChallenge);
  const updateChallengeProgress = useTrainingStore((s) => s.updateChallengeProgress);
  const completeActiveChallenge = useTrainingStore((s) => s.completeActiveChallenge);
  const cancelActiveChallenge = useTrainingStore((s) => s.cancelActiveChallenge);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [bagsInRound, setBagsInRound] = useState(0);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalBags, setTotalBags] = useState(0);
  const [madeCount, setMadeCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showChallengeCompleteModal, setShowChallengeCompleteModal] = useState(false);

  const scale = useSharedValue(1);

  // Check if this is a bag run challenge
  const isBagRunChallenge = activeChallenge?.activityType === "bagRun";
  const challengeTarget = isBagRunChallenge ? activeChallenge.goalRequirement.target : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Update challenge progress when streak changes
  useEffect(() => {
    if (isBagRunChallenge && sessionStarted) {
      updateChallengeProgress(longestStreak);

      // Check if challenge goal is met
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
    setBagsInRound(0);
    setConsecutiveStreak(0);
    setLongestStreak(0);
    setTotalBags(0);
    setMadeCount(0);
  };

  const recordBag = (made: boolean) => {
    if (!sessionId) return;

    const newTotalBags = totalBags + 1;
    const newBagsInRound = bagsInRound + 1;

    let newConsecutiveStreak = consecutiveStreak;
    let newMadeCount = madeCount;

    if (made) {
      newConsecutiveStreak = consecutiveStreak + 1;
      newMadeCount = madeCount + 1;

      // Celebration animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      newConsecutiveStreak = 0;
    }

    const newLongestStreak = Math.max(longestStreak, newConsecutiveStreak);

    setTotalBags(newTotalBags);
    setMadeCount(newMadeCount);
    setConsecutiveStreak(newConsecutiveStreak);
    setLongestStreak(newLongestStreak);
    setBagsInRound(newBagsInRound);

    // Update session
    updateSession(sessionId, {
      totalBags: newTotalBags,
      madeCount: newMadeCount,
      consecutiveBags: newConsecutiveStreak,
      longestStreak: newLongestStreak,
      accuracy: (newMadeCount / newTotalBags) * 100,
    });

    // Check if round is complete (4 bags)
    if (newBagsInRound === 4) {
      setCurrentRound(currentRound + 1);
      setBagsInRound(0);
      updateSession(sessionId, {
        rounds: currentRound + 1,
      });
    }
  };

  const endSession = () => {
    if (sessionId) {
      completeSession(sessionId);
    }
    // If there's an active challenge that wasn't completed, cancel it
    if (isBagRunChallenge && longestStreak < challengeTarget) {
      cancelActiveChallenge();
    }
    setSessionStarted(false);
    setSessionId(null);
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

  const accuracy = totalBags > 0 ? ((madeCount / totalBags) * 100).toFixed(1) : "0.0";

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
              <View>
                <Text className="text-white text-xl font-bold">Bag Run</Text>
                <Text className="text-gray-400 text-xs">
                  4 bags per round
                </Text>
              </View>
            </View>
            {sessionStarted && (
              <Pressable onPress={endSession}>
                <Text className="text-red-500 font-semibold">End</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {!sessionStarted ? (
              /* Start Screen */
              <View className="flex-1 items-center justify-center px-6">
                <View className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full w-32 h-32 items-center justify-center mb-8">
                  <Ionicons name="trophy" size={64} color="#fff" />
                </View>
                <Text className="text-white text-3xl font-bold text-center mb-4">
                  Bag Run Challenge
                </Text>
                <Text className="text-gray-400 text-center text-base leading-6 mb-4">
                  Track how many consecutive bags you can make in a row. Each
                  round consists of 4 bags. Your streak resets if you miss!
                </Text>

                {/* Active Challenge Goal Banner */}
                {isBagRunChallenge && (
                  <View className="bg-yellow-600/20 border border-yellow-500 rounded-xl p-4 mb-6 w-full">
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="flag" size={20} color="#eab308" />
                      <Text className="text-yellow-500 font-bold ml-2 text-lg">
                        Challenge Goal: {challengeTarget}+ Streak
                      </Text>
                    </View>
                    <Text className="text-yellow-400/80 text-sm text-center mt-2">
                      Complete a streak of {challengeTarget} bags to complete this challenge
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
              /* Active Session */
              <View className="flex-1 px-4 py-6">
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
                    {/* Progress bar */}
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

                {/* Current Streak - Big Display */}
                <Animated.View
                  style={[animatedStyle]}
                  className="items-center mb-8"
                >
                  <Text className="text-gray-400 text-lg mb-2">
                    Current Streak
                  </Text>
                  <Text className="text-pink-500 text-7xl font-bold">
                    {consecutiveStreak}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2">bags in a row</Text>
                </Animated.View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm">Round</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {currentRound}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Bag {bagsInRound + 1} of 4
                    </Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm">Best Streak</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {longestStreak}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">personal best</Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm">Total Made</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {madeCount}/{totalBags}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">bags</Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm">Accuracy</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {accuracy}%
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">overall</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="gap-3">
                  <Pressable
                    onPress={() => recordBag(true)}
                    className="bg-green-600 py-6 rounded-2xl items-center"
                  >
                    <Ionicons name="checkmark-circle" size={48} color="#fff" />
                    <Text className="text-white text-2xl font-bold mt-2">
                      Made It!
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => recordBag(false)}
                    className="bg-red-600 py-6 rounded-2xl items-center"
                  >
                    <Ionicons name="close-circle" size={48} color="#fff" />
                    <Text className="text-white text-2xl font-bold mt-2">
                      Missed
                    </Text>
                  </Pressable>
                </View>

                {/* Reset Button */}
                <Pressable
                  onPress={resetSession}
                  className="mt-6 py-3 border border-gray-700 rounded-xl items-center"
                >
                  <Text className="text-gray-400 font-semibold">
                    Reset Session
                  </Text>
                </Pressable>

                {/* Info */}
                <View className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                  <Text className="text-blue-400 text-sm text-center">
                    Keep your streak alive! Missing a bag resets your consecutive count.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>

        {/* Challenge Complete Modal */}
        <Modal visible={showChallengeCompleteModal} transparent animationType="fade">
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
      </View>
    </TouchableWithoutFeedback>
  );
}
