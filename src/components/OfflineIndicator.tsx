import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useNetwork } from '../utils/network';
import { Ionicons } from '@expo/vector-icons';

export const OfflineIndicator: React.FC = () => {
  const { isInternetReachable } = useNetwork();
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (!isInternetReachable) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isInternetReachable]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      className="bg-amber-500 px-4 py-3 flex-row items-center justify-center"
    >
      <Ionicons name="cloud-offline" size={18} color="white" />
      <Text className="text-white font-semibold ml-2">
        You are offline
      </Text>
    </Animated.View>
  );
};

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "This feature requires an internet connection"
}) => {
  return (
    <View className="bg-gray-100 border border-gray-300 rounded-lg p-4 m-4 flex-row items-center">
      <Ionicons name="cloud-offline-outline" size={24} color="#6B7280" />
      <Text className="text-gray-700 ml-3 flex-1">
        {message}
      </Text>
    </View>
  );
};

interface OfflineGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresInternet?: boolean;
}

export const OfflineGuard: React.FC<OfflineGuardProps> = ({
  children,
  fallback,
  requiresInternet = true
}) => {
  const { isInternetReachable } = useNetwork();

  if (requiresInternet && !isInternetReachable) {
    return (
      <>
        {fallback || (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-lg font-semibold mt-4 text-center">
              No Internet Connection
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              This feature requires an active internet connection to work.
            </Text>
          </View>
        )}
      </>
    );
  }

  return <>{children}</>;
};
