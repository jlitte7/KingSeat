import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';

type AddPlayerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPlayer'>;
type AddPlayerRouteProp = RouteProp<RootStackParamList, 'AddPlayer'>;

export default function AddPlayerScreen() {
  const navigation = useNavigation<AddPlayerNavigationProp>();
  const route = useRoute<AddPlayerRouteProp>();
  const { teamId } = route.params;
  const createPlayer = useTossSeriesStore((s) => s.createPlayer);
  const players = useTossSeriesStore((s) => s.players);
  const [playerName, setPlayerName] = useState('');
  const [nickname, setNickname] = useState('');

  const handleCreate = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter a player name");
      return;
    }

    // Check for duplicate names (case insensitive)
    const existingPlayer = players.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingPlayer) {
      Alert.alert(
        "Duplicate Name",
        `A player named "${existingPlayer.name}" already exists. Please use a different name or add a nickname to differentiate.`,
        [{ text: "OK" }]
      );
      return;
    }

    createPlayer(teamId, trimmedName, nickname.trim() || undefined);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
          <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Add Player</Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-8">
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">Player Name *</Text>
              <TextInput
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Enter player name"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Nickname (Optional)</Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Enter nickname"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </ScrollView>

          <View className="px-6 pb-6 pt-4 border-t border-gray-800">
            <Pressable
              onPress={handleCreate}
              disabled={!playerName.trim()}
              className={`py-4 rounded-lg items-center ${
                playerName.trim() ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              <Text className="text-white font-bold text-lg">Add Player</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
