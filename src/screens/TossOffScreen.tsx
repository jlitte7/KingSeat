import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TossOffScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">TossOff Tournaments</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="trophy-outline" size={80} color="#4b5563" />
          <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
            Coming Soon
          </Text>
          <Text className="text-gray-500 text-center">
            Tournament bracket system will be available in a future update
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
