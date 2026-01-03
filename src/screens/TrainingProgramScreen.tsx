import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useTrainingStore, ProgramId, WorkoutDay, ActivityType, ActiveChallenge } from "../state/training-store";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TrainingProgramRouteProp = RouteProp<RootStackParamList, "TrainingProgram">;

const activityRoutes: Record<ActivityType, keyof RootStackParamList> = {
  bagRun: "BagRun",
  airmail: "AirmailRun",
  ghost: "GhostPlayer",
  situational: "SituationalGames",
  clutch: "PressurePractice",
};

const activityIcons: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  bagRun: "trophy",
  airmail: "airplane",
  ghost: "game-controller",
  situational: "flash",
  clutch: "flame",
};

const activityColors: Record<ActivityType, string> = {
  bagRun: "#f5576c",
  airmail: "#4facfe",
  ghost: "#667eea",
  situational: "#43e97b",
  clutch: "#ff9a56",
};

export default function TrainingProgramScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrainingProgramRouteProp>();
  const { programId } = route.params;

  const program = useTrainingStore((s) => s.getProgram(programId as ProgramId));
  const startProgram = useTrainingStore((s) => s.startProgram);
  const startChallenge = useTrainingStore((s) => s.startChallenge);
  const activeChallenge = useTrainingStore((s) => s.activeChallenge);
  const completeActivity = useTrainingStore((s) => s.completeActivity);
  const resetActivity = useTrainingStore((s) => s.resetActivity);
  const resetDay = useTrainingStore((s) => s.resetDay);
  const resetProgram = useTrainingStore((s) => s.resetProgram);
  const getProgramProgress = useTrainingStore((s) => s.getProgramProgress);

  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetDayModal, setShowResetDayModal] = useState(false);
  const [dayToReset, setDayToReset] = useState<number | null>(null);
  const [showResetActivityModal, setShowResetActivityModal] = useState(false);
  const [activityToReset, setActivityToReset] = useState<{ day: number; activityId: string; name: string } | null>(null);

  if (!program) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <Text className="text-white text-lg">Program not found</Text>
      </View>
    );
  }

  const progress = getProgramProgress(programId as ProgramId);

  const handleStartProgram = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startProgram(programId as ProgramId);
  };

  const handleActivityPress = (day: number, activityId: string, type: ActivityType, isCompleted: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Close the modal first, then navigate
    setSelectedDay(null);

    // If already completed, just navigate to the activity
    if (isCompleted) {
      const route = activityRoutes[type];
      (navigation.navigate as (route: keyof RootStackParamList) => void)(route);
      return;
    }

    // Start a challenge - this tracks what goal needs to be met
    startChallenge(programId as ProgramId, day, activityId);

    // Navigate to the activity
    const route = activityRoutes[type];
    (navigation.navigate as (route: keyof RootStackParamList) => void)(route);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetProgram(programId as ProgramId);
    setShowResetModal(false);
  };

  const handleResetDayPress = (day: number) => {
    setDayToReset(day);
    setShowResetDayModal(true);
  };

  const handleResetDay = () => {
    if (dayToReset !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      resetDay(programId as ProgramId, dayToReset);
      setShowResetDayModal(false);
      setDayToReset(null);
      setSelectedDay(null);
    }
  };

  const handleResetActivityPress = (day: number, activityId: string, name: string) => {
    setActivityToReset({ day, activityId, name });
    setShowResetActivityModal(true);
  };

  const handleResetActivity = () => {
    if (activityToReset) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      resetActivity(programId as ProgramId, activityToReset.day, activityToReset.activityId);
      setShowResetActivityModal(false);
      setActivityToReset(null);
      // Refresh selectedDay to show updated state
      const updatedProgram = useTrainingStore.getState().getProgram(programId as ProgramId);
      const updatedDay = updatedProgram?.days.find((d) => d.day === activityToReset.day);
      if (updatedDay) {
        setSelectedDay(updatedDay);
      }
    }
  };

  const renderDayCard = (day: WorkoutDay, index: number) => {
    const isCurrentDay = day.day === program.currentDay;
    const isLocked = day.day > program.currentDay && !program.started;
    const isPast = day.day < program.currentDay;
    const completedCount = day.activities.filter((a) => a.completed).length;
    const totalCount = day.activities.length;

    return (
      <Pressable
        key={day.day}
        onPress={() => {
          if (!isLocked || program.started) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedDay(day);
          }
        }}
        disabled={isLocked && !program.started}
        className={`mb-3 ${isLocked && !program.started ? "opacity-50" : ""}`}
      >
        <View
          className={`rounded-2xl p-4 border ${
            isCurrentDay
              ? "border-2"
              : day.completed
              ? "border-green-700/50"
              : "border-gray-700"
          } ${isCurrentDay ? "bg-gray-800" : "bg-gray-800/50"}`}
          style={isCurrentDay ? { borderColor: program.color } : undefined}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  day.completed
                    ? "bg-green-600"
                    : isCurrentDay
                    ? "bg-gray-700"
                    : "bg-gray-700/50"
                }`}
                style={isCurrentDay && !day.completed ? { backgroundColor: `${program.color}30` } : undefined}
              >
                {day.completed ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : (
                  <Text
                    className={`font-bold ${isCurrentDay ? "text-white" : "text-gray-400"}`}
                    style={isCurrentDay ? { color: program.color } : undefined}
                  >
                    {day.day}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{day.title}</Text>
                <Text className="text-gray-400 text-xs">{day.description}</Text>
              </View>
            </View>
            <View className="items-end">
              {isLocked && !program.started ? (
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
              ) : (
                <>
                  <Text className="text-gray-400 text-xs">
                    {completedCount}/{totalCount}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </>
              )}
            </View>
          </View>

          {/* Activity preview icons */}
          <View className="flex-row gap-2 mt-2">
            {day.activities.map((activity) => (
              <View
                key={activity.id}
                className={`w-8 h-8 rounded-lg items-center justify-center ${
                  activity.completed ? "bg-green-600/20" : "bg-gray-700/50"
                }`}
              >
                <Ionicons
                  name={activityIcons[activity.type]}
                  size={16}
                  color={activity.completed ? "#22c55e" : activityColors[activity.type]}
                />
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    );
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
              <Text className="text-white text-xl font-bold">{program.name}</Text>
              <Text className="text-gray-400 text-xs">
                {program.completed ? "Completed" : program.started ? `Day ${program.currentDay} of ${program.totalDays}` : "Not started"}
              </Text>
            </View>
          </View>
          {program.started && (
            <Pressable onPress={() => setShowResetModal(true)}>
              <Ionicons name="refresh" size={24} color="#6b7280" />
            </Pressable>
          )}
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Program Header */}
          <LinearGradient
            colors={[`${program.color}30`, "transparent"]}
            style={{ padding: 24, paddingBottom: 16 }}
          >
            <View className="items-center mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${program.color}30` }}
              >
                <Ionicons
                  name={program.icon as keyof typeof Ionicons.glyphMap}
                  size={40}
                  color={program.color}
                />
              </View>
              <Text className="text-white text-2xl font-bold text-center">
                {program.name}
              </Text>
              <Text className="text-gray-400 text-center mt-1">
                {program.description}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">Progress</Text>
                <Text className="text-white font-bold">{Math.round(progress)}%</Text>
              </View>
              <View className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: program.color,
                  }}
                />
              </View>
            </View>

            {/* Start/Continue Button */}
            {!program.started ? (
              <Pressable
                onPress={handleStartProgram}
                className="py-4 rounded-2xl items-center"
                style={{ backgroundColor: program.color }}
              >
                <Text className="text-white text-lg font-bold">Start Program</Text>
              </Pressable>
            ) : program.completed ? (
              <View className="bg-green-600/20 border border-green-600 rounded-2xl p-4 items-center">
                <Ionicons name="trophy" size={32} color="#22c55e" />
                <Text className="text-green-400 text-lg font-bold mt-2">
                  Program Complete!
                </Text>
                <Text className="text-green-300 text-sm">
                  Congratulations on finishing {program.name}
                </Text>
              </View>
            ) : null}
          </LinearGradient>

          {/* Daily Workouts */}
          <View className="px-4 py-3">
            <Text className="text-white text-lg font-bold mb-3">Daily Workouts</Text>
            {program.days.map((day, index) => renderDayCard(day, index))}
          </View>
        </ScrollView>

        {/* Day Detail Modal */}
        <Modal visible={!!selectedDay} transparent animationType="slide">
          <View className="flex-1 bg-black/90">
            <SafeAreaView className="flex-1">
              <View className="flex-1 px-4 py-4">
                <View className="flex-row justify-between items-center mb-6">
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      Day {selectedDay?.day}: {selectedDay?.title}
                    </Text>
                    <Text className="text-gray-400 mt-1">
                      {selectedDay?.description}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedDay(null)}>
                    <Ionicons name="close" size={32} color="#fff" />
                  </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  <Text className="text-gray-400 text-sm font-bold mb-3">
                    ACTIVITIES
                  </Text>
                  {selectedDay?.activities.map((activity) => (
                    <View key={activity.id} className="mb-3 flex-row items-center">
                      <TouchableOpacity
                        onPress={() =>
                          handleActivityPress(
                            selectedDay.day,
                            activity.id,
                            activity.type,
                            activity.completed
                          )
                        }
                        activeOpacity={0.7}
                        style={{ flex: 1 }}
                      >
                        <LinearGradient
                          colors={
                            activity.completed
                              ? ["#22c55e20", "#22c55e10"]
                              : [`${activityColors[activity.type]}20`, `${activityColors[activity.type]}10`]
                          }
                          style={{
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: activity.completed
                              ? "#22c55e50"
                              : `${activityColors[activity.type]}30`,
                          }}
                        >
                          <View className="flex-row items-center">
                            <View
                              className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                                activity.completed ? "bg-green-600" : "bg-gray-800"
                              }`}
                            >
                              {activity.completed ? (
                                <Ionicons name="checkmark" size={24} color="#fff" />
                              ) : (
                                <Ionicons
                                  name={activityIcons[activity.type]}
                                  size={24}
                                  color={activityColors[activity.type]}
                                />
                              )}
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`font-bold text-lg ${
                                  activity.completed ? "text-green-400" : "text-white"
                                }`}
                              >
                                {activity.name}
                              </Text>
                              <Text className="text-gray-400 text-sm">
                                {activity.description}
                              </Text>
                              {activity.goal && (
                                <View className="flex-row items-center mt-1">
                                  <Ionicons
                                    name="flag"
                                    size={12}
                                    color={activity.completed ? "#22c55e" : "#f59e0b"}
                                  />
                                  <Text
                                    className={`text-xs ml-1 ${
                                      activity.completed ? "text-green-400" : "text-yellow-500"
                                    }`}
                                  >
                                    {activity.goal}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={24}
                              color={activity.completed ? "#22c55e" : "#6b7280"}
                            />
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                      {activity.completed && (
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleResetActivityPress(selectedDay.day, activity.id, activity.name);
                          }}
                          activeOpacity={0.5}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={{
                            marginLeft: 8,
                            padding: 12,
                            backgroundColor: "#1f2937",
                            borderRadius: 12,
                          }}
                        >
                          <Ionicons name="refresh" size={22} color="#9ca3af" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Day completion status */}
                  {selectedDay?.completed && (
                    <View className="bg-green-600/20 border border-green-600 rounded-2xl p-4 items-center mt-4">
                      <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
                      <Text className="text-green-400 font-bold mt-2">
                        Day Complete!
                      </Text>
                    </View>
                  )}

                  {/* Reset Day Button - show if any activity is completed */}
                  {selectedDay && selectedDay.activities.some((a) => a.completed) && (
                    <TouchableOpacity
                      onPress={() => handleResetDayPress(selectedDay.day)}
                      activeOpacity={0.6}
                      style={{
                        marginTop: 16,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: "#4b5563",
                        borderRadius: 12,
                        alignItems: "center",
                      }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="refresh" size={18} color="#9ca3af" />
                        <Text className="text-gray-400 font-semibold ml-2">
                          Reset Day {selectedDay.day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Reset Day Confirmation Modal */}
        <Modal visible={showResetDayModal} transparent animationType="fade">
          <View className="flex-1 bg-black/90 items-center justify-center px-6">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-white text-xl font-bold text-center mb-2">
                Reset Day {dayToReset}?
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                This will reset all activities for this day. You can redo the challenges.
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowResetDayModal(false);
                    setDayToReset(null);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#374151",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetDay}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#ca8a04",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Reset Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Reset Activity Confirmation Modal */}
        <Modal visible={showResetActivityModal} transparent animationType="fade">
          <View className="flex-1 bg-black/90 items-center justify-center px-6">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-white text-xl font-bold text-center mb-2">
                Reset Challenge?
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                Reset {activityToReset?.name} so you can redo it.
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowResetActivityModal(false);
                    setActivityToReset(null);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#374151",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetActivity}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#ca8a04",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Reset Confirmation Modal */}
        <Modal visible={showResetModal} transparent animationType="fade">
          <View className="flex-1 bg-black/90 items-center justify-center px-6">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-white text-xl font-bold text-center mb-2">
                Reset Program?
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                This will reset all your progress in {program.name}. This action
                cannot be undone.
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowResetModal(false)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#374151",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReset}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#dc2626",
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-center font-bold">Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
