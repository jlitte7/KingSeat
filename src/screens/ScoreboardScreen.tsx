import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
  FadeInUp,
  ZoomIn,
  RotateInDownLeft,
  RotateInDownRight,
  BounceIn
} from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';

type ScoreboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scoreboard'>;
type ScoreboardScreenRouteProp = RouteProp<RootStackParamList, 'Scoreboard'>;

interface Round {
  p1In: number;
  p1On: number;
  p2In: number;
  p2On: number;
  p1Score: number;
  p2Score: number;
}

export default function ScoreboardScreen() {
  const navigation = useNavigation<ScoreboardScreenNavigationProp>();
  const route = useRoute<ScoreboardScreenRouteProp>();
  const { player1Name, player2Name, totalRounds } = route.params;

  const [showScoring, setShowScoring] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlayerName, setCelebrationPlayerName] = useState<string>('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [showRoundHistory, setShowRoundHistory] = useState(false);
  const [showStatsCollapsed, setShowStatsCollapsed] = useState(false);

  const [p1BagsIn, setP1BagsIn] = useState(0);
  const [p1BagsOn, setP1BagsOn] = useState(0);
  const [p2BagsIn, setP2BagsIn] = useState(0);
  const [p2BagsOn, setP2BagsOn] = useState(0);

  const [rounds, setRounds] = useState<Round[]>([]);

  // Audio players for celebration and scoring sounds
  const celebrationAudio = useAudioPlayer(require('../../assets/voice-1762370065630.mp3'));
  const scoreAudio = useAudioPlayer(require('../../assets/voice-1762370065630.mp3'));

  const p1RoundScore = p1BagsIn * 3 + p1BagsOn;
  const p2RoundScore = p2BagsIn * 3 + p2BagsOn;
  const roundDiff = Math.abs(p1RoundScore - p2RoundScore);
  const p1RoundPoints = p1RoundScore > p2RoundScore ? roundDiff : 0;
  const p2RoundPoints = p2RoundScore > p1RoundScore ? roundDiff : 0;

  const p1TotalScore = rounds.reduce((sum, r) => sum + r.p1Score, 0);
  const p2TotalScore = rounds.reduce((sum, r) => sum + r.p2Score, 0);

  // Game continues past 21 - no "exactly 21" rule
  const gameWon = p1TotalScore >= 21 || p2TotalScore >= 21;

  const completedRounds = rounds.length;
  const p1PPR = completedRounds > 0 ? (p1TotalScore / completedRounds).toFixed(1) : '0.0';
  const p2PPR = completedRounds > 0 ? (p2TotalScore / completedRounds).toFixed(1) : '0.0';

  const totalP1BagsIn = rounds.reduce((sum, r) => sum + r.p1In, 0);
  const totalP2BagsIn = rounds.reduce((sum, r) => sum + r.p2In, 0);
  const totalP1BagsOn = rounds.reduce((sum, r) => sum + r.p1On, 0);
  const totalP2BagsOn = rounds.reduce((sum, r) => sum + r.p2On, 0);
  const p1FourBaggers = rounds.filter((r) => r.p1In === 4).length;
  const p2FourBaggers = rounds.filter((r) => r.p2In === 4).length;

  const p1BagsInPct = completedRounds > 0 ? ((totalP1BagsIn / (completedRounds * 4)) * 100).toFixed(1) : '0.0';
  const p2BagsInPct = completedRounds > 0 ? ((totalP2BagsIn / (completedRounds * 4)) * 100).toFixed(1) : '0.0';
  const p1BagsOnPct = completedRounds > 0 ? ((totalP1BagsOn / (completedRounds * 4)) * 100).toFixed(1) : '0.0';
  const p2BagsOnPct = completedRounds > 0 ? ((totalP2BagsOn / (completedRounds * 4)) * 100).toFixed(1) : '0.0';
  const p1FourBaggerPct = completedRounds > 0 ? ((p1FourBaggers / completedRounds) * 100).toFixed(1) : '0.0';
  const p2FourBaggerPct = completedRounds > 0 ? ((p2FourBaggers / completedRounds) * 100).toFixed(1) : '0.0';

  const isGameOver = (totalRounds && currentRound > totalRounds) || gameWon;

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription?.remove();
    };
  }, []);

  const playSound = async (type: 'celebrate' | 'score') => {
    try {
      if (type === 'celebrate') {
        celebrationAudio.play();
      } else {
        scoreAudio.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const setBagCount = (player: number, type: 'in' | 'on', value: number) => {
    if (player === 1) {
      if (type === 'in') {
        setP1BagsIn(Math.min(value, 4 - p1BagsOn));
      } else {
        setP1BagsOn(Math.min(value, 4 - p1BagsIn));
      }
    } else {
      if (type === 'in') {
        setP2BagsIn(Math.min(value, 4 - p2BagsOn));
      } else {
        setP2BagsOn(Math.min(value, 4 - p2BagsIn));
      }
    }
  };

  const nextRound = () => {
    // Check for four-bagger and play celebration sound
    if (p1BagsIn === 4) {
      setCelebrationPlayerName(player1Name);
      setShowCelebration(true);
      playSound('celebrate');
      setTimeout(() => setShowCelebration(false), 3000);
    } else if (p2BagsIn === 4) {
      setCelebrationPlayerName(player2Name);
      setShowCelebration(true);
      playSound('celebrate');
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      // Play regular scoring sound
      playSound('score');
    }

    const newRound: Round = {
      p1In: p1BagsIn,
      p1On: p1BagsOn,
      p2In: p2BagsIn,
      p2On: p2BagsOn,
      p1Score: p1RoundPoints,
      p2Score: p2RoundPoints,
    };

    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);

    const newP1Total = updatedRounds.reduce((sum, r) => sum + r.p1Score, 0);
    const newP2Total = updatedRounds.reduce((sum, r) => sum + r.p2Score, 0);

    setP1BagsIn(0);
    setP1BagsOn(0);
    setP2BagsIn(0);
    setP2BagsOn(0);
    setShowScoring(false);

    if (newP1Total >= 21 || newP2Total >= 21) {
      setShowGameOver(true);
    } else if (!totalRounds || currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    } else {
      setShowGameOver(true);
    }
  };

  const undoLastRound = () => {
    if (rounds.length === 0) return;

    const newRounds = rounds.slice(0, -1);
    setRounds(newRounds);
    setCurrentRound(Math.max(1, currentRound - 1));
  };

  const resetGame = () => {
    navigation.goBack();
  };

  const switchToTapMode = () => {
    navigation.replace('TapScoreboard', {
      player1Name,
      player2Name,
      totalRounds,
    });
  };

  const BagCounter = ({
    label,
    count,
    onSelect,
    color,
    disabled,
  }: {
    label: string;
    count: number;
    onSelect: (num: number) => void;
    color: string;
    disabled?: (num: number) => boolean;
  }) => (
    <View className="items-center gap-1">
      <Text className={`text-xs font-bold ${color}`}>{label}</Text>
      <View className="gap-0.5">
        {[0, 1, 2, 3, 4].map((num) => (
          <Pressable
            key={num}
            onPress={() => onSelect(num)}
            disabled={disabled && disabled(num)}
            className={`rounded-lg font-bold ${
              isLandscape ? 'w-9 h-4' : 'w-14 h-12'
            } items-center justify-center ${
              num === count
                ? 'bg-gray-900 border-2 border-gray-700'
                : disabled && disabled(num)
                ? 'bg-gray-800 border-2 border-gray-700'
                : 'bg-gray-700 border-2 border-gray-600'
            }`}
          >
            <Text
              className={`font-bold ${isLandscape ? 'text-xs' : 'text-2xl'} ${
                num === count
                  ? 'text-white'
                  : disabled && disabled(num)
                  ? 'text-gray-600'
                  : 'text-gray-400'
              }`}
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="bg-red-600 px-4 py-2">
          <View className="flex-row justify-between items-center mb-1">
            <Pressable onPress={resetGame} className="p-1.5 w-20">
              <Ionicons name="refresh" size={24} color="#fff" />
            </Pressable>
            <View className="items-center flex-1 flex-row justify-center gap-2">
              <Image
                source={require('../../assets/image-1762388037.png')}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
              <Text className="text-white text-xl font-bold tracking-wider">KINGSEAT</Text>
            </View>
            <View className="w-20 items-end">
              <Pressable
                onPress={switchToTapMode}
                className="bg-red-700 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-xs font-bold">Tap Mode</Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <Pressable
              onPress={undoLastRound}
              disabled={rounds.length === 0}
              className={`flex-row items-center gap-1 px-2 py-1 rounded ${
                rounds.length === 0 ? 'opacity-30' : ''
              }`}
            >
              <Ionicons name="arrow-undo" size={16} color="#fff" />
              <Text className="text-white text-xs font-bold">Undo</Text>
            </Pressable>
            <Text className="text-white text-center text-xs font-semibold">
              {totalRounds ? `Round ${currentRound} of ${totalRounds}` : `Round ${currentRound}`}
            </Text>
            <Pressable
              onPress={() => setShowStatsCollapsed(!showStatsCollapsed)}
              className="flex-row items-center gap-1 px-2 py-1 rounded"
            >
              <Ionicons name={showStatsCollapsed ? 'chevron-down' : 'chevron-up'} size={16} color="#fff" />
              <Text className="text-white text-xs font-bold">Stats</Text>
            </Pressable>
          </View>
        </View>

        {!showScoring && (
          <Pressable onPress={() => setShowScoring(true)} className="flex-1 justify-center items-center">
            <View className="items-center w-full">
              <View className="flex-row items-center justify-center w-full px-4">
                <View className="flex-1 items-center">
                  {isLandscape && (
                    <Text className="text-red-500 font-bold uppercase tracking-wide text-base mb-2">
                      {player1Name}
                    </Text>
                  )}
                  <View style={{ minWidth: isLandscape ? 200 : 280 }}>
                    <Text
                      className="font-black text-white text-center"
                      style={{
                        fontSize: isLandscape ? 140 : 220,
                        textShadowColor: 'rgba(239, 68, 68, 0.6)',
                        textShadowOffset: { width: 0, height: 8 },
                        textShadowRadius: 30,
                        lineHeight: isLandscape ? 140 : 220,
                      }}
                    >
                      {p1TotalScore}
                    </Text>
                  </View>
                  <View className={`h-px bg-red-500 ${isLandscape ? 'w-2/3' : 'w-3/4'} my-2`} />
                  {!isLandscape && (
                    <Text className="text-red-500 font-bold uppercase tracking-wide text-xl">
                      {player1Name}
                    </Text>
                  )}
                </View>

                <Text className="text-gray-700 font-bold px-4" style={{ fontSize: isLandscape ? 60 : 100 }}>
                  -
                </Text>

                <View className="flex-1 items-center">
                  {isLandscape && (
                    <Text className="text-blue-500 font-bold uppercase tracking-wide text-base mb-2">
                      {player2Name}
                    </Text>
                  )}
                  <View style={{ minWidth: isLandscape ? 200 : 280 }}>
                    <Text
                      className="font-black text-white text-center"
                      style={{
                        fontSize: isLandscape ? 140 : 220,
                        textShadowColor: 'rgba(59, 130, 246, 0.6)',
                        textShadowOffset: { width: 0, height: 8 },
                        textShadowRadius: 30,
                        lineHeight: isLandscape ? 140 : 220,
                      }}
                    >
                      {p2TotalScore}
                    </Text>
                  </View>
                  <View className={`h-px bg-blue-500 ${isLandscape ? 'w-2/3' : 'w-3/4'} my-2`} />
                  {!isLandscape && (
                    <Text className="text-blue-500 font-bold uppercase tracking-wide text-xl">
                      {player2Name}
                    </Text>
                  )}
                </View>
              </View>

              <Text className={`text-gray-500 ${isLandscape ? 'text-xs mt-3' : 'text-sm mt-6'}`}>Tap to enter score</Text>
            </View>

            {/* Collapsible Stats Section */}
            {showStatsCollapsed && completedRounds > 0 && (
              <Animated.View entering={FadeIn} exiting={FadeOut} className="px-4 mt-6 w-full">
                <View className="flex-row gap-2 max-w-4xl mx-auto mb-4">
                  <View className="flex-1 bg-gray-800 rounded-lg p-3 border border-red-600">
                    <Text className="text-red-500 text-sm font-bold mb-2 text-center">
                      {player1Name}
                    </Text>
                    <View className="space-y-1">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">PPR:</Text>
                        <Text className="text-white font-bold text-sm">{p1PPR}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">In:</Text>
                        <Text className="text-white font-bold text-sm">{p1BagsInPct}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">On:</Text>
                        <Text className="text-white font-bold text-sm">{p1BagsOnPct}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">4B:</Text>
                        <Text className="text-white font-bold text-sm">{p1FourBaggerPct}%</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 bg-gray-800 rounded-lg p-3 border border-blue-600">
                    <Text className="text-blue-500 text-sm font-bold mb-2 text-center">
                      {player2Name}
                    </Text>
                    <View className="space-y-1">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">PPR:</Text>
                        <Text className="text-white font-bold text-sm">{p2PPR}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">In:</Text>
                        <Text className="text-white font-bold text-sm">{p2BagsInPct}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">On:</Text>
                        <Text className="text-white font-bold text-sm">{p2BagsOnPct}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">4B:</Text>
                        <Text className="text-white font-bold text-sm">{p2FourBaggerPct}%</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Round History Button */}
                <Pressable
                  onPress={() => setShowRoundHistory(true)}
                  className="bg-gray-700 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="list" size={18} color="#fff" />
                  <Text className="text-white font-bold text-sm">View Round History</Text>
                </Pressable>
              </Animated.View>
            )}
          </Pressable>
        )}

        {showScoring && (
          <View className={`flex-1 items-center justify-center px-4 ${isLandscape ? 'py-2' : 'py-8'}`}>
            <View className="flex-row justify-around w-full max-w-2xl gap-4">
              <View className="items-center gap-1">
                <Text className={`font-bold text-red-500 ${isLandscape ? 'text-xs' : 'text-lg'}`}>
                  {player1Name}
                </Text>
                <View className="flex-row gap-2">
                  <BagCounter
                    label={isLandscape ? 'IN' : 'BAGS IN'}
                    count={p1BagsIn}
                    onSelect={(value) => setBagCount(1, 'in', value)}
                    disabled={(value) => value > 4 - p1BagsOn}
                    color="text-red-500"
                  />
                  <BagCounter
                    label={isLandscape ? 'ON' : 'BAGS ON'}
                    count={p1BagsOn}
                    onSelect={(value) => setBagCount(1, 'on', value)}
                    disabled={(value) => value > 4 - p1BagsIn}
                    color="text-red-500"
                  />
                </View>
              </View>

              <View className="items-center gap-1">
                <Text className={`font-bold text-blue-500 ${isLandscape ? 'text-xs' : 'text-lg'}`}>
                  {player2Name}
                </Text>
                <View className="flex-row gap-2">
                  <BagCounter
                    label={isLandscape ? 'IN' : 'BAGS IN'}
                    count={p2BagsIn}
                    onSelect={(value) => setBagCount(2, 'in', value)}
                    disabled={(value) => value > 4 - p2BagsOn}
                    color="text-blue-500"
                  />
                  <BagCounter
                    label={isLandscape ? 'ON' : 'BAGS ON'}
                    count={p2BagsOn}
                    onSelect={(value) => setBagCount(2, 'on', value)}
                    disabled={(value) => value > 4 - p2BagsIn}
                    color="text-blue-500"
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      {!isGameOver && showScoring && (
        <SafeAreaView edges={['bottom']} className="bg-gray-900 border-t border-gray-800">
          <View className="px-4 py-4 flex-row justify-center items-center gap-8">
            <Pressable
              onPress={() => {
                setP1BagsIn(0);
                setP1BagsOn(0);
                setP2BagsIn(0);
                setP2BagsOn(0);
                setShowScoring(false);
              }}
              className="px-6 py-3 rounded-full bg-red-600"
            >
              <Text className="text-white font-bold text-lg">Cancel</Text>
            </Pressable>

            <Pressable onPress={nextRound} className="px-6 py-3 rounded-full bg-green-600">
              <Text className="text-white font-bold text-lg">Enter</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {showCelebration && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute inset-0 items-center justify-center"
          style={{
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 215, 0, 0.15)'
          }}
        >
          {/* Background flash effects */}
          <Animated.View
            entering={FadeIn.duration(200)}
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
            }}
          />

          {/* Fireworks - Large bursts */}
          <Animated.Text
            entering={ZoomIn.duration(800).delay(100)}
            className="absolute top-24 left-12 text-7xl"
          >
            🎆
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(800).delay(200)}
            className="absolute top-24 right-12 text-7xl"
          >
            🎆
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(800).delay(300)}
            className="absolute bottom-32 left-16 text-7xl"
          >
            🎇
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(800).delay(400)}
            className="absolute bottom-32 right-16 text-7xl"
          >
            🎇
          </Animated.Text>

          {/* More fireworks scattered */}
          <Animated.Text
            entering={ZoomIn.duration(700).delay(250)}
            className="absolute top-40 left-28 text-6xl"
          >
            🎆
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(700).delay(350)}
            className="absolute top-40 right-28 text-6xl"
          >
            🎆
          </Animated.Text>

          {/* Particle effects - top corners */}
          <Animated.Text
            entering={RotateInDownLeft.duration(600).delay(100)}
            className="absolute top-20 left-8 text-6xl"
          >
            ⭐
          </Animated.Text>
          <Animated.Text
            entering={RotateInDownRight.duration(600).delay(150)}
            className="absolute top-20 right-8 text-6xl"
          >
            ⭐
          </Animated.Text>

          {/* Scattered fire emojis */}
          <Animated.Text
            entering={BounceIn.duration(800).delay(200)}
            className="absolute top-32 left-16 text-5xl"
          >
            🔥
          </Animated.Text>
          <Animated.Text
            entering={BounceIn.duration(800).delay(250)}
            className="absolute top-32 right-16 text-5xl"
          >
            🔥
          </Animated.Text>

          {/* Trophy/Medal emojis */}
          <Animated.Text
            entering={ZoomIn.duration(600).delay(300)}
            className="absolute top-44 left-24 text-4xl"
          >
            🏆
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(600).delay(350)}
            className="absolute top-44 right-24 text-4xl"
          >
            🏆
          </Animated.Text>

          {/* More particle effects - bottom */}
          <Animated.Text
            entering={BounceIn.duration(700).delay(400)}
            className="absolute bottom-40 left-12 text-5xl"
          >
            💯
          </Animated.Text>
          <Animated.Text
            entering={BounceIn.duration(700).delay(450)}
            className="absolute bottom-40 right-12 text-5xl"
          >
            💯
          </Animated.Text>

          {/* Target emojis */}
          <Animated.Text
            entering={ZoomIn.duration(600).delay(500)}
            className="absolute bottom-56 left-20 text-4xl"
          >
            🎯
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.duration(600).delay(550)}
            className="absolute bottom-56 right-20 text-4xl"
          >
            🎯
          </Animated.Text>

          {/* Center content with enhanced animations */}
          <Animated.View entering={SlideInUp.duration(500)} className="items-center">
            {/* Glowing background for text */}
            <View
              className="absolute inset-0 rounded-3xl"
              style={{
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 40,
              }}
            />

            <Animated.Text
              entering={ZoomIn.duration(600).delay(100)}
              className="text-8xl font-black text-yellow-400 text-center px-4 mb-2"
              style={{
                textShadowColor: 'rgba(255, 215, 0, 1)',
                textShadowOffset: { width: 0, height: 4 },
                textShadowRadius: 40,
              }}
            >
              {celebrationPlayerName}
            </Animated.Text>

            <Animated.Text
              entering={ZoomIn.duration(700).delay(200)}
              className="text-7xl font-black text-yellow-300 mb-3"
              style={{
                textShadowColor: 'rgba(255, 215, 0, 1)',
                textShadowOffset: { width: 0, height: 4 },
                textShadowRadius: 40,
              }}
            >
              FOUR BAGGER!
            </Animated.Text>

            <Animated.View
              entering={FadeInUp.duration(600).delay(400)}
              className="flex-row gap-4 mt-2"
            >
              <Text className="text-7xl">🔥</Text>
              <Text className="text-7xl">💯</Text>
              <Text className="text-7xl">🎯</Text>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.duration(600).delay(600)}
              className="text-3xl font-bold text-white mt-4 tracking-widest"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 10,
              }}
            >
              PERFECT ROUND!
            </Animated.Text>
          </Animated.View>

          {/* Additional scattered effects around the edges */}
          <Animated.Text
            entering={BounceIn.duration(800).delay(100)}
            className="absolute top-64 left-8 text-3xl"
          >
            ✨
          </Animated.Text>
          <Animated.Text
            entering={BounceIn.duration(800).delay(150)}
            className="absolute top-64 right-8 text-3xl"
          >
            ✨
          </Animated.Text>
          <Animated.Text
            entering={BounceIn.duration(800).delay(200)}
            className="absolute bottom-28 left-32 text-3xl"
          >
            ⚡
          </Animated.Text>
          <Animated.Text
            entering={BounceIn.duration(800).delay(250)}
            className="absolute bottom-28 right-32 text-3xl"
          >
            ⚡
          </Animated.Text>
        </Animated.View>
      )}

      <Modal visible={showGameOver} transparent animationType="fade">
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1 items-center justify-center px-6">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <Text className="text-4xl font-bold text-center mb-4 text-white">Game Over!</Text>
              <View className="items-center mb-6">
                <Text className="text-5xl font-bold mb-2 text-yellow-400">
                  {p1TotalScore > p2TotalScore ? player1Name : player2Name} Wins!
                </Text>
                <Text className="text-3xl text-gray-300">
                  {Math.max(p1TotalScore, p2TotalScore)} - {Math.min(p1TotalScore, p2TotalScore)}
                </Text>
              </View>

              <Pressable
                onPress={resetGame}
                className="w-full py-4 bg-green-600 rounded-lg items-center"
              >
                <Text className="text-white font-bold text-lg">New Game</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Round History Modal */}
      <Modal visible={showRoundHistory} transparent animationType="slide">
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 py-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-2xl font-bold">Round History</Text>
                <Pressable onPress={() => setShowRoundHistory(false)}>
                  <Ionicons name="close" size={32} color="#fff" />
                </Pressable>
              </View>

              <ScrollView className="flex-1">
                {rounds.map((round, index) => {
                  const roundNum = index + 1;
                  const p1RunningTotal = rounds.slice(0, index + 1).reduce((sum, r) => sum + r.p1Score, 0);
                  const p2RunningTotal = rounds.slice(0, index + 1).reduce((sum, r) => sum + r.p2Score, 0);

                  return (
                    <View key={index} className="bg-gray-800 rounded-lg p-4 mb-3">
                      <Text className="text-white text-lg font-bold mb-3 text-center">Round {roundNum}</Text>

                      <View className="flex-row justify-between gap-3">
                        {/* Player 1 */}
                        <View className="flex-1 bg-gray-700 rounded-lg p-3 border border-red-600">
                          <Text className="text-red-500 font-bold text-center mb-2">{player1Name}</Text>
                          <View className="space-y-1">
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">In:</Text>
                              <Text className="text-white font-bold text-sm">{round.p1In}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">On:</Text>
                              <Text className="text-white font-bold text-sm">{round.p1On}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">Points:</Text>
                              <Text className="text-green-400 font-bold text-sm">+{round.p1Score}</Text>
                            </View>
                            <View className="flex-row justify-between border-t border-gray-600 pt-1 mt-1">
                              <Text className="text-gray-300 text-sm font-bold">Total:</Text>
                              <Text className="text-white font-bold text-sm">{p1RunningTotal}</Text>
                            </View>
                          </View>
                        </View>

                        {/* Player 2 */}
                        <View className="flex-1 bg-gray-700 rounded-lg p-3 border border-blue-600">
                          <Text className="text-blue-500 font-bold text-center mb-2">{player2Name}</Text>
                          <View className="space-y-1">
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">In:</Text>
                              <Text className="text-white font-bold text-sm">{round.p2In}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">On:</Text>
                              <Text className="text-white font-bold text-sm">{round.p2On}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-gray-400 text-sm">Points:</Text>
                              <Text className="text-green-400 font-bold text-sm">+{round.p2Score}</Text>
                            </View>
                            <View className="flex-row justify-between border-t border-gray-600 pt-1 mt-1">
                              <Text className="text-gray-300 text-sm font-bold">Total:</Text>
                              <Text className="text-white font-bold text-sm">{p2RunningTotal}</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Four-bagger badge */}
                      {(round.p1In === 4 || round.p2In === 4) && (
                        <View className="mt-2 bg-yellow-500/20 border border-yellow-500 rounded-lg py-1 px-3">
                          <Text className="text-yellow-400 text-xs font-bold text-center">
                            ⭐ Four Bagger! ⭐
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
