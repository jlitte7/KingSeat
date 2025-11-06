export type RootStackParamList = {
  Home: undefined;
  ScoreboardSetup: undefined;
  Scoreboard: {
    player1Name: string;
    player2Name: string;
    totalRounds?: number;
  };
  Clubhouse: undefined;
  TeamsList: undefined;
  TeamDetail: { teamId: string };
  CreateTeam: undefined;
  AddPlayer: { teamId: string };
  PlayerProfile: { playerId: string };
  TossOff: undefined;
  TournamentDetail: { tournamentId: string };
  CreateTournament: undefined;
  CornHub: undefined;
  PracticeSession: { playerId: string };
  CornholeIQ: undefined;
  SeriesSetup: undefined;
  SeriesPlayerSelection: {
    seriesId: string;
    isAwayTeam: boolean;
    awayPlayers?: { playerId: string; playerName: string }[];
  };
  SeriesGame: {
    seriesId: string;
    gameIndex: number;
  };
  SeriesComplete: { seriesId: string };
  LeagueList: undefined;
  CreateLeague: undefined;
  LeagueSchedule: { leagueId: string };
  LeagueMatchDetail: { matchId: string; leagueId: string };
  LeagueGameScoreboard: {
    matchId: string;
    leagueId: string;
    gameNumber: number;
  };
  GhostPlayer: undefined;
  BagRun: undefined;
  AirmailRun: undefined;
  SituationalGames: undefined;
  BestGameChallenge: undefined;
  PressurePractice: undefined;
  PersonalStats: undefined;
  PersonalMatchLog: undefined;
  PersonalSettings: undefined;
};
