import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { Ionicons } from "@expo/vector-icons";

type EditRoundRouteProp = RouteProp<RootStackParamList, "EditRound">;
type EditRoundNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EditRound"
>;

export default function EditRoundScreen() {
  const navigation = useNavigation<EditRoundNavigationProp>();
  const route = useRoute<EditRoundRouteProp>();
  const { matchId, roundNumber } = route.params;

  const matches = usePersonalStatsStore((s) => s.matches);
  const editRound = usePersonalStatsStore((s) => s.editRound);

  const match = matches.find((m) => m.id === matchId);
  const round = match?.rounds.find((r) => r.roundNumber === roundNumber);

  const [myBagsIn, setMyBagsIn] = useState(round?.myBagsIn.toString() ?? "0");
  const [myBagsOn, setMyBagsOn] = useState(round?.myBagsOn.toString() ?? "0");
  const [oppBagsIn, setOppBagsIn] = useState(
    round?.opponentBagsIn.toString() ?? "0"
  );
  const [oppBagsOn, setOppBagsOn] = useState(
    round?.opponentBagsOn.toString() ?? "0"
  );

  if (!match || !round) {
    return (
      <View className="flex-1 bg-gray-900">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">Edit Round</Text>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-gray-400 text-lg text-center">
              Round not found
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleSave = () => {
    const myIn = parseInt(myBagsIn) || 0;
    const myOn = parseInt(myBagsOn) || 0;
    const oppIn = parseInt(oppBagsIn) || 0;
    const oppOn = parseInt(oppBagsOn) || 0;

    // Validate inputs
    if (myIn < 0 || myIn > 4 || myOn < 0 || myOn > 4) {
      return;
    }
    if (oppIn < 0 || oppIn > 4 || oppOn < 0 || oppOn > 4) {
      return;
    }
    if (myIn + myOn > 4 || oppIn + oppOn > 4) {
      return;
    }

    editRound(matchId, roundNumber, myIn, myOn, oppIn, oppOn);
    navigation.goBack();
  };

  const myInNum = parseInt(myBagsIn) || 0;
  const myOnNum = parseInt(myBagsOn) || 0;
  const oppInNum = parseInt(oppBagsIn) || 0;
  const oppOnNum = parseInt(oppBagsOn) || 0;

  const myRawScore = myInNum * 3 + myOnNum;
  const oppRawScore = oppInNum * 3 + oppOnNum;
  const myScore = Math.max(0, myRawScore - oppRawScore);
  const oppScore = Math.max(0, oppRawScore - myRawScore);

  const isValid =
    myInNum >= 0 &&
    myInNum <= 4 &&
    myOnNum >= 0 &&
    myOnNum <= 4 &&
    oppInNum >= 0 &&
    oppInNum <= 4 &&
    oppOnNum >= 0 &&
    oppOnNum <= 4 &&
    myInNum + myOnNum <= 4 &&
    oppInNum + oppOnNum <= 4;

  return (
    <View className="flex-1 bg-gray-900">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">Edit Round</Text>
              <Text className="text-gray-400 text-sm">Round {roundNumber}</Text>
            </View>
          </View>
          <Pressable
            onPress={handleSave}
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg ${
              isValid ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            <Text
              className={`font-bold ${
                isValid ? "text-white" : "text-gray-500"
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Your Performance */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">
              Your Performance
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-400 text-sm mb-2">Bags In Hole</Text>
                <TextInput
                  value={myBagsIn}
                  onChangeText={setMyBagsIn}
                  keyboardType="number-pad"
                  className="bg-gray-700 text-white text-2xl font-bold px-4 py-3 rounded-xl"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  maxLength={1}
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm mb-2">Bags On Board</Text>
                <TextInput
                  value={myBagsOn}
                  onChangeText={setMyBagsOn}
                  keyboardType="number-pad"
                  className="bg-gray-700 text-white text-2xl font-bold px-4 py-3 rounded-xl"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  maxLength={1}
                />
              </View>

              <View className="bg-gray-700 rounded-lg p-3 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-300 text-sm">Bags Missed</Text>
                  <Text className="text-red-400 font-bold text-xl">
                    {4 - myInNum - myOnNum}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-gray-300 text-sm">Raw Points</Text>
                  <Text className="text-white font-bold text-xl">
                    {myRawScore}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Opponent Performance */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-700">
            <Text className="text-white text-xl font-bold mb-4">
              Opponent Performance
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-400 text-sm mb-2">Bags In Hole</Text>
                <TextInput
                  value={oppBagsIn}
                  onChangeText={setOppBagsIn}
                  keyboardType="number-pad"
                  className="bg-gray-700 text-white text-2xl font-bold px-4 py-3 rounded-xl"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  maxLength={1}
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm mb-2">Bags On Board</Text>
                <TextInput
                  value={oppBagsOn}
                  onChangeText={setOppBagsOn}
                  keyboardType="number-pad"
                  className="bg-gray-700 text-white text-2xl font-bold px-4 py-3 rounded-xl"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  maxLength={1}
                />
              </View>

              <View className="bg-gray-700 rounded-lg p-3 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-300 text-sm">Bags Missed</Text>
                  <Text className="text-red-400 font-bold text-xl">
                    {4 - oppInNum - oppOnNum}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-gray-300 text-sm">Raw Points</Text>
                  <Text className="text-white font-bold text-xl">
                    {oppRawScore}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Round Score Preview */}
          <View className="bg-purple-600 rounded-2xl p-5 mb-6">
            <Text className="text-white text-center text-sm font-semibold mb-3 opacity-90">
              ROUND SCORE (AFTER CANCELLATION)
            </Text>
            <View className="flex-row justify-center items-center">
              <Text className="text-white text-5xl font-black">{myScore}</Text>
              <Text className="text-white text-3xl font-bold mx-4 opacity-70">
                -
              </Text>
              <Text className="text-white text-5xl font-black">{oppScore}</Text>
            </View>
          </View>

          {!isValid && (
            <View className="bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-xl p-4 mb-6">
              <Text className="text-red-400 text-center font-semibold">
                Invalid input: Each player must have 0-4 bags in and 0-4 bags on,
                with a total of no more than 4 bags per player.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
