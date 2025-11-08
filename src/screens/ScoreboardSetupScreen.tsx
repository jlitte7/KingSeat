import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type ScoreboardSetupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScoreboardSetup'>;

export default function ScoreboardSetupScreen() {
  const navigation = useNavigation<ScoreboardSetupNavigationProp>();
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [customRounds, setCustomRounds] = useState('10');

  const handleStartGame = () => {
    navigation.navigate('Scoreboard', {
      player1Name,
      player2Name,
      totalRounds: isUnlimited ? undefined : parseInt(customRounds) || 10,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Game Setup</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <View className="space-y-6">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Player 1 Name</Text>
              <TextInput
                value={player1Name}
                onChangeText={setPlayer1Name}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Player 2 Name</Text>
              <TextInput
                value={player2Name}
                onChangeText={setPlayer2Name}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-3">Game Length</Text>

              <Pressable
                onPress={() => setIsUnlimited(true)}
                className="flex-row items-center mb-3"
              >
                <View className={`w-5 h-5 rounded-full border-2 ${isUnlimited ? 'border-red-500 bg-red-500' : 'border-gray-600'} mr-3 items-center justify-center`}>
                  {isUnlimited && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                </View>
                <Text className="text-white">Unlimited Rounds (Play to 21)</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsUnlimited(false)}
                className="flex-row items-center"
              >
                <View className={`w-5 h-5 rounded-full border-2 ${!isUnlimited ? 'border-red-500 bg-red-500' : 'border-gray-600'} mr-3 items-center justify-center`}>
                  {!isUnlimited && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                </View>
                <Text className="text-white">Custom Rounds</Text>
              </Pressable>

              {!isUnlimited && (
                <View className="ml-8 mt-3">
                  <TextInput
                    value={customRounds}
                    onChangeText={setCustomRounds}
                    keyboardType="number-pad"
                    className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 border-t border-gray-800">
          <Pressable
            onPress={handleStartGame}
            className="bg-green-600 py-4 rounded-lg items-center"
          >
            <Text className="text-white font-bold text-lg">Start Game</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
