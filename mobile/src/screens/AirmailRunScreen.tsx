import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
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
import * as Haptics from "expo-haptics";

interface RoundSnapshot {
  airmail: number;
  streakBefore: number;
  longestBefore: number;
  airmailCountBefore: number;
  totalBagsBefore: number;
}

export default function AirmailRunScreen() {
  const navigation = useNavigation();
  const createSession = usePracticeStore((s) => s.createAirmailRunSession);
  const updateSession = usePracticeStore((s) => s.updateAirmailRunSession);
  const completeSession = usePracticeStore((s) => s.completeAirmailRunSession);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalBags, setTotalBags] = useState(0);
  const [airmailCount, setAirmailCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [roundHistory, setRoundHistory] = useState<RoundSnapshot[]>([]);
  const [roundAirmailHistory, setRoundAirmailHistory] = useState<number[]>([]);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startSession = () => {
    const session = createSession();
    setSessionId(session.id);
    setSessionStarted(true);
    setCurrentRound(1);
    setConsecutiveStreak(0);
    setLongestStreak(0);
    setTotalBags(0);
    setAirmailCount(0);
    setRoundHistory([]);
    setRoundAirmailHistory([]);
  };

  const recordRound = (airmail: number) => {
    if (!sessionId) return;

    const snapshot: RoundSnapshot = {
      airmail,
      streakBefore: consecutiveStreak,
      longestBefore: longestStreak,
      airmailCountBefore: airmailCount,
      totalBagsBefore: totalBags,
    };

    const newStreak = airmail === 4 ? consecutiveStreak + 4 : 0;
    const newLongest = Math.max(longestStreak, newStreak);
    const newAirmail = airmailCount + airmail;
    const newTotal = totalBags + 4;
    const newRound = currentRound + 1;

    setRoundHistory((prev) => [...prev, snapshot]);
    setRoundAirmailHistory((prev) => [...prev, airmail]);
    setConsecutiveStreak(newStreak);
    setLongestStreak(newLongest);
    setAirmailCount(newAirmail);
    setTotalBags(newTotal);
    setCurrentRound(newRound);

    if (airmail === 4) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (airmail > 0) {
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
      airmailCount: newAirmail,
      consecutiveAirmails: newStreak,
      longestStreak: newLongest,
      accuracy: (newAirmail / newTotal) * 100,
      rounds: newRound,
    });
  };

  const undoLastRound = () => {
    if (roundHistory.length === 0) return;
    const snapshot = roundHistory[roundHistory.length - 1];

    setRoundHistory((prev) => prev.slice(0, -1));
    setRoundAirmailHistory((prev) => prev.slice(0, -1));
    setConsecutiveStreak(snapshot.streakBefore);
    setLongestStreak(snapshot.longestBefore);
    setAirmailCount(snapshot.airmailCountBefore);
    setTotalBags(snapshot.totalBagsBefore);
    setCurrentRound(currentRound - 1);

    if (sessionId) {
      updateSession(sessionId, {
        totalBags: snapshot.totalBagsBefore,
        airmailCount: snapshot.airmailCountBefore,
        consecutiveAirmails: snapshot.streakBefore,
        longestStreak: snapshot.longestBefore,
        accuracy:
          snapshot.totalBagsBefore > 0
            ? (snapshot.airmailCountBefore / snapshot.totalBagsBefore) * 100
            : 0,
        rounds: currentRound - 1,
      });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const getRoundColor = (airmail: number) => {
    if (airmail === 4) return "bg-cyan-600";
    if (airmail === 0) return "bg-red-900/70";
    return "bg-teal-700/70";
  };

  const getNumberButtonStyle = (n: number) => {
    if (n === 4) return "bg-cyan-600 border-2 border-cyan-400";
    if (n === 3) return "bg-teal-700 border-2 border-teal-500";
    if (n === 2) return "bg-blue-700 border-2 border-blue-500";
    if (n === 1) return "bg-indigo-700 border-2 border-indigo-500";
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
              <Text className="text-white text-xl font-bold">Airmail Run</Text>
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
              <Pressable onPress={endSession}>
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
              <View className="bg-cyan-600/20 rounded-full w-32 h-32 items-center justify-center mb-8">
                <Ionicons name="airplane" size={64} color="#06b6d4" />
              </View>
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Airmail Challenge
              </Text>
              <Text className="text-gray-400 text-center text-base leading-6 mb-8">
                Throw all 4 bags, then tap how many were clean airmails. Only 4/4 rounds keep your streak going!
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
            <View className="flex-1 px-4 py-5">
              {/* Current Streak Display */}
              <Animated.View
                style={[animatedStyle]}
                className="items-center mb-5"
              >
                <Text className="text-gray-400 text-base mb-1">
                  Current Streak
                </Text>
                <Text className="text-cyan-500 text-7xl font-bold">
                  {consecutiveStreak}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  airmails in a row
                </Text>
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
                  How many were airmail?
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
                  Only 4/4 airmail rounds continue your streak
                </Text>
              </View>

              {/* Round History */}
              {roundAirmailHistory.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs text-center mb-2">
                    Round History ({roundAirmailHistory.length} rounds)
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 2, gap: 6 }}
                  >
                    {roundAirmailHistory.map((airmail, idx) => (
                      <View
                        key={idx}
                        className={`w-12 h-12 rounded-lg items-center justify-center ${getRoundColor(airmail)}`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {airmail}/4
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Stats Row */}
              <View className="flex-row gap-3 mb-4">
                <View className="bg-gray-800 rounded-xl p-4 flex-1">
                  <Text className="text-gray-400 text-xs">Airmails / Total</Text>
                  <Text className="text-white text-xl font-bold mt-1">
                    {airmailCount}/{totalBags}
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

              {/* Info */}
              <View className="mt-4 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                <Text className="text-blue-400 text-sm text-center leading-5">
                  Airmail = bag goes directly into the hole without touching the board.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
