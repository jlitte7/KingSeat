import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { UserProfile, ProfileSettings, AVATAR_OPTIONS, COLOR_PRESETS } from "../types/profile";

interface ProfileState {
  profile: UserProfile;
  settings: ProfileSettings;

  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<ProfileSettings>) => void;
  resetProfile: () => void;

  // Helper functions
  getDisplayName: () => string;
}

const createInitialProfile = (): UserProfile => ({
  id: uuidv4(),
  name: "Player",
  bio: "",
  avatar: AVATAR_OPTIONS[0], // Default to crown
  favoriteColor: COLOR_PRESETS[0].value, // Default to Royal Purple
  joinDate: new Date().toISOString(),
});

const createInitialSettings = (): ProfileSettings => ({
  displayStatsOnProfile: true,
  shareableProfile: false,
  theme: "dark",
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: createInitialProfile(),
      settings: createInitialSettings(),

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      updateSettings: (updates: Partial<ProfileSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetProfile: () => {
        set({
          profile: createInitialProfile(),
          settings: createInitialSettings(),
        });
      },

      getDisplayName: () => {
        return get().profile.name || "Player";
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
