import { v4 as uuidv4 } from "uuid";
import { PersonalMatch, PersonalRound } from "../types/personal-stats";

/**
 * Generates sample season data with realistic cornhole statistics
 * This simulates a full season of matches with varying outcomes
 */
export function generateSampleSeason(): PersonalMatch[] {
  const opponents = [
    "Mike Johnson",
    "Sarah Williams",
    "Tom Anderson",
    "Jessica Brown",
    "Chris Davis",
    "Emily Wilson",
    "David Martinez",
    "Lisa Garcia",
  ];

  const matches: PersonalMatch[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // Start 3 months ago

  // Generate 24 matches over 3 months
  for (let i = 0; i < 24; i++) {
    const matchDate = new Date(startDate);
    matchDate.setDate(matchDate.getDate() + i * 4); // Every 4 days

    const opponent = opponents[i % opponents.length];
    const rounds: PersonalRound[] = [];

    let myTotalScore = 0;
    let oppTotalScore = 0;

    // Determine match outcome (60% win rate)
    const shouldWin = Math.random() < 0.6;

    // Generate rounds until someone reaches 21
    let roundNumber = 0;
    while (myTotalScore < 21 && oppTotalScore < 21) {
      roundNumber++;

      // Generate realistic bag counts
      // Player skill: ~50% in, ~30% on, ~20% miss
      const myBagsIn = Math.floor(Math.random() * 5 * (shouldWin ? 0.9 : 0.7)); // 0-4
      const myBagsOn = Math.min(4 - myBagsIn, Math.floor(Math.random() * 3));

      // Opponent skill: ~40% in, ~35% on, ~25% miss
      const oppBagsIn = Math.floor(Math.random() * 5 * (shouldWin ? 0.6 : 0.8));
      const oppBagsOn = Math.min(4 - oppBagsIn, Math.floor(Math.random() * 3));

      // Calculate cancellation scoring
      const myRawScore = myBagsIn * 3 + myBagsOn;
      const oppRawScore = oppBagsIn * 3 + oppBagsOn;
      const myScore = Math.max(0, myRawScore - oppRawScore);
      const oppScore = Math.max(0, oppRawScore - myRawScore);

      myTotalScore += myScore;
      oppTotalScore += oppScore;

      rounds.push({
        roundNumber,
        throws: [], // We don't need individual throw data for sample data
        myBagsIn,
        myBagsOn,
        opponentBagsIn: oppBagsIn,
        opponentBagsOn: oppBagsOn,
        myScore,
        opponentScore: oppScore,
      });
    }

    const match: PersonalMatch = {
      id: uuidv4(),
      date: matchDate.toISOString(),
      opponent,
      myScore: myTotalScore,
      opponentScore: oppTotalScore,
      won: myTotalScore > oppTotalScore,
      rounds,
    };

    matches.push(match);
  }

  return matches;
}
