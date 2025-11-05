import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTossSeriesStore } from '../state/toss-series-store';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type PlayerProfileRouteProp = RouteProp<RootStackParamList, 'PlayerProfile'>;

export default function PlayerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<PlayerProfileRouteProp>();
  const { playerId } = route.params;
  const { getPlayerById } = useTossSeriesStore();

  const player = getPlayerById(playerId);

  if (!player) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-xl">Player not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Player Profile</Text>
        </View>

        <ScrollView className="flex-1">
          <View className="px-4 py-6 bg-gray-800 border-b border-gray-700 items-center">
            <View className="w-24 h-24 rounded-full bg-purple-600 items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">{player.name[0]}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{player.name}</Text>
            {player.nickname && (
              <Text className="text-gray-400 text-lg mt-1">{player.nickname}</Text>
            )}
          </View>

          <View className="px-4 py-6">
            <Text className="text-white text-lg font-bold mb-4">Statistics</Text>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
              <Text className="text-gray-400 text-sm mb-3">Game Record</Text>
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text className="text-white text-2xl font-bold">{player.stats.totalGames}</Text>
                  <Text className="text-gray-400 text-xs">Games</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-green-500 text-2xl font-bold">{player.stats.totalWins}</Text>
                  <Text className="text-gray-400 text-xs">Wins</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-red-500 text-2xl font-bold">{player.stats.totalLosses}</Text>
                  <Text className="text-gray-400 text-xs">Losses</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
              <Text className="text-gray-400 text-sm mb-3">Accuracy</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Bags In %</Text>
                  <Text className="text-white font-bold">
                    {player.stats.bagsInPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Bags On %</Text>
                  <Text className="text-white font-bold">
                    {player.stats.bagsOnPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Four Baggers</Text>
                  <Text className="text-white font-bold">{player.stats.fourBaggers}</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
              <Text className="text-gray-400 text-sm mb-3">Performance</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Avg Points Per Round</Text>
                  <Text className="text-white font-bold">
                    {player.stats.averagePointsPerRound.toFixed(1)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Total Points</Text>
                  <Text className="text-white font-bold">{player.stats.totalPoints}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Longest Win Streak</Text>
                  <Text className="text-white font-bold">{player.stats.longestWinStreak}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Current Win Streak</Text>
                  <Text className="text-white font-bold">{player.stats.currentWinStreak}</Text>
                </View>
              </View>
            </View>

            {player.achievements.length > 0 && (
              <View className="bg-gray-800 rounded-lg p-4">
                <Text className="text-gray-400 text-sm mb-3">Achievements</Text>
                {player.achievements.map((achievement) => (
                  <View key={achievement.id} className="flex-row items-center mb-3">
                    <Text className="text-4xl mr-3">{achievement.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold">{achievement.title}</Text>
                      <Text className="text-gray-400 text-xs">{achievement.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
