import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTournamentStore } from "../state/tournament-store";
import { TournamentFormat, TournamentType } from "../types/tournament";
import { AlertModal } from "../components/AlertModal";

type CreateTournamentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateTournament"
>;

export default function CreateTournamentScreen() {
  const navigation = useNavigation<CreateTournamentScreenNavigationProp>();
  const createTournament = useTournamentStore((s) => s.createTournament);

  const [name, setName] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("blind-draw-doubles");
  const [type, setType] = useState<TournamentType>("local");
  const [useSkillTiers, setUseSkillTiers] = useState(false);
  const [minTeams, setMinTeams] = useState("6");
  const [pointsToWin, setPointsToWin] = useState("21");

  const [showNameRequiredAlert, setShowNameRequiredAlert] = useState(false);

  const formats: { value: TournamentFormat; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      value: "blind-draw-doubles",
      label: "Blind Draw Doubles",
      desc: "Random team generation with skill tier balancing",
      icon: "shuffle",
    },
    {
      value: "switcholio",
      label: "Switcholio",
      desc: "Rotate partners each game for individual rankings",
      icon: "repeat",
    },
    {
      value: "round-robin",
      label: "Round Robin",
      desc: "Everyone plays everyone once",
      icon: "grid",
    },
    {
      value: "single-elimination",
      label: "Single Elimination",
      desc: "Lose once and you're out",
      icon: "git-branch",
    },
    {
      value: "double-elimination",
      label: "Double Elimination",
      desc: "Second chance bracket for losers",
      icon: "git-network",
    },
  ];

  const types: { value: TournamentType; label: string; desc: string }[] = [
    { value: "local", label: "Local", desc: "Local community event" },
    { value: "regional", label: "Regional", desc: "Regional championship" },
    { value: "open", label: "Open", desc: "Open to all players" },
  ];

  const handleCreate = () => {
    if (!name.trim()) {
      setShowNameRequiredAlert(true);
      return;
    }

    const minTeamsNum = parseInt(minTeams) || 6;
    const pointsNum = parseInt(pointsToWin) || 21;

    const tournamentId = createTournament(name.trim(), format, type, {
      useSkillTiers,
      minTeamsRequired: minTeamsNum,
      pointsToWin: pointsNum,
    });

    navigation.navigate("TournamentDetail", { tournamentId });
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/10">
            <View className="flex-row items-center flex-1">
              <Pressable onPress={() => navigation.goBack()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Text className="text-white text-xl font-bold">
                Create Tournament
              </Text>
            </View>
            <Pressable
              onPress={handleCreate}
              className="bg-purple-600 rounded-xl px-4 py-2"
            >
              <Text className="text-white text-sm font-bold">Create</Text>
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Tournament Name */}
            <View className="py-4">
              <Text className="text-white text-lg font-bold mb-3">
                Tournament Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter tournament name"
                placeholderTextColor="#6b7280"
                className="bg-white/5 rounded-xl px-4 py-3 text-white text-base border border-white/10"
              />
            </View>

            {/* Format Selection */}
            <View className="py-4">
              <Text className="text-white text-lg font-bold mb-3">
                Tournament Format
              </Text>
              <View className="space-y-3">
                {formats.map((f) => (
                  <Pressable
                    key={f.value}
                    onPress={() => setFormat(f.value)}
                    className={`rounded-xl p-4 border ${
                      format === f.value
                        ? "bg-purple-600/20 border-purple-600"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`rounded-full p-3 mr-3 ${
                          format === f.value
                            ? "bg-purple-600"
                            : "bg-white/10"
                        }`}
                      >
                        <Ionicons
                          name={f.icon}
                          size={20}
                          color={format === f.value ? "#fff" : "#a78bfa"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-bold mb-1 ${
                            format === f.value
                              ? "text-purple-300"
                              : "text-white"
                          }`}
                        >
                          {f.label}
                        </Text>
                        <Text className="text-gray-400 text-xs">{f.desc}</Text>
                      </View>
                      {format === f.value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#a78bfa"
                        />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Type Selection */}
            <View className="py-4">
              <Text className="text-white text-lg font-bold mb-3">
                Tournament Type
              </Text>
              <View className="flex-row gap-3">
                {types.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => setType(t.value)}
                    className={`flex-1 rounded-xl p-4 border ${
                      type === t.value
                        ? "bg-purple-600/20 border-purple-600"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <Text
                      className={`font-bold text-center mb-1 ${
                        type === t.value ? "text-purple-300" : "text-white"
                      }`}
                    >
                      {t.label}
                    </Text>
                    <Text className="text-gray-400 text-xs text-center">
                      {t.desc}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Settings */}
            <View className="py-4">
              <Text className="text-white text-lg font-bold mb-3">
                Settings
              </Text>

              {/* Skill Tiers */}
              {(format === "blind-draw-doubles" || format === "switcholio") && (
                <Pressable
                  onPress={() => setUseSkillTiers(!useSkillTiers)}
                  className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-white font-semibold mb-1">
                      Use Skill Tiers (A/B/C)
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Balance teams by pairing A with C, then A with B, etc.
                    </Text>
                  </View>
                  <View
                    className="w-12 h-7 rounded-full p-1"
                    style={{
                      backgroundColor: useSkillTiers ? "#7c3aed" : "#374151",
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full bg-white"
                      style={{
                        transform: [{ translateX: useSkillTiers ? 20 : 0 }],
                      }}
                    />
                  </View>
                </Pressable>
              )}

              {/* Min Teams */}
              <View className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10">
                <Text className="text-gray-400 text-sm mb-2">
                  Minimum Teams (ACL Compliance)
                </Text>
                <TextInput
                  value={minTeams}
                  onChangeText={setMinTeams}
                  keyboardType="numeric"
                  className="text-white text-base"
                />
              </View>

              {/* Points to Win */}
              <View className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Text className="text-gray-400 text-sm mb-2">
                  Points to Win
                </Text>
                <TextInput
                  value={pointsToWin}
                  onChangeText={setPointsToWin}
                  keyboardType="numeric"
                  className="text-white text-base"
                />
              </View>
            </View>

            {/* Info Box */}
            <View className="py-4 pb-8">
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#60a5fa" />
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-bold mb-2">
                      What happens next?
                    </Text>
                    <Text className="text-gray-400 text-sm leading-6">
                      After creating the tournament, you&apos;ll be able to register
                      players, check them in, and generate teams. The format you
                      select determines how teams are created and games are
                      scheduled.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Modals */}
      <AlertModal
        visible={showNameRequiredAlert}
        title="Name Required"
        message="Please enter a tournament name"
        onClose={() => setShowNameRequiredAlert(false)}
      />
    </View>
  );
}
