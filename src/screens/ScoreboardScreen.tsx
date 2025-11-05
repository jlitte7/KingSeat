import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';

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
  const [showGameOver, setShowGameOver] = useState(false);

  const [p1BagsIn, setP1BagsIn] = useState(0);
  const [p1BagsOn, setP1BagsOn] = useState(0);
  const [p2BagsIn, setP2BagsIn] = useState(0);
  const [p2BagsOn, setP2BagsOn] = useState(0);

  const [rounds, setRounds] = useState<Round[]>([]);

  const p1RoundScore = p1BagsIn * 3 + p1BagsOn;
  const p2RoundScore = p2BagsIn * 3 + p2BagsOn;
  const roundDiff = Math.abs(p1RoundScore - p2RoundScore);
  const p1RoundPoints = p1RoundScore > p2RoundScore ? roundDiff : 0;
  const p2RoundPoints = p2RoundScore > p1RoundScore ? roundDiff : 0;

  const p1TotalScore = rounds.reduce((sum, r) => sum + r.p1Score, 0);
  const p2TotalScore = rounds.reduce((sum, r) => sum + r.p2Score, 0);

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

    return () => subscription?.remove();
  }, []);

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
    if (p1BagsIn === 4 || p2BagsIn === 4) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
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

  const resetGame = () => {
    navigation.goBack();
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
        <View className="bg-red-600 px-4 py-3">
          <View className="flex-row justify-between items-center">
            <Pressable onPress={resetGame} className="p-1.5">
              <Ionicons name="refresh" size={20} color="#fff" />
            </Pressable>
            <View className="items-center">
              <Text className="text-white text-lg font-bold">TOSS SERIES</Text>
              <Text className="text-white text-xs">
                {totalRounds ? `Round ${currentRound} of ${totalRounds}` : `Round ${currentRound}`}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowScoring(!showScoring)}
              className="bg-red-700 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-white text-sm font-bold">{showScoring ? 'X' : 'Edit'}</Text>
            </Pressable>
          </View>
        </View>

        {!showScoring && (
          <Pressable onPress={() => setShowScoring(true)} className="flex-1 justify-center">
            <View className="items-center">
              <View className="flex-row items-center gap-4 px-4">
                <View className="flex-1 items-center">
                  <Text className="text-red-500 text-2xl font-bold mb-2 uppercase">
                    {player1Name}
                  </Text>
                  <Text
                    className="font-black text-white"
                    style={{
                      fontSize: isLandscape ? 80 : 120,
                      textShadowColor: 'rgba(239, 68, 68, 0.6)',
                      textShadowOffset: { width: 0, height: 8 },
                      textShadowRadius: 30,
                    }}
                  >
                    {p1TotalScore}
                  </Text>
                </View>

                <Text className="text-gray-700 font-bold" style={{ fontSize: isLandscape ? 36 : 60 }}>
                  -
                </Text>

                <View className="flex-1 items-center">
                  <Text className="text-blue-500 text-2xl font-bold mb-2 uppercase">
                    {player2Name}
                  </Text>
                  <Text
                    className="font-black text-white"
                    style={{
                      fontSize: isLandscape ? 80 : 120,
                      textShadowColor: 'rgba(59, 130, 246, 0.6)',
                      textShadowOffset: { width: 0, height: 8 },
                      textShadowRadius: 30,
                    }}
                  >
                    {p2TotalScore}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-500 text-sm mt-4">Tap to enter score</Text>
            </View>

            {completedRounds > 0 && (
              <View className="px-4 mt-6">
                <View className="flex-row gap-2 max-w-4xl mx-auto">
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
              </View>
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
          style={{ pointerEvents: 'none' }}
        >
          <Animated.View entering={SlideInUp} className="items-center">
            <Text
              className="text-8xl font-black text-yellow-400"
              style={{
                textShadowColor: 'rgba(255, 215, 0, 0.8)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 30,
              }}
            >
              FOUR BAGGER!
            </Text>
            <Text className="text-6xl mt-4">🔥 💯 🎯</Text>
          </Animated.View>
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
    </View>
  );
}
