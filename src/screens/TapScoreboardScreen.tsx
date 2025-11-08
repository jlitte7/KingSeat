import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type TapScoreboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TapScoreboard'>;
type TapScoreboardScreenRouteProp = RouteProp<RootStackParamList, 'TapScoreboard'>;

interface Round {
  p1In: number;
  p1On: number;
  p2In: number;
  p2On: number;
  p1Score: number;
  p2Score: number;
}

type ScoreboardMode = 'tap' | 'bags';

export default function TapScoreboardScreen() {
  const navigation = useNavigation<TapScoreboardScreenNavigationProp>();
  const route = useRoute<TapScoreboardScreenRouteProp>();
  const { player1Name, player2Name, totalRounds } = route.params;

  const [mode, setMode] = useState<ScoreboardMode>('tap');
  const [currentRound, setCurrentRound] = useState(1);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Tap mode state
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // Bags mode state
  const [p1BagsIn, setP1BagsIn] = useState(0);
  const [p1BagsOn, setP1BagsOn] = useState(0);
  const [p2BagsIn, setP2BagsIn] = useState(0);
  const [p2BagsOn, setP2BagsOn] = useState(0);

  const [rounds, setRounds] = useState<Round[]>([]);

  const gameWon = p1Score >= 21 || p2Score >= 21;
  const completedRounds = rounds.length;

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => subscription?.remove();
  }, []);

  const handleTopHalfPress = (player: 1 | 2) => {
    if (gameWon) return;

    if (player === 1) {
      setP1Score(p1Score + 1);
    } else {
      setP2Score(p2Score + 1);
    }
  };

  const handleBottomHalfPress = (player: 1 | 2) => {
    if (gameWon) return;

    if (player === 1) {
      setP1Score(Math.max(0, p1Score - 1));
    } else {
      setP2Score(Math.max(0, p2Score - 1));
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
    const newRound: Round = {
      p1In: p1BagsIn,
      p1On: p1BagsOn,
      p2In: p2BagsIn,
      p2On: p2BagsOn,
      p1Score: p1BagsIn * 3 + p1BagsOn > p2BagsIn * 3 + p2BagsOn
        ? (p1BagsIn * 3 + p1BagsOn) - (p2BagsIn * 3 + p2BagsOn)
        : 0,
      p2Score: p2BagsIn * 3 + p2BagsOn > p1BagsIn * 3 + p1BagsOn
        ? (p2BagsIn * 3 + p2BagsOn) - (p1BagsIn * 3 + p1BagsOn)
        : 0,
    };

    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);

    // Add to scores
    setP1Score(p1Score + newRound.p1Score);
    setP2Score(p2Score + newRound.p2Score);

    // Reset bags
    setP1BagsIn(0);
    setP1BagsOn(0);
    setP2BagsIn(0);
    setP2BagsOn(0);

    setShowRoundSummary(false);

    const newP1Total = p1Score + newRound.p1Score;
    const newP2Total = p2Score + newRound.p2Score;

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

  const p1PPR = completedRounds > 0 ? (p1Score / completedRounds).toFixed(1) : '0.0';
  const p2PPR = completedRounds > 0 ? (p2Score / completedRounds).toFixed(1) : '0.0';

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="bg-gray-900 px-4 py-2 border-b border-gray-800">
          <View className="flex-row justify-between items-center mb-1">
            <Pressable onPress={resetGame} className="p-1.5 w-20">
              <Ionicons name="arrow-back" size={24} color="#fff" />
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
                onPress={() => setMode(mode === 'tap' ? 'bags' : 'tap')}
                className="bg-purple-600 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-xs font-bold">
                  {mode === 'tap' ? 'Bags' : 'Tap'}
                </Text>
              </Pressable>
            </View>
          </View>
          <Text className="text-white text-center text-xs font-semibold">
            {totalRounds ? `Round ${currentRound} of ${totalRounds}` : `Round ${currentRound}`}
          </Text>
        </View>

        {mode === 'tap' ? (
          /* TAP MODE - Scoreholio Style */
          <View className="flex-1">
            {/* Player 1 Score */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Top Half - Increment */}
              <Pressable
                onPress={() => handleTopHalfPress(1)}
                className="flex-1 active:bg-gray-700"
              >
              </Pressable>

              {/* Divider Line */}
              <View className="absolute left-0 right-0 h-px bg-gray-700" style={{ top: '50%' }} />

              {/* Score and Player Name centered on divider line */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none"
                style={{
                  top: '50%',
                  transform: [{ translateY: isLandscape ? -90 : -120 }]
                }}
              >
                {isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-base mb-2">
                    Player 1
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 140 : 220,
                    textShadowColor: 'rgba(239, 68, 68, 0.6)',
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 140 : 220,
                  }}
                >
                  {p1Score}
                </Text>
                {!isLandscape && (
                  <Text className="text-red-500 font-bold uppercase tracking-wide text-xl mt-2">
                    Player 1
                  </Text>
                )}
              </View>

              {/* Bottom Half - Decrement */}
              <Pressable
                onPress={() => handleBottomHalfPress(1)}
                className="flex-1 active:bg-gray-700"
              >
              </Pressable>
            </View>

            {/* Center Controls */}
            <View className="bg-gray-900 py-4 px-4">
              <View className="flex-row justify-around items-center">
                <Pressable
                  onPress={resetGame}
                  className="bg-red-600 px-6 py-3 rounded-full"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text className="text-white font-bold">Reset</Text>
                  </View>
                </Pressable>

                {completedRounds > 0 && (
                  <View className="bg-gray-800 px-4 py-2 rounded-lg">
                    <Text className="text-gray-400 text-xs">PPR</Text>
                    <View className="flex-row gap-3 mt-1">
                      <Text className="text-red-400 font-bold">{p1PPR}</Text>
                      <Text className="text-gray-600">-</Text>
                      <Text className="text-blue-400 font-bold">{p2PPR}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Player 2 Score */}
            <View className="flex-1 bg-gray-800 relative">
              {/* Top Half - Increment */}
              <Pressable
                onPress={() => handleTopHalfPress(2)}
                className="flex-1 active:bg-gray-700"
              >
              </Pressable>

              {/* Divider Line */}
              <View className="absolute left-0 right-0 h-px bg-gray-700" style={{ top: '50%' }} />

              {/* Score and Player Name centered on divider line */}
              <View
                className="absolute left-0 right-0 items-center pointer-events-none"
                style={{
                  top: '50%',
                  transform: [{ translateY: isLandscape ? -90 : -120 }]
                }}
              >
                {isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-base mb-2">
                    Player 2
                  </Text>
                )}
                <Text
                  className="font-black text-white"
                  style={{
                    fontSize: isLandscape ? 140 : 220,
                    textShadowColor: 'rgba(59, 130, 246, 0.6)',
                    textShadowOffset: { width: 0, height: 8 },
                    textShadowRadius: 30,
                    lineHeight: isLandscape ? 140 : 220,
                  }}
                >
                  {p2Score}
                </Text>
                {!isLandscape && (
                  <Text className="text-blue-500 font-bold uppercase tracking-wide text-xl mt-2">
                    Player 2
                  </Text>
                )}
              </View>

              {/* Bottom Half - Decrement */}
              <Pressable
                onPress={() => handleBottomHalfPress(2)}
                className="flex-1 active:bg-gray-700"
              >
              </Pressable>
            </View>
          </View>
        ) : (
          /* BAGS MODE - Original Style */
          <ScrollView className="flex-1">
            <View className="items-center py-8">
              {/* Player 1 */}
              <View className="items-center mb-8">
                <Text className="text-red-500 text-2xl font-bold mb-4 uppercase">
                  {player1Name}
                </Text>
                <Text className="text-white text-6xl font-black mb-4">{p1Score}</Text>

                <View className="flex-row gap-4">
                  <View className="items-center">
                    <Text className="text-red-500 font-bold mb-2">BAGS IN</Text>
                    <View className="flex-row gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <Pressable
                          key={num}
                          onPress={() => setBagCount(1, 'in', num)}
                          className={`w-12 h-12 rounded-lg items-center justify-center ${
                            num === p1BagsIn
                              ? 'bg-red-600 border-2 border-red-400'
                              : num > 4 - p1BagsOn
                              ? 'bg-gray-800 border-2 border-gray-700'
                              : 'bg-gray-700 border-2 border-gray-600'
                          }`}
                          disabled={num > 4 - p1BagsOn}
                        >
                          <Text className={`font-bold text-xl ${
                            num === p1BagsIn ? 'text-white' : num > 4 - p1BagsOn ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View className="items-center">
                    <Text className="text-red-500 font-bold mb-2">BAGS ON</Text>
                    <View className="flex-row gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <Pressable
                          key={num}
                          onPress={() => setBagCount(1, 'on', num)}
                          className={`w-12 h-12 rounded-lg items-center justify-center ${
                            num === p1BagsOn
                              ? 'bg-red-600 border-2 border-red-400'
                              : num > 4 - p1BagsIn
                              ? 'bg-gray-800 border-2 border-gray-700'
                              : 'bg-gray-700 border-2 border-gray-600'
                          }`}
                          disabled={num > 4 - p1BagsIn}
                        >
                          <Text className={`font-bold text-xl ${
                            num === p1BagsOn ? 'text-white' : num > 4 - p1BagsIn ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px w-3/4 bg-gray-700 my-8" />

              {/* Player 2 */}
              <View className="items-center mb-8">
                <Text className="text-blue-500 text-2xl font-bold mb-4 uppercase">
                  {player2Name}
                </Text>
                <Text className="text-white text-6xl font-black mb-4">{p2Score}</Text>

                <View className="flex-row gap-4">
                  <View className="items-center">
                    <Text className="text-blue-500 font-bold mb-2">BAGS IN</Text>
                    <View className="flex-row gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <Pressable
                          key={num}
                          onPress={() => setBagCount(2, 'in', num)}
                          className={`w-12 h-12 rounded-lg items-center justify-center ${
                            num === p2BagsIn
                              ? 'bg-blue-600 border-2 border-blue-400'
                              : num > 4 - p2BagsOn
                              ? 'bg-gray-800 border-2 border-gray-700'
                              : 'bg-gray-700 border-2 border-gray-600'
                          }`}
                          disabled={num > 4 - p2BagsOn}
                        >
                          <Text className={`font-bold text-xl ${
                            num === p2BagsIn ? 'text-white' : num > 4 - p2BagsOn ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View className="items-center">
                    <Text className="text-blue-500 font-bold mb-2">BAGS ON</Text>
                    <View className="flex-row gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <Pressable
                          key={num}
                          onPress={() => setBagCount(2, 'on', num)}
                          className={`w-12 h-12 rounded-lg items-center justify-center ${
                            num === p2BagsOn
                              ? 'bg-blue-600 border-2 border-blue-400'
                              : num > 4 - p2BagsIn
                              ? 'bg-gray-800 border-2 border-gray-700'
                              : 'bg-gray-700 border-2 border-gray-600'
                          }`}
                          disabled={num > 4 - p2BagsIn}
                        >
                          <Text className={`font-bold text-xl ${
                            num === p2BagsOn ? 'text-white' : num > 4 - p2BagsIn ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {num}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Enter Button */}
              <Pressable
                onPress={nextRound}
                className="bg-green-600 px-8 py-4 rounded-full mt-4"
              >
                <Text className="text-white font-bold text-lg">Enter Round</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Game Over Modal */}
      <Modal visible={showGameOver} transparent animationType="fade">
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1 items-center justify-center px-6">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <Text className="text-4xl font-bold text-center mb-4 text-white">Game Over!</Text>
              <View className="items-center mb-6">
                <Text className="text-5xl font-bold mb-2 text-yellow-400">
                  {p1Score > p2Score ? player1Name : player2Name} Wins!
                </Text>
                <Text className="text-3xl text-gray-300">
                  {Math.max(p1Score, p2Score)} - {Math.min(p1Score, p2Score)}
                </Text>
              </View>

              <View className="mb-4 bg-gray-700 rounded-lg p-4">
                <Text className="text-white font-bold mb-2 text-center">Match Stats</Text>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-gray-400 text-xs">PPR</Text>
                    <Text className="text-red-400 font-bold">{p1PPR}</Text>
                    <Text className="text-gray-500 text-xs">{player1Name}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-400 text-xs">Rounds</Text>
                    <Text className="text-white font-bold">{completedRounds}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-400 text-xs">PPR</Text>
                    <Text className="text-blue-400 font-bold">{p2PPR}</Text>
                    <Text className="text-gray-500 text-xs">{player2Name}</Text>
                  </View>
                </View>
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
