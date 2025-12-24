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
import { usePracticeStore, PressureScenario } from "../state/practice-store";
import { LinearGradient } from "expo-linear-gradient";

const pressureScenarios: PressureScenario[] = [
  {
    name: "Game Winner",
    description: "You're at 18 points. Need 3+ points to win!",
    targetBagsIn: 1,
    targetBagsOn: 0,
    mustMake: 3,
  },
  {
    name: "Four-Bagger Clutch",
    description: "All 4 bags must go in. Can you do it?",
    targetBagsIn: 4,
    targetBagsOn: 0,
    mustMake: 12,
  },
  {
    name: "Comeback Round",
    description: "Down by 8. Need at least 2 bags in + 2 on board",
    targetBagsIn: 2,
    targetBagsOn: 2,
    mustMake: 8,
  },
  {
    name: "Consistency Test",
    description: "Get 3 bags in the hole this round",
    targetBagsIn: 3,
    targetBagsOn: 0,
    mustMake: 9,
  },
  {
    name: "No Misses",
    description: "All 4 bags must at least hit the board",
    targetBagsIn: 0,
    targetBagsOn: 4,
    mustMake: 4,
  },
  {
    name: "Perfect Closer",
    description: "Hit exactly 21. Need 2 in + 1 on = 7 points",
    targetBagsIn: 2,
    targetBagsOn: 1,
    mustMake: 7,
  },
];

export default function PressurePracticeScreen() {
  const navigation = useNavigation();
  const createPractice = usePracticeStore((s) => s.createPressurePractice);
  const recordAttempt = usePracticeStore((s) => s.recordPressureAttempt);
  const practices = usePracticeStore((s) => s.pressurePractices);

  const [selectedScenario, setSelectedScenario] = useState<PressureScenario | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [bagsIn, setBagsIn] = useState("");
  const [bagsOn, setBagsOn] = useState("");
  const [sessionStats, setSessionStats] = useState({ attempts: 0, successes: 0 });
  const [attemptHistory, setAttemptHistory] = useState<{ bagsIn: number; bagsOn: number; success: boolean }[]>([]);

  const startPractice = (scenario: PressureScenario) => {
    const practice = createPractice(scenario);
    setPracticeId(practice.id);
    setSelectedScenario(scenario);
    setSessionStats({ attempts: 0, successes: 0 });
    setAttemptHistory([]);
  };

  const submitAttempt = () => {
    if (!practiceId || !selectedScenario) return;

    const pIn = parseInt(bagsIn) || 0;
    const pOn = parseInt(bagsOn) || 0;

    if (pIn < 0 || pIn > 4 || pOn < 0 || pOn > 4 || pIn + pOn > 4) {
      return;
    }

    // Check if target was met
    const success =
      pIn >= selectedScenario.targetBagsIn && pOn >= selectedScenario.targetBagsOn;

    recordAttempt(practiceId, success);

    setSessionStats({
      attempts: sessionStats.attempts + 1,
      successes: success ? sessionStats.successes + 1 : sessionStats.successes,
    });

    setAttemptHistory((prev) => [...prev, { bagsIn: pIn, bagsOn: pOn, success }]);

    setBagsIn("");
    setBagsOn("");
    setShowInputModal(false);
    Keyboard.dismiss();
  };

  const endPractice = () => {
    setPracticeId(null);
    setSelectedScenario(null);
    setSessionStats({ attempts: 0, successes: 0 });
    setAttemptHistory([]);
  };

  const getScenarioStats = (scenario: PressureScenario) => {
    const scenarioPractices = practices.filter(
      (p) => p.scenario.name === scenario.name
    );

    if (scenarioPractices.length === 0) {
      return { attempts: 0, successRate: 0 };
    }

    const totalAttempts = scenarioPractices.reduce(
      (sum, p) => sum + p.attempts,
      0
    );
    const totalSuccesses = scenarioPractices.reduce(
      (sum, p) => sum + p.successes,
      0
    );

    return {
      attempts: totalAttempts,
      successRate: totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0,
    };
  };

  const sessionSuccessRate =
    sessionStats.attempts > 0
      ? ((sessionStats.successes / sessionStats.attempts) * 100).toFixed(0)
      : "0";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-950">
        <SafeAreaView edges={["top"]} className="flex-1">
          {/* Header */}
          <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => {
                  if (selectedScenario) {
                    endPractice();
                  } else {
                    navigation.goBack();
                  }
                }}
                className="mr-4"
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Text className="text-white text-xl font-bold">
                Pressure Practice
              </Text>
            </View>
            {selectedScenario && (
              <Pressable onPress={endPractice}>
                <Text className="text-red-500 font-semibold">End</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {!selectedScenario ? (
              /* Scenario Selection */
              <View className="flex-1 px-4 py-6">
                <Text className="text-white text-2xl font-bold mb-2">
                  Choose Your Challenge
                </Text>
                <Text className="text-gray-400 mb-6">
                  Practice high-pressure situations
                </Text>

                {pressureScenarios.map((scenario, index) => {
                  const stats = getScenarioStats(scenario);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => startPractice(scenario)}
                      className="mb-3"
                    >
                      <LinearGradient
                        colors={["#ff6a00", "#ff9a56"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                        }}
                      >
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1 mr-3">
                            <View className="flex-row items-center mb-2">
                              <Ionicons
                                name="flame"
                                size={20}
                                color="#fff"
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-white text-xl font-bold">
                                {scenario.name}
                              </Text>
                            </View>
                            <Text className="text-white text-sm opacity-90 mb-2">
                              {scenario.description}
                            </Text>
                            <Text className="text-white text-xs opacity-75">
                              Target: {scenario.targetBagsIn} in /{" "}
                              {scenario.targetBagsOn} on
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#fff"
                          />
                        </View>

                        {stats.attempts > 0 && (
                          <View className="bg-white/20 rounded-lg px-3 py-2">
                            <Text className="text-white text-xs font-semibold">
                              Your Stats: {stats.successRate.toFixed(0)}% success
                              ({stats.attempts} attempts)
                            </Text>
                          </View>
                        )}
                      </LinearGradient>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              /* Active Practice */
              <View className="flex-1 px-4 py-6">
                {/* Scenario Info */}
                <View className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-6 mb-8">
                  <View className="flex-row items-center mb-3">
                    <Ionicons
                      name="flame"
                      size={28}
                      color="#fb923c"
                      style={{ marginRight: 10 }}
                    />
                    <Text className="text-orange-400 font-bold text-xl flex-1">
                      {selectedScenario.name}
                    </Text>
                  </View>
                  <Text className="text-orange-300 text-base mb-4">
                    {selectedScenario.description}
                  </Text>
                  <View className="bg-orange-800/40 rounded-lg p-3">
                    <Text className="text-orange-200 text-sm font-semibold">
                      TARGET: {selectedScenario.targetBagsIn} bags in /{" "}
                      {selectedScenario.targetBagsOn} bags on
                    </Text>
                  </View>
                </View>

                {/* Session Stats */}
                <View className="flex-row gap-3 mb-8">
                  <View className="flex-1 bg-gray-800 rounded-xl p-4">
                    <Text className="text-gray-400 text-sm">Attempts</Text>
                    <Text className="text-white text-4xl font-bold mt-1">
                      {sessionStats.attempts}
                    </Text>
                  </View>
                  <View className="flex-1 bg-gray-800 rounded-xl p-4">
                    <Text className="text-gray-400 text-sm">Made</Text>
                    <Text className="text-white text-4xl font-bold mt-1">
                      {sessionStats.successes}
                    </Text>
                  </View>
                  <View className="flex-1 bg-gray-800 rounded-xl p-4">
                    <Text className="text-gray-400 text-sm">Success</Text>
                    <Text className="text-white text-4xl font-bold mt-1">
                      {sessionSuccessRate}%
                    </Text>
                  </View>
                </View>

                {/* Action Button */}
                <Pressable
                  onPress={() => setShowInputModal(true)}
                  className="bg-orange-600 py-8 rounded-2xl items-center"
                >
                  <Ionicons name="add-circle" size={56} color="#fff" />
                  <Text className="text-white text-2xl font-bold mt-3">
                    Record Attempt
                  </Text>
                </Pressable>

                {/* Attempt History */}
                {attemptHistory.length > 0 && (
                  <View className="mt-6 bg-gray-800 rounded-2xl p-4">
                    <Text className="text-white text-lg font-bold mb-3">
                      Attempt History
                    </Text>
                    {/* Header */}
                    <View className="flex-row items-center pb-2 mb-2 border-b border-gray-700">
                      <Text className="text-gray-400 text-xs font-semibold w-10">#</Text>
                      <Text className="text-gray-400 text-xs font-semibold flex-1 text-center">BAGS IN</Text>
                      <Text className="text-gray-400 text-xs font-semibold flex-1 text-center">BAGS ON</Text>
                      <Text className="text-gray-400 text-xs font-semibold flex-1 text-center">POINTS</Text>
                      <Text className="text-gray-400 text-xs font-semibold w-16 text-right">RESULT</Text>
                    </View>
                    {/* Attempts */}
                    {attemptHistory.map((attempt, index) => {
                      const points = attempt.bagsIn * 3 + attempt.bagsOn;
                      return (
                        <View
                          key={index}
                          className="flex-row items-center py-2 border-b border-gray-700/50"
                        >
                          <Text className="text-gray-300 text-sm font-bold w-10">
                            {index + 1}
                          </Text>
                          <Text className="text-blue-300 text-sm flex-1 text-center">
                            {attempt.bagsIn}
                          </Text>
                          <Text className="text-blue-300 text-sm flex-1 text-center">
                            {attempt.bagsOn}
                          </Text>
                          <Text className="text-gray-300 text-sm flex-1 text-center">
                            {points}
                          </Text>
                          <View className="w-16 items-end">
                            {attempt.success ? (
                              <View className="bg-green-600/30 rounded px-2 py-1">
                                <Text className="text-green-400 text-xs font-bold">
                                  MADE
                                </Text>
                              </View>
                            ) : (
                              <View className="bg-red-600/30 rounded px-2 py-1">
                                <Text className="text-red-400 text-xs font-bold">
                                  MISS
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Tips */}
                <View className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                  <Text className="text-blue-400 text-sm text-center leading-5">
                    Practice the same scenario multiple times to build muscle
                    memory and confidence in pressure situations.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Modal */}
          <Modal
            visible={showInputModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowInputModal(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowInputModal(false)}>
              <View className="flex-1 bg-black/70 justify-end">
                <TouchableWithoutFeedback>
                  <View className="bg-gray-900 rounded-t-3xl p-6">
                    <Text className="text-white text-2xl font-bold mb-2 text-center">
                      How Did You Do?
                    </Text>
                    {selectedScenario && (
                      <Text className="text-gray-400 text-sm text-center mb-6">
                        Target: {selectedScenario.targetBagsIn} in /{" "}
                        {selectedScenario.targetBagsOn} on
                      </Text>
                    )}

                    <View className="mb-6">
                      <Text className="text-gray-400 mb-2">Bags In</Text>
                      <TextInput
                        value={bagsIn}
                        onChangeText={setBagsIn}
                        keyboardType="number-pad"
                        placeholder="0-4"
                        placeholderTextColor="#6b7280"
                        className="bg-gray-800 text-white text-2xl font-bold p-4 rounded-xl text-center"
                        maxLength={1}
                      />
                    </View>

                    <View className="mb-6">
                      <Text className="text-gray-400 mb-2">Bags On</Text>
                      <TextInput
                        value={bagsOn}
                        onChangeText={setBagsOn}
                        keyboardType="number-pad"
                        placeholder="0-4"
                        placeholderTextColor="#6b7280"
                        className="bg-gray-800 text-white text-2xl font-bold p-4 rounded-xl text-center"
                        maxLength={1}
                      />
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setShowInputModal(false)}
                        className="flex-1 bg-gray-700 py-4 rounded-xl"
                      >
                        <Text className="text-white text-center font-bold">
                          Cancel
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={submitAttempt}
                        className="flex-1 bg-orange-600 py-4 rounded-xl"
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
