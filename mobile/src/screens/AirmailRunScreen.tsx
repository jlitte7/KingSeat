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
import { usePracticeStore } from "../state/practice-store";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";

export default function AirmailRunScreen() {
  const navigation = useNavigation();
  const createSession = usePracticeStore((s) => s.createAirmailRunSession);
  const updateSession = usePracticeStore((s) => s.updateAirmailRunSession);
  const completeSession = usePracticeStore((s) => s.completeAirmailRunSession);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [bagsInRound, setBagsInRound] = useState(0);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalBags, setTotalBags] = useState(0);
  const [airmailCount, setAirmailCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startSession = () => {
    const session = createSession();
    setSessionId(session.id);
    setSessionStarted(true);
    setCurrentRound(1);
    setBagsInRound(0);
    setConsecutiveStreak(0);
    setLongestStreak(0);
    setTotalBags(0);
    setAirmailCount(0);
  };

  const recordBag = (airmail: boolean) => {
    if (!sessionId) return;

    const newTotalBags = totalBags + 1;
    const newBagsInRound = bagsInRound + 1;

    let newConsecutiveStreak = consecutiveStreak;
    let newAirmailCount = airmailCount;

    if (airmail) {
      newConsecutiveStreak = consecutiveStreak + 1;
      newAirmailCount = airmailCount + 1;

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
    setAirmailCount(newAirmailCount);
    setConsecutiveStreak(newConsecutiveStreak);
    setLongestStreak(newLongestStreak);
    setBagsInRound(newBagsInRound);

    // Update session
    updateSession(sessionId, {
      totalBags: newTotalBags,
      airmailCount: newAirmailCount,
      consecutiveAirmails: newConsecutiveStreak,
      longestStreak: newLongestStreak,
      accuracy: (newAirmailCount / newTotalBags) * 100,
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
    setSessionStarted(false);
    setSessionId(null);
  };

  const resetSession = () => {
    endSession();
    startSession();
  };

  const accuracy =
    totalBags > 0 ? ((airmailCount / totalBags) * 100).toFixed(1) : "0.0";

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
                <Text className="text-white text-xl font-bold">Airmail Run</Text>
                <Text className="text-gray-400 text-xs">
                  Clean drops only
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
                <View className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-32 h-32 items-center justify-center mb-8">
                  <Ionicons name="airplane" size={64} color="#fff" />
                </View>
                <Text className="text-white text-3xl font-bold text-center mb-4">
                  Airmail Challenge
                </Text>
                <Text className="text-gray-400 text-center text-base leading-6 mb-8">
                  Track consecutive airmail shots without touching the board.
                  Each round is 4 bags. Only clean drops count!
                </Text>
                <Pressable
                  onPress={startSession}
                  className="bg-cyan-600 px-12 py-4 rounded-full"
                >
                  <Text className="text-white text-lg font-bold">
                    Start Practice
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* Active Session */
              <View className="flex-1 px-4 py-6">
                {/* Current Streak - Big Display */}
                <Animated.View
                  style={[animatedStyle]}
                  className="items-center mb-8"
                >
                  <Text className="text-gray-400 text-lg mb-2">
                    Current Streak
                  </Text>
                  <Text className="text-cyan-500 text-7xl font-bold">
                    {consecutiveStreak}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2">
                    airmails in a row
                  </Text>
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
                    <Text className="text-gray-500 text-xs mt-1">
                      personal best
                    </Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm">Total Airmails</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {airmailCount}/{totalBags}
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
                    className="bg-cyan-600 py-6 rounded-2xl items-center"
                  >
                    <Ionicons name="airplane" size={48} color="#fff" />
                    <Text className="text-white text-2xl font-bold mt-2">
                      Airmail! 🎯
                    </Text>
                    <Text className="text-cyan-200 text-sm mt-1">
                      Clean drop in the hole
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => recordBag(false)}
                    className="bg-orange-600 py-6 rounded-2xl items-center"
                  >
                    <Ionicons name="close-circle" size={48} color="#fff" />
                    <Text className="text-white text-2xl font-bold mt-2">
                      Touched Board
                    </Text>
                    <Text className="text-orange-200 text-sm mt-1">
                      Hit the board or missed
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
                  <Text className="text-blue-400 text-sm text-center leading-5">
                    Airmail = bag goes directly into the hole without touching
                    the board. This is the ultimate accuracy challenge!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
