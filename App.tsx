import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";

import HomeScreen from "./src/screens/HomeScreen";
import ScoreboardSetupScreen from "./src/screens/ScoreboardSetupScreen";
import ScoreboardScreen from "./src/screens/ScoreboardScreen";
import ClubhouseScreen from "./src/screens/ClubhouseScreen";
import CreateTeamScreen from "./src/screens/CreateTeamScreen";
import TeamDetailScreen from "./src/screens/TeamDetailScreen";
import AddPlayerScreen from "./src/screens/AddPlayerScreen";
import PlayerProfileScreen from "./src/screens/PlayerProfileScreen";
import TossOffScreen from "./src/screens/TossOffScreen";
import CornHubScreen from "./src/screens/CornHubScreen";
import CornholeIQScreen from "./src/screens/CornholeIQScreen";
import SeriesSetupScreen from "./src/screens/SeriesSetupScreen";
import SeriesPlayerSelectionScreen from "./src/screens/SeriesPlayerSelectionScreen";
import SeriesGameScreen from "./src/screens/SeriesGameScreen";
import SeriesCompleteScreen from "./src/screens/SeriesCompleteScreen";
import CreateLeagueScreen from "./src/screens/CreateLeagueScreen";
import LeagueListScreen from "./src/screens/LeagueListScreen";
import LeagueScheduleScreen from "./src/screens/LeagueScheduleScreen";
import LeagueMatchDetailScreen from "./src/screens/LeagueMatchDetailScreen";
import LeagueGameScoreboardScreen from "./src/screens/LeagueGameScoreboardScreen";
import GhostPlayerScreen from "./src/screens/GhostPlayerScreen";
import BagRunScreen from "./src/screens/BagRunScreen";
import AirmailRunScreen from "./src/screens/AirmailRunScreen";
import SituationalGamesScreen from "./src/screens/SituationalGamesScreen";
import BestGameChallengeScreen from "./src/screens/BestGameChallengeScreen";
import PressurePracticeScreen from "./src/screens/PressurePracticeScreen";
import PersonalStatsScreen from "./src/screens/PersonalStatsScreen";
import PersonalMatchLogScreen from "./src/screens/PersonalMatchLogScreen";
import PersonalSettingsScreen from "./src/screens/PersonalSettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ScoreboardSetup" component={ScoreboardSetupScreen} />
            <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
            <Stack.Screen name="Clubhouse" component={ClubhouseScreen} />
            <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
            <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
            <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
            <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
            <Stack.Screen name="TossOff" component={TossOffScreen} />
            <Stack.Screen name="CornHub" component={CornHubScreen} />
            <Stack.Screen name="CornholeIQ" component={CornholeIQScreen} />
            <Stack.Screen name="SeriesSetup" component={SeriesSetupScreen} />
            <Stack.Screen name="SeriesPlayerSelection" component={SeriesPlayerSelectionScreen} />
            <Stack.Screen name="SeriesGame" component={SeriesGameScreen} />
            <Stack.Screen name="SeriesComplete" component={SeriesCompleteScreen} />
            <Stack.Screen name="LeagueList" component={LeagueListScreen} />
            <Stack.Screen name="CreateLeague" component={CreateLeagueScreen} />
            <Stack.Screen name="LeagueSchedule" component={LeagueScheduleScreen} />
            <Stack.Screen name="LeagueMatchDetail" component={LeagueMatchDetailScreen} />
            <Stack.Screen name="LeagueGameScoreboard" component={LeagueGameScoreboardScreen} />
            <Stack.Screen name="GhostPlayer" component={GhostPlayerScreen} />
            <Stack.Screen name="BagRun" component={BagRunScreen} />
            <Stack.Screen name="AirmailRun" component={AirmailRunScreen} />
            <Stack.Screen name="SituationalGames" component={SituationalGamesScreen} />
            <Stack.Screen name="BestGameChallenge" component={BestGameChallengeScreen} />
            <Stack.Screen name="PressurePractice" component={PressurePracticeScreen} />
            <Stack.Screen name="PersonalStats" component={PersonalStatsScreen} />
            <Stack.Screen name="PersonalMatchLog" component={PersonalMatchLogScreen} />
            <Stack.Screen name="PersonalSettings" component={PersonalSettingsScreen} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
