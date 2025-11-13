import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';

type CornholeIQNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CornholeIQ'>;

export default function CornholeIQScreen() {
  const navigation = useNavigation<CornholeIQNavigationProp>();
  const players = useTossSeriesStore((s) => s.players);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedPlayers = [...players].sort(
    (a, b) => (b.stats?.dominanceRating ?? 0) - (a.stats?.dominanceRating ?? 0)
  );

  // Filter players by search query
  const filteredPlayers = sortedPlayers.filter((player) => {
    if (searchQuery.trim() === "") return true;
    const query = searchQuery.toLowerCase();
    return player.name.toLowerCase().includes(query) ||
           player.nickname?.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
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
          <>
            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-gray-800">
              <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search players..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-white text-base"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
              <Text className="text-white text-lg font-bold mb-4">
                Top Players (by Dominance Rating)
              </Text>
              {filteredPlayers.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Ionicons name="search-outline" size={60} color="#4b5563" />
                  <Text className="text-gray-400 text-lg font-bold text-center mt-4">
                    No Results Found
                  </Text>
                  <Text className="text-gray-500 text-center mt-2">
                    No players match &quot;{searchQuery}&quot;
                  </Text>
                </View>
              ) : (
                filteredPlayers.map((player, index) => (
              <Pressable
                key={player.id}
                onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id })}
                className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">#{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{player.name}</Text>
                    {player.nickname && (
                      <Text className="text-gray-400 text-sm">{player.nickname}</Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-yellow-400 font-bold text-lg">
                      {(player.stats?.dominanceRating ?? 0).toFixed(1)}
                    </Text>
                    <Text className="text-gray-500 text-xs">Dominance</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap">
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">Record</Text>
                    <Text className="text-white font-bold">
                      {player.stats?.totalWins ?? 0}-{player.stats?.totalLosses ?? 0}
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">Win %</Text>
                    <Text className="text-white font-bold">
                      {(player.stats?.winPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">PPR</Text>
                    <Text className="text-white font-bold">
                      {(player.stats?.averagePointsPerRound ?? 0).toFixed(1)}
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">Bags In</Text>
                    <Text className="text-white font-bold">
                      {(player.stats?.bagsInPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">Board %</Text>
                    <Text className="text-white font-bold">
                      {(player.stats?.boardPercentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text className="text-gray-400 text-xs">Clutch</Text>
                    <Text className="text-white font-bold">
                      {(player.stats?.clutchFactor ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-end mt-1">
                  <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                </View>
              </Pressable>
            ))
              )}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
