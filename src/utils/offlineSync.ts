import { useEffect, useCallback } from 'react';
import { useNetwork } from './network';
import { useOfflineStore } from '../state/offlineStore';

/**
 * Hook to handle syncing pending actions when online
 */
export const useOfflineSync = (
  syncHandler?: (actions: any[]) => Promise<void>
) => {
  const { isInternetReachable } = useNetwork();
  const pendingActions = useOfflineStore(s => s.pendingActions);
  const removePendingAction = useOfflineStore(s => s.removePendingAction);
  const clearPendingActions = useOfflineStore(s => s.clearPendingActions);
  const updateLastSync = useOfflineStore(s => s.updateLastSync);

  const syncPendingActions = useCallback(async () => {
    if (!isInternetReachable || pendingActions.length === 0) {
      return;
    }

    try {
      if (syncHandler) {
        await syncHandler(pendingActions);
      }
      // If successful, clear all pending actions
      clearPendingActions();
      updateLastSync();
    } catch (error) {
      console.error('Sync failed:', error);
      // Actions remain in queue for next sync attempt
    }
  }, [isInternetReachable, pendingActions, syncHandler, clearPendingActions, updateLastSync]);

  useEffect(() => {
    if (isInternetReachable && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isInternetReachable, syncPendingActions]);

  return { syncPendingActions, pendingCount: pendingActions.length };
};

/**
 * Hook to check if feature is available offline
 */
export const useOfflineCapable = (requiresNetwork: boolean = false) => {
  const { isInternetReachable } = useNetwork();

  return {
    isAvailable: requiresNetwork ? isInternetReachable : true,
    isOnline: isInternetReachable,
  };
};

/**
 * Hook to cache API responses
 */
export const useOfflineCache = () => {
  const cacheData = useOfflineStore(s => s.cacheData);
  const getCachedData = useOfflineStore(s => s.getCachedData);
  const { isInternetReachable } = useNetwork();

  const fetchWithCache = async <T,>(
    key: string,
    fetchFn: () => Promise<T>,
    maxAge: number = 3600000 // 1 hour default
  ): Promise<T> => {
    // Try cache first
    const cached = getCachedData(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data as T;
    }

    // If offline and have expired cache, return it anyway
    if (!isInternetReachable && cached) {
      return cached.data as T;
    }

    // Fetch fresh data
    if (isInternetReachable) {
      try {
        const data = await fetchFn();
        cacheData(key, data);
        return data;
      } catch (error) {
        // If fetch fails but we have cache, return cache
        if (cached) {
          return cached.data as T;
        }
        throw error;
      }
    }

    throw new Error('No internet connection and no cached data available');
  };

  return { fetchWithCache };
};
