import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface OfflineStore {
  pendingActions: PendingAction[];
  cachedData: Record<string, any>;
  lastSync: number | null;

  // Actions
  addPendingAction: (type: string, payload: any) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;

  // Cache management
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearCache: () => void;

  // Sync
  updateLastSync: () => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      pendingActions: [],
      cachedData: {},
      lastSync: null,

      addPendingAction: (type: string, payload: any) => {
        const action: PendingAction = {
          id: `${Date.now()}-${Math.random()}`,
          type,
          payload,
          timestamp: Date.now(),
        };
        set(state => ({
          pendingActions: [...state.pendingActions, action],
        }));
      },

      removePendingAction: (id: string) => {
        set(state => ({
          pendingActions: state.pendingActions.filter(action => action.id !== id),
        }));
      },

      clearPendingActions: () => {
        set({ pendingActions: [] });
      },

      cacheData: (key: string, data: any) => {
        set(state => ({
          cachedData: {
            ...state.cachedData,
            [key]: {
              data,
              timestamp: Date.now(),
            },
          },
        }));
      },

      getCachedData: (key: string) => {
        return get().cachedData[key];
      },

      clearCache: () => {
        set({ cachedData: {} });
      },

      updateLastSync: () => {
        set({ lastSync: Date.now() });
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
