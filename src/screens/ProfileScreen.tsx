import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "../state/profile-store";
import { usePersonalStatsStore } from "../state/personal-stats-store";
import { AVATAR_OPTIONS, COLOR_PRESETS } from "../types/profile";

const { width } = Dimensions.get("window");

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const settings = useProfileStore((s) => s.settings);
  const updateSettings = useProfileStore((s) => s.updateSettings);
  const personalStats = usePersonalStatsStore((s) => s.stats);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio || "");
  const [editLocation, setEditLocation] = useState(profile.location || "");
  const [editPlayingSince, setEditPlayingSince] = useState(profile.playingSince || "");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSave = () => {
    if (!editName.trim()) {
      Alert.alert("Name Required", "Please enter your name");
      return;
    }

    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      playingSince: editPlayingSince.trim(),
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setEditBio(profile.bio || "");
    setEditLocation(profile.location || "");
    setEditPlayingSince(profile.playingSince || "");
    setIsEditing(false);
  };

  const selectAvatar = (avatar: string) => {
    updateProfile({ avatar });
    setShowAvatarPicker(false);
  };

  const selectColor = (color: string) => {
    updateProfile({ favoriteColor: color });
    setShowColorPicker(false);
  };

  const getMemberSince = () => {
    const date = new Date(profile.joinDate);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0f0a1f", "#1a0f2e"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold flex-1">
              {isEditing ? "Edit Profile" : "My Profile"}
            </Text>
            {!isEditing ? (
              <Pressable onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={24} color="#7c3aed" />
              </Pressable>
            ) : (
              <View className="flex-row gap-3">
                <Pressable onPress={handleCancel}>
                  <Text className="text-gray-400 text-base font-semibold">Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave}>
                  <Text className="text-purple-500 text-base font-bold">Save</Text>
                </Pressable>
              </View>
            )}
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header Card */}
            <View className="px-6 mb-6">
              <LinearGradient
                colors={[profile.favoriteColor, "#000000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 24,
                  shadowColor: profile.favoriteColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                {/* Avatar */}
                <View className="items-center mb-4">
                  <Pressable
                    onPress={() => isEditing && setShowAvatarPicker(true)}
                    className="bg-white/20 rounded-full items-center justify-center mb-3"
                    style={{ width: 120, height: 120 }}
                  >
                    <Text style={{ fontSize: 64 }}>{profile.avatar}</Text>
                    {isEditing && (
                      <View className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2">
                        <Ionicons name="camera" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>

                  {isEditing ? (
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Your Name"
                      placeholderTextColor="#9ca3af"
                      className="text-white text-2xl font-black text-center bg-white/10 rounded-xl px-4 py-2 w-full"
                    />
                  ) : (
                    <Text className="text-white text-3xl font-black text-center">
                      {profile.name}
                    </Text>
                  )}

                  <Text className="text-white/60 text-sm mt-2">
                    Member since {getMemberSince()}
                  </Text>
                </View>

                {/* Bio */}
                {isEditing ? (
                  <TextInput
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    className="text-white text-base text-center bg-white/10 rounded-xl px-4 py-3 w-full"
                  />
                ) : profile.bio ? (
                  <Text className="text-white/80 text-base text-center">
                    {profile.bio}
                  </Text>
                ) : null}
              </LinearGradient>
            </View>

            {/* Quick Stats (if enabled) */}
            {settings.displayStatsOnProfile && personalStats.totalGames > 0 && (
              <View className="px-6 mb-6">
                <Text className="text-white text-lg font-bold mb-3">
                  Quick Stats
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {personalStats.totalGames}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Games Played</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {personalStats.winPercentage.toFixed(0)}%
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Win Rate</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {personalStats.bagsInPercentage.toFixed(0)}%
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Accuracy</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-white/5 rounded-xl p-4 border border-white/10">
                    <Text className="text-white text-2xl font-bold">
                      {personalStats.fourBaggers}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">Four Baggers</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Profile Details */}
            <View className="px-6 mb-6">
              <Text className="text-white text-lg font-bold mb-3">
                Profile Details
              </Text>

              {/* Location */}
              <View className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10">
                <Text className="text-gray-400 text-xs mb-2">Location</Text>
                {isEditing ? (
                  <TextInput
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="Where are you from?"
                    placeholderTextColor="#6b7280"
                    className="text-white text-base"
                  />
                ) : (
                  <Text className="text-white text-base">
                    {profile.location || "Not set"}
                  </Text>
                )}
              </View>

              {/* Playing Since */}
              <View className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10">
                <Text className="text-gray-400 text-xs mb-2">Playing Since</Text>
                {isEditing ? (
                  <TextInput
                    value={editPlayingSince}
                    onChangeText={setEditPlayingSince}
                    placeholder="What year did you start?"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    className="text-white text-base"
                  />
                ) : (
                  <Text className="text-white text-base">
                    {profile.playingSince || "Not set"}
                  </Text>
                )}
              </View>

              {/* Favorite Position */}
              <View className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Text className="text-gray-400 text-xs mb-2">Favorite Position</Text>
                {isEditing ? (
                  <View className="flex-row gap-2">
                    {(["pitcher", "blocker", "both"] as const).map((pos) => (
                      <Pressable
                        key={pos}
                        onPress={() => updateProfile({ favoritePosition: pos })}
                        className={`flex-1 py-2 px-3 rounded-lg ${
                          profile.favoritePosition === pos
                            ? "bg-purple-600"
                            : "bg-white/10"
                        }`}
                      >
                        <Text className="text-white text-sm text-center capitalize">
                          {pos}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text className="text-white text-base capitalize">
                    {profile.favoritePosition || "Not set"}
                  </Text>
                )}
              </View>
            </View>

            {/* Customization */}
            {isEditing && (
              <View className="px-6 mb-6">
                <Text className="text-white text-lg font-bold mb-3">
                  Customization
                </Text>

                {/* Favorite Color */}
                <Pressable
                  onPress={() => setShowColorPicker(!showColorPicker)}
                  className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between"
                >
                  <Text className="text-gray-400 text-sm">Theme Color</Text>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: profile.favoriteColor }}
                    />
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </View>
                </Pressable>

                {showColorPicker && (
                  <View className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10">
                    <View className="flex-row flex-wrap gap-3">
                      {COLOR_PRESETS.map((color) => (
                        <Pressable
                          key={color.value}
                          onPress={() => selectColor(color.value)}
                          className="items-center"
                          style={{ width: (width - 80) / 4 }}
                        >
                          <View
                            className="w-12 h-12 rounded-full mb-1"
                            style={{
                              backgroundColor: color.value,
                              borderWidth: profile.favoriteColor === color.value ? 3 : 0,
                              borderColor: "#fff",
                            }}
                          />
                          <Text className="text-white text-xs text-center">
                            {color.name.split(" ")[0]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
              <View className="px-6 mb-6">
                <View className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-base font-bold">
                      Choose Avatar
                    </Text>
                    <Pressable onPress={() => setShowAvatarPicker(false)}>
                      <Ionicons name="close" size={24} color="#9ca3af" />
                    </Pressable>
                  </View>
                  <View className="flex-row flex-wrap gap-3">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <Pressable
                        key={avatar}
                        onPress={() => selectAvatar(avatar)}
                        className="items-center justify-center bg-white/10 rounded-xl"
                        style={{
                          width: (width - 96) / 6,
                          height: (width - 96) / 6,
                          borderWidth: profile.avatar === avatar ? 2 : 0,
                          borderColor: profile.favoriteColor,
                        }}
                      >
                        <Text style={{ fontSize: 32 }}>{avatar}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Settings */}
            <View className="px-6 pb-8">
              <Text className="text-white text-lg font-bold mb-3">
                Settings
              </Text>

              <Pressable
                onPress={() =>
                  updateSettings({
                    displayStatsOnProfile: !settings.displayStatsOnProfile,
                  })
                }
                className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">
                    Display Stats
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Show quick stats on your profile
                  </Text>
                </View>
                <View
                  className="w-12 h-7 rounded-full p-1"
                  style={{
                    backgroundColor: settings.displayStatsOnProfile
                      ? profile.favoriteColor
                      : "#374151",
                  }}
                >
                  <View
                    className="w-5 h-5 rounded-full bg-white"
                    style={{
                      transform: [
                        {
                          translateX: settings.displayStatsOnProfile ? 20 : 0,
                        },
                      ],
                    }}
                  />
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
