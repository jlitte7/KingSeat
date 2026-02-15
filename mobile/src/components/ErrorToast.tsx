import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ErrorToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  visible,
  message,
  onDismiss,
  duration = 4000,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[animatedStyle, { top: insets.top + 8 }]}
      className="absolute left-4 right-4 z-50"
    >
      <View className="bg-red-600 rounded-xl px-4 py-3 flex-row items-center shadow-lg">
        <Text className="flex-1 text-white font-medium text-base">
          {message}
        </Text>
        <Pressable onPress={onDismiss} className="ml-2 p-1">
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
      </View>
    </Animated.View>
  );
};
