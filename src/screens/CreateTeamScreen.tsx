import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTossSeriesStore } from '../state/toss-series-store';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../components/AlertModal';

type CreateTeamNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTeam'>;

export default function CreateTeamScreen() {
  const navigation = useNavigation<CreateTeamNavigationProp>();
  const createTeam = useTossSeriesStore((s) => s.createTeam);
  const teams = useTossSeriesStore((s) => s.teams);
  const [teamName, setTeamName] = useState('');

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  const handleCreate = () => {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      setShowErrorAlert(true);
      return;
    }

    // Check for duplicate team names (case insensitive)
    const existingTeam = teams.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTeam) {
      setDuplicateName(existingTeam.name);
      setShowDuplicateAlert(true);
      return;
    }

    const team = createTeam(trimmedName);
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate('TeamDetail', { teamId: team.id });
    }, 100);
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
            <Text className="text-white text-xl font-bold">Create Team</Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-8">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Team Name</Text>
              <TextInput
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>
          </ScrollView>

          <View className="px-6 pb-6 pt-4 border-t border-gray-800">
            <Pressable
              onPress={handleCreate}
              disabled={!teamName.trim()}
              className={`py-4 rounded-lg items-center ${
                teamName.trim() ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <Text className="text-white font-bold text-lg">Create Team</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <AlertModal
        visible={showErrorAlert}
        title="Error"
        message="Please enter a team name"
        onClose={() => setShowErrorAlert(false)}
      />

      <AlertModal
        visible={showDuplicateAlert}
        title="Duplicate Name"
        message={`A team named "${duplicateName}" already exists. Please use a different name.`}
        onClose={() => setShowDuplicateAlert(false)}
      />
    </SafeAreaView>
  );
}
