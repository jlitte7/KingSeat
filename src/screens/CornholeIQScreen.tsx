import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';

export default function CornholeIQScreen() {
  const navigation = useNavigation();
  const { players } = useTossSeriesStore();

  const sortedPlayers = [...players].sort(
    (a, b) => b.stats.bagsInPercentage - a.stats.bagsInPercentage
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">CornholeIQ Stats</Text>
        </View>

        {players.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="stats-chart-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Stats Yet
            </Text>
            <Text className="text-gray-500 text-center">
              Create teams and play games to see player statistics
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            <Text className="text-white text-lg font-bold mb-4">Top Players</Text>
            {sortedPlayers.map((player, index) => (
              <View
                key={player.id}
                className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">#{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{player.name}</Text>
                    {player.nickname && (
                      <Text className="text-gray-400 text-sm">{player.nickname}</Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-2">
                    <Text className="text-gray-400 text-xs">Games</Text>
                    <Text className="text-white font-bold">{player.stats.totalGames}</Text>
                  </View>
                  <View className="w-1/2 mb-2">
                    <Text className="text-gray-400 text-xs">Win Rate</Text>
                    <Text className="text-white font-bold">
                      {player.stats.totalGames > 0
                        ? ((player.stats.totalWins / player.stats.totalGames) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </Text>
                  </View>
                  <View className="w-1/2 mb-2">
                    <Text className="text-gray-400 text-xs">Bags In</Text>
                    <Text className="text-white font-bold">
                      {player.stats.bagsInPercentage.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="w-1/2 mb-2">
                    <Text className="text-gray-400 text-xs">Four Baggers</Text>
                    <Text className="text-white font-bold">{player.stats.fourBaggers}</Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-gray-400 text-xs">PPR</Text>
                    <Text className="text-white font-bold">
                      {player.stats.averagePointsPerRound.toFixed(1)}
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-gray-400 text-xs">Win Streak</Text>
                    <Text className="text-white font-bold">
                      {player.stats.longestWinStreak}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
