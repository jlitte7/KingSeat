import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  features: string[];
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const slides: OnboardingSlide[] = [
    {
      title: "Welcome to KingSeat",
      subtitle: "Ultimate Cornhole Experience",
      description: "The most comprehensive cornhole tracking app for players who take their game seriously",
      icon: "rocket",
      gradient: ["#6366f1", "#4f46e5", "#4338ca"],
      features: [
        "Track every throw with precision",
        "Build leagues and manage teams",
        "Elite practice modes"
      ]
    },
    {
      title: "Your Personal Stats",
      subtitle: "Track Every Bag",
      description: "Monitor your accuracy, streaks, and performance across all games - singles or doubles",
      icon: "stats-chart",
      gradient: ["#7c3aed", "#6d28d9", "#5b21b6"],
      features: [
        "Real-time accuracy tracking",
        "Streak counters and records",
        "Detailed match history"
      ]
    },
    {
      title: "Elite Training",
      subtitle: "CornHub Practice Facility",
      description: "Train like a champion with AI-powered insights and structured practice modes",
      icon: "barbell",
      gradient: ["#d97706", "#b45309", "#92400e"],
      features: [
        "Ghost player AI opponents",
        "Pressure situation training",
        "Performance analytics"
      ]
    },
    {
      title: "Ready to Dominate?",
      subtitle: "Let's Get Started",
      description: "Join thousands of players elevating their cornhole game",
      icon: "trophy",
      gradient: ["#059669", "#047857", "#065f46"],
      features: [
        "Start tracking in seconds",
        "No signup required",
        "All data stays on your device"
      ]
    }
  ];

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({ x: nextPage * width, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentPage(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          {/* Skip Button */}
          {currentPage < slides.length - 1 && (
            <View className="absolute top-16 right-6 z-10">
              <Pressable onPress={handleSkip}>
                <Text className="text-gray-400 text-base font-semibold">Skip</Text>
              </Pressable>
            </View>
          )}

          {/* Slides */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={{ flex: 1 }}
          >
            {slides.map((slide, index) => (
              <View key={index} style={{ width, flex: 1 }}>
                <View className="flex-1 px-8 justify-center">
                  {/* Icon */}
                  <View className="items-center mb-8">
                    <LinearGradient
                      colors={slide.gradient as [string, string, ...string[]]}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={slide.icon} size={70} color="#fff" />
                    </LinearGradient>
                  </View>

                  {/* Title */}
                  <Text className="text-white text-4xl font-black text-center mb-3">
                    {slide.title}
                  </Text>

                  {/* Subtitle */}
                  <Text className="text-gray-300 text-xl font-semibold text-center mb-4">
                    {slide.subtitle}
                  </Text>

                  {/* Description */}
                  <Text className="text-gray-400 text-base text-center leading-7 mb-8">
                    {slide.description}
                  </Text>

                  {/* Features */}
                  <View className="space-y-3 mb-8">
                    {slide.features.map((feature, fIndex) => (
                      <View key={fIndex} className="flex-row items-center justify-center">
                        <View className="bg-green-500/20 rounded-full p-1 mr-3">
                          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        </View>
                        <Text className="text-gray-300 text-base flex-1">
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Navigation */}
          <View className="px-8 pb-8">
            {/* Dots */}
            <View className="flex-row justify-center mb-6">
              {slides.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleDotPress(index)}
                  style={{
                    width: currentPage === index ? 32 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: currentPage === index ? "#6366f1" : "#374151",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>

            {/* Next/Get Started Button */}
            <Pressable
              onPress={handleNext}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <LinearGradient
                colors={currentPage === slides.length - 1
                  ? ["#059669", "#047857"] as const
                  : ["#6366f1", "#4f46e5"] as const}
                style={{
                  paddingVertical: 20,
                  alignItems: "center",
                }}
              >
                <Text className="text-white text-lg font-bold">
                  {currentPage === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Privacy Note */}
            {currentPage === slides.length - 1 && (
              <Text className="text-gray-500 text-xs text-center mt-4 leading-5">
                All your data stays on your device. No account required.
              </Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
