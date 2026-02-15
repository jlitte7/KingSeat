import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../state/offlineStore';
import { getOpenAIChatResponse } from './chat-service';
import { generateImage } from './image-generation';
import { transcribeAudio } from './transcribe-audio';

/**
 * Wrapper for AI chat with offline support
 */
export const chatWithAIOffline = async (
  message: string,
  options?: any
): Promise<string> => {
  const netInfo = await NetInfo.fetch();
  const isInternetReachable = netInfo.isInternetReachable ?? false;

  if (!isInternetReachable) {
    // Add to pending queue
    useOfflineStore.getState().addPendingAction('chat', { message, options });
    throw new Error('No internet connection. Your message will be sent when you are back online.');
  }

  try {
    const response = await getOpenAIChatResponse(message);
    return response.content;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper for image generation with offline support
 */
export const generateImageOffline = async (
  prompt: string,
  options?: any
): Promise<string> => {
  const netInfo = await NetInfo.fetch();
  const isInternetReachable = netInfo.isInternetReachable ?? false;

  if (!isInternetReachable) {
    useOfflineStore.getState().addPendingAction('generateImage', { prompt, options });
    throw new Error('No internet connection. Your image will be generated when you are back online.');
  }

  try {
    const imageUrl = await generateImage(prompt);
    return imageUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper for audio transcription with offline support
 */
export const transcribeAudioOffline = async (
  audioUri: string
): Promise<string> => {
  const netInfo = await NetInfo.fetch();
  const isInternetReachable = netInfo.isInternetReachable ?? false;

  if (!isInternetReachable) {
    useOfflineStore.getState().addPendingAction('transcribe', { audioUri });
    throw new Error('No internet connection. Your audio will be transcribed when you are back online.');
  }

  try {
    const transcription = await transcribeAudio(audioUri);
    return transcription;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic API call wrapper with caching
 */
export const apiCallWithCache = async <T,>(
  key: string,
  apiFn: () => Promise<T>,
  cacheMaxAge: number = 3600000 // 1 hour
): Promise<T> => {
  const netInfo = await NetInfo.fetch();
  const isInternetReachable = netInfo.isInternetReachable ?? false;
  const { getCachedData, cacheData } = useOfflineStore.getState();

  // Check cache
  const cached = getCachedData(key);
  if (cached && Date.now() - cached.timestamp < cacheMaxAge) {
    return cached.data as T;
  }

  // If offline, return cached data if available
  if (!isInternetReachable) {
    if (cached) {
      return cached.data as T;
    }
    throw new Error('No internet connection and no cached data available');
  }

  // Fetch fresh data
  try {
    const data = await apiFn();
    cacheData(key, data);
    return data;
  } catch (error) {
    // Fallback to cache if fetch fails
    if (cached) {
      return cached.data as T;
    }
    throw error;
  }
};
