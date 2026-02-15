import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: false,
  isInternetReachable: false,
  connectionType: null,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setConnectionType(state.type);

      // Store offline status
      AsyncStorage.setItem('lastKnownNetworkStatus', JSON.stringify({
        isConnected: state.isConnected,
        timestamp: Date.now()
      }));
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, isInternetReachable, connectionType }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
