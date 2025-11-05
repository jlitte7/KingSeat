import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#1a1a1a', '#000000', '#7f1d1d']}
        style={{ flex: 1 }}
        className="items-center justify-center px-6"
      >
        <View className="mb-16">
          <Text className="text-7xl font-black text-center mb-4 text-transparent">
            <LinearGradient
              colors={['#ef4444', '#eab308']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text className="text-7xl font-black">TOSS</Text>
            </LinearGradient>
          </Text>
          <Text className="text-7xl font-black text-center text-white">SERIES</Text>
          <Text className="text-2xl text-center text-gray-300 mt-4">Ultimate Cornhole Tracker</Text>
        </View>

        <View className="w-full max-w-md space-y-4">
          <Pressable
            onPress={() => navigation.navigate('ScoreboardSetup')}
            className="w-full py-6 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={{ padding: 24, borderRadius: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-2xl">📊 Scoreboard</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Clubhouse')}
            className="w-full py-6 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#2563eb', '#1e40af']}
              style={{ padding: 24, borderRadius: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-2xl">🏆 Clubhouse</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('TossOff')}
            className="w-full py-6 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#16a34a', '#15803d']}
              style={{ padding: 24, borderRadius: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-2xl">🎯 TossOff</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('CornHub')}
            className="w-full py-6 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#ca8a04', '#a16207']}
              style={{ padding: 24, borderRadius: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-2xl">🌽 CornHub</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('CornholeIQ')}
            className="w-full py-6 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={['#7c3aed', '#6d28d9']}
              style={{ padding: 24, borderRadius: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-2xl">📈 CornholeIQ</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
