import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTossSeriesStore } from '../state/toss-series-store';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type PlayerProfileRouteProp = RouteProp<RootStackParamList, 'PlayerProfile'>;

export default function PlayerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<PlayerProfileRouteProp>();
  const { playerId } = route.params;
  const { getPlayerById } = useTossSeriesStore();

  const player = getPlayerById(playerId);

  if (!player) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-xl">Player not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const StatCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-gray-400 text-sm mb-3 font-bold">{title}</Text>
      {children}
    </View>
  );

  const StatRow = ({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) => (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-gray-300 text-sm">{label}</Text>
      <Text className={`font-bold text-sm ${highlight ? 'text-yellow-400' : 'text-white'}`}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Player Profile</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Player Header */}
          <View className="px-4 py-6 bg-gray-800 border-b border-gray-700 items-center">
            <View className="w-24 h-24 rounded-full bg-purple-600 items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">{player.name[0]}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{player.name}</Text>
            {player.nickname && (
              <Text className="text-gray-400 text-lg mt-1">{player.nickname}</Text>
            )}
            <View className="mt-4 bg-yellow-500/10 px-4 py-2 rounded-full">
              <Text className="text-yellow-400 font-bold text-lg">
                {player.stats.dominanceRating.toFixed(1)} Dominance
              </Text>
            </View>
          </View>

          <View className="px-4 py-6">
            {/* Core Record */}
            <StatCard title="Game Record">
              <View className="flex-row justify-around mb-2">
                <View className="items-center">
                  <Text className="text-white text-3xl font-bold">{player.stats.totalGames}</Text>
                  <Text className="text-gray-400 text-xs mt-1">Games</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-500 text-3xl font-bold">{player.stats.totalWins}</Text>
                  <Text className="text-gray-400 text-xs mt-1">Wins</Text>
                </View>
                <View className="items-center">
                  <Text className="text-red-500 text-3xl font-bold">{player.stats.totalLosses}</Text>
                  <Text className="text-gray-400 text-xs mt-1">Losses</Text>
                </View>
              </View>
              <View className="border-t border-gray-700 mt-3 pt-3">
                <StatRow label="Win Percentage" value={`${player.stats.winPercentage.toFixed(1)}%`} />
                <StatRow label="Opponents Faced" value={player.stats.totalOpponents} />
              </View>
            </StatCard>

            {/* Accuracy & Efficiency */}
            <StatCard title="Accuracy & Efficiency">
              <StatRow label="Bags In %" value={`${player.stats.bagsInPercentage.toFixed(1)}%`} />
              <StatRow label="Bags On %" value={`${player.stats.bagsOnPercentage.toFixed(1)}%`} />
              <StatRow label="Board % (In + On)" value={`${player.stats.boardPercentage.toFixed(1)}%`} highlight />
              <StatRow label="Miss %" value={`${player.stats.missPercentage.toFixed(1)}%`} />
              <View className="border-t border-gray-700 mt-2 pt-2">
                <StatRow label="Four Baggers" value={player.stats.fourBaggers} />
                <StatRow label="Four Bagger Rate" value={`${player.stats.fourBaggerRate.toFixed(1)}%`} />
                <StatRow label="Three Bagger Rate" value={`${player.stats.threeBaggerRate.toFixed(1)}%`} />
                <StatRow label="Perfect Rounds" value={player.stats.perfectRounds} />
                <StatRow label="Zero Point Rounds" value={player.stats.zeroPointRounds} />
              </View>
            </StatCard>

            {/* Scoring Performance */}
            <StatCard title="Scoring Performance">
              <StatRow label="Avg Points Per Round" value={player.stats.averagePointsPerRound.toFixed(2)} highlight />
              <StatRow label="Avg Points Per Game" value={player.stats.averagePointsPerGame.toFixed(1)} />
              <StatRow label="Highest Game Score" value={player.stats.highestGameScore} />
              <StatRow label="Total Career Points" value={player.stats.totalPoints} />
            </StatCard>

            {/* Win Quality */}
            <StatCard title="Win Quality">
              <StatRow label="Shutout Wins" value={player.stats.shutoutWins} />
              <StatRow label="Dominant Wins (10+ pts)" value={player.stats.dominantWins} />
              <StatRow label="Close Wins (≤3 pts)" value={player.stats.closeWins} />
              <StatRow label="Comeback Wins" value={player.stats.comebackWins} />
              <StatRow label="Comebacks from 10+ down" value={player.stats.comebacksFrom10Plus} />
            </StatCard>

            {/* Loss Analysis */}
            <StatCard title="Loss Analysis">
              <StatRow label="Close Losses (≤3 pts)" value={player.stats.closeLosses} />
              <StatRow label="Blowout Losses (10+ pts)" value={player.stats.blowoutLosses} />
            </StatCard>

            {/* Streaks */}
            <StatCard title="Streaks & Momentum">
              <StatRow label="Current Win Streak" value={player.stats.currentWinStreak} highlight={player.stats.currentWinStreak > 0} />
              <StatRow label="Longest Win Streak" value={player.stats.longestWinStreak} />
              <StatRow label="Current Losing Streak" value={player.stats.currentLosingStreak} highlight={player.stats.currentLosingStreak > 0} />
              <StatRow label="Longest Losing Streak" value={player.stats.longestLosingStreak} />
            </StatCard>

            {/* Advanced Metrics */}
            <StatCard title="Advanced Metrics">
              <StatRow label="Clutch Factor" value={`${player.stats.clutchFactor.toFixed(1)}%`} highlight />
              <Text className="text-gray-500 text-xs mb-2">Win rate in close games (≤3 pts)</Text>
              <StatRow label="Consistency Score" value={player.stats.consistency.toFixed(1)} />
              <Text className="text-gray-500 text-xs mb-2">Higher is more consistent scoring</Text>
            </StatCard>

            {/* Achievements */}
            {player.achievements.length > 0 && (
              <StatCard title="Achievements">
                {player.achievements.map((achievement) => (
                  <View key={achievement.id} className="flex-row items-center mb-3 bg-gray-900 p-3 rounded-lg">
                    <Text className="text-4xl mr-3">{achievement.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold">{achievement.title}</Text>
                      <Text className="text-gray-400 text-xs">{achievement.description}</Text>
                    </View>
                  </View>
                ))}
              </StatCard>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
