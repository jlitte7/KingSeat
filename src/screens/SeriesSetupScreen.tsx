import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';

type SeriesSetupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SeriesSetup'>;

export default function SeriesSetupScreen() {
  const navigation = useNavigation<SeriesSetupNavigationProp>();
  const { teams, createSeries, setCurrentSeries } = useTossSeriesStore();
  const [awayTeamId, setAwayTeamId] = useState<string | null>(null);
  const [homeTeamId, setHomeTeamId] = useState<string | null>(null);

  const eligibleTeams = teams.filter((t) => t.players.length >= 2);

  const handleStartSeries = () => {
    if (awayTeamId && homeTeamId && awayTeamId !== homeTeamId) {
      const series = createSeries(homeTeamId, awayTeamId);
      setCurrentSeries(series);
      navigation.navigate('SeriesPlayerSelection', {
        seriesId: series.id,
        isAwayTeam: true,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">League Match Setup</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Away Team</Text>
            {eligibleTeams.length === 0 ? (
              <Text className="text-gray-400 text-center">
                No teams with at least 2 players available
              </Text>
            ) : (
              eligibleTeams.map((team) => (
                <Pressable
                  key={team.id}
                  onPress={() => setAwayTeamId(team.id)}
                  className={`mb-3 p-4 rounded-lg border-2 ${
                    awayTeamId === team.id
                      ? 'bg-blue-600/20 border-blue-600'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <Text className="text-white font-bold text-lg">{team.name}</Text>
                  <Text className="text-gray-400 text-sm">
                    {team.players.length} players
                  </Text>
                </Pressable>
              ))
            )}
          </View>

          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">Home Team</Text>
            {eligibleTeams.length === 0 ? (
              <Text className="text-gray-400 text-center">
                No teams with at least 2 players available
              </Text>
            ) : (
              eligibleTeams.map((team) => (
                <Pressable
                  key={team.id}
                  onPress={() => setHomeTeamId(team.id)}
                  disabled={team.id === awayTeamId}
                  className={`mb-3 p-4 rounded-lg border-2 ${
                    homeTeamId === team.id
                      ? 'bg-red-600/20 border-red-600'
                      : team.id === awayTeamId
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <Text
                    className={`font-bold text-lg ${
                      team.id === awayTeamId ? 'text-gray-600' : 'text-white'
                    }`}
                  >
                    {team.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {team.players.length} players
                  </Text>
                </Pressable>
              ))
            )}
          </View>

          <View className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
            <Text className="text-blue-300 text-sm font-bold mb-2">League Match Format:</Text>
            <Text className="text-blue-200 text-sm">• 12 games per series</Text>
            <Text className="text-blue-200 text-sm">• Players can play max 3 games</Text>
            <Text className="text-blue-200 text-sm">• Away team selects players first</Text>
            <Text className="text-blue-200 text-sm">• All games play to 21 points</Text>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <Pressable
            onPress={handleStartSeries}
            disabled={!awayTeamId || !homeTeamId || awayTeamId === homeTeamId}
            className={`py-4 rounded-lg items-center ${
              awayTeamId && homeTeamId && awayTeamId !== homeTeamId
                ? 'bg-green-600'
                : 'bg-gray-700'
            }`}
          >
            <Text className="text-white font-bold text-lg">Start League Match</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
