import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmModal } from '../components/ConfirmModal';

type TeamDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeamDetail'>;
type TeamDetailRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;

export default function TeamDetailScreen() {
  const navigation = useNavigation<TeamDetailNavigationProp>();
  const route = useRoute<TeamDetailRouteProp>();
  const { teamId } = route.params;
  const { getTeamById, deletePlayer } = useTossSeriesStore();

  const team = getTeamById(teamId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!team) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-xl">Team not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeletePlayer = (playerId: string, playerName: string) => {
    setPlayerToDelete({ id: playerId, name: playerName });
    setShowDeleteConfirm(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold" numberOfLines={1}>
              {team.name}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('AddPlayer', { teamId })}
            className="bg-green-600 px-4 py-2 rounded-lg ml-2"
          >
            <Text className="text-white font-bold">+ Player</Text>
          </Pressable>
        </View>

        <View className="px-4 py-4 bg-gray-800 border-b border-gray-700">
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs">Wins</Text>
              <Text className="text-white font-bold text-2xl">{team.stats.totalWins}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs">Losses</Text>
              <Text className="text-white font-bold text-2xl">{team.stats.totalLosses}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs">Games</Text>
              <Text className="text-white font-bold text-2xl">{team.stats.totalGames}</Text>
            </View>
          </View>
        </View>

        {team.players.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="person-add-outline" size={80} color="#4b5563" />
            <Text className="text-gray-400 text-xl font-bold text-center mt-4 mb-2">
              No Players Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Add players to this team to start tracking their stats
            </Text>
            <Pressable
              onPress={() => navigation.navigate('AddPlayer', { teamId })}
              className="bg-green-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Add Player</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 pt-4">
            <Text className="text-white font-bold mb-3">
              Players ({team.players.length})
            </Text>
            {team.players.map((player) => (
              <Pressable
                key={player.id}
                onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id })}
                className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{player.name}</Text>
                    {player.nickname && (
                      <Text className="text-gray-400 text-sm">{player.nickname}</Text>
                    )}
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeletePlayer(player.id, player.name);
                    }}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                </View>

                <View className="flex-row">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Games</Text>
                    <Text className="text-white font-bold">{player.stats.totalGames}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">W-L</Text>
                    <Text className="text-white font-bold">
                      {player.stats.totalWins}-{player.stats.totalLosses}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Bags In %</Text>
                    <Text className="text-white font-bold">
                      {player.stats.bagsInPercentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modals */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Player"
        message={`Are you sure you want to delete ${playerToDelete?.name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmDestructive={true}
        onConfirm={() => {
          if (playerToDelete) {
            deletePlayer(playerToDelete.id);
          }
          setShowDeleteConfirm(false);
          setPlayerToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPlayerToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}
