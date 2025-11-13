import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BracketMatch, TournamentTeam } from "../types/tournament";
import { Ionicons } from "@expo/vector-icons";

interface BracketViewProps {
  matches: BracketMatch[];
  eliminationType: "single" | "double";
  onMatchPress?: (match: BracketMatch) => void;
}

export function BracketView({ matches, eliminationType, onMatchPress }: BracketViewProps) {
  // Group matches by round
  const matchesByRound: Record<number, BracketMatch[]> = {};
  matches.forEach((match) => {
    if (!matchesByRound[match.roundNumber]) {
      matchesByRound[match.roundNumber] = [];
    }
    matchesByRound[match.roundNumber].push(match);
  });

  // Sort matches within each round by matchNumber
  Object.keys(matchesByRound).forEach((roundNum) => {
    matchesByRound[Number(roundNum)].sort((a, b) => a.matchNumber - b.matchNumber);
  });

  // Get all rounds and sort them (descending, so finals is first in display)
  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b); // Start from finals (1) to earlier rounds

  // Calculate round names
  const getRoundName = (roundNumber: number, totalRounds: number): string => {
    if (roundNumber === 1) return "Finals";
    if (roundNumber === 2) return "Semi-Finals";
    if (roundNumber === 3) return "Quarter-Finals";
    const matchesInRound = Math.pow(2, roundNumber - 1);
    return `Round of ${matchesInRound * 2}`;
  };

  const getTeamDisplay = (team: TournamentTeam | "TBD" | undefined): string => {
    if (!team || team === "TBD") return "TBD";
    if (typeof team === "object") {
      const player1Name = team.player1.name;
      const player2Name = team.player2 === "ghost" ? "Ghost" : team.player2.name;
      return `${player1Name} / ${player2Name}`;
    }
    return "TBD";
  };

  const getShortTeamDisplay = (team: TournamentTeam | "TBD" | undefined): string => {
    if (!team || team === "TBD") return "TBD";
    if (typeof team === "object") {
      const p1 = team.player1.name.split(" ").map(n => n[0]).join("");
      const p2 = team.player2 === "ghost" ? "G" : team.player2.name.split(" ").map(n => n[0]).join("");
      return `${p1}/${p2}`;
    }
    return "TBD";
  };

  if (matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="git-branch-outline" size={60} color="#4b5563" />
        <Text className="text-gray-400 text-lg font-bold text-center mt-4">
          Bracket Not Generated
        </Text>
        <Text className="text-gray-500 text-center mt-2 px-6">
          Generate teams and start the tournament to create the bracket
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row py-4 px-2">
        {rounds.reverse().map((roundNum, roundIndex) => {
          const roundMatches = matchesByRound[roundNum];
          const totalRounds = Math.max(...rounds);

          return (
            <View key={roundNum} className="mx-2">
              {/* Round Header */}
              <View className="mb-3">
                <Text className="text-white font-bold text-center text-sm">
                  {getRoundName(roundNum, totalRounds)}
                </Text>
                <Text className="text-gray-500 text-center text-xs">
                  Round {totalRounds - roundNum + 1}
                </Text>
              </View>

              {/* Matches in this round */}
              <View className="gap-4">
                {roundMatches.map((match, matchIndex) => {
                  const isCompleted = match.completed;
                  const hasWinner = match.winnerId !== undefined;

                  // Calculate spacing between matches for visual brackets
                  const spacingMultiplier = Math.pow(2, roundIndex);
                  const marginTop = matchIndex > 0 ? 16 * spacingMultiplier : 0;

                  return (
                    <Pressable
                      key={match.id}
                      onPress={() => onMatchPress?.(match)}
                      style={{ marginTop }}
                      className="bg-gray-800 rounded-lg border border-gray-700 min-w-[180px]"
                    >
                      {/* Team 1 */}
                      <View
                        className={`px-3 py-2 border-b ${
                          hasWinner && match.team1 && match.team1 !== "TBD" && match.winnerId === match.team1.id
                            ? "border-green-600 bg-green-900/20"
                            : "border-gray-700"
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-xs font-bold ${
                                hasWinner && match.team1 && match.team1 !== "TBD" && match.winnerId === match.team1.id
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                              numberOfLines={1}
                            >
                              {getShortTeamDisplay(match.team1)}
                            </Text>
                          </View>
                          {isCompleted && (
                            <View
                              className={`px-2 py-1 rounded ${
                                hasWinner && match.team1 && match.team1 !== "TBD" && match.winnerId === match.team1.id
                                  ? "bg-green-600"
                                  : "bg-gray-700"
                              }`}
                            >
                              <Text className="text-white font-bold text-xs">
                                {match.team1Score ?? 0}
                              </Text>
                            </View>
                          )}
                          {!isCompleted && match.team1 && match.team1 !== "TBD" && (
                            <View className="w-6" />
                          )}
                        </View>
                      </View>

                      {/* Team 2 */}
                      <View
                        className={`px-3 py-2 ${
                          hasWinner && match.team2 && match.team2 !== "TBD" && match.winnerId === match.team2.id
                            ? "bg-green-900/20"
                            : ""
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-xs font-bold ${
                                hasWinner && match.team2 && match.team2 !== "TBD" && match.winnerId === match.team2.id
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                              numberOfLines={1}
                            >
                              {getShortTeamDisplay(match.team2)}
                            </Text>
                          </View>
                          {isCompleted && (
                            <View
                              className={`px-2 py-1 rounded ${
                                hasWinner && match.team2 && match.team2 !== "TBD" && match.winnerId === match.team2.id
                                  ? "bg-green-600"
                                  : "bg-gray-700"
                              }`}
                            >
                              <Text className="text-white font-bold text-xs">
                                {match.team2Score ?? 0}
                              </Text>
                            </View>
                          )}
                          {!isCompleted && match.team2 && match.team2 !== "TBD" && (
                            <View className="w-6" />
                          )}
                        </View>
                      </View>

                      {/* Match info */}
                      {!isCompleted && match.team1 && match.team1 !== "TBD" && match.team2 && match.team2 !== "TBD" && (
                        <View className="px-3 py-1 bg-gray-900/50 border-t border-gray-700">
                          <Text className="text-gray-400 text-xs text-center">
                            Tap to Score
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
