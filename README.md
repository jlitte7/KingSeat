# TossSeries - Ultimate Cornhole Tracker

A comprehensive cornhole league management and scoring app built with Expo and React Native. Track games, manage teams, monitor player stats, and organize league matches - all optimized for mobile.

## ✨ Features

### 📊 Scoreboard
- **Quick Game Setup**: Enter player names and start tracking immediately
- **Live Scoring**: Track bags in/on with intuitive counter interface
- **Cancellation Scoring**: Automatic calculation of points (difference only counts)
- **Real-Time Stats**: View PPR, bag accuracy, and four-bagger rates during games
- **Four-Bagger Celebrations**: Animated celebration when a player gets all 4 bags in
- **Game Completion**: Winner announcement with final stats
- **Flexible Rounds**: Play unlimited rounds or set a specific limit

### 📊 My Stats (Personal Bag Tracking)
A dedicated personal tracking system that works independently from team stats:

- **Personal Stats Dashboard**: Track your individual performance
  - Total throws and accuracy percentages (In%, On%, Board%, Miss%)
  - Current and best streaks (both "in" streaks and board streaks)
  - Four-baggers and three-baggers counts
  - Match record and win percentage
  - Recent match history with dates and scores

- **Quick Log Mode**: Fast bag throw logging for practice
  - Big, colorful buttons for instant logging (In/On/Miss)
  - Real-time stats updates showing session performance
  - Live streak tracking
  - Perfect for solo practice or casual play

- **Match Logging**: Full game tracking with detailed stats
  - Log complete matches with opponent names
  - Track all 4 throws per round with visual indicators
  - Enter opponent scores for win/loss tracking
  - View round history during active matches
  - Automatic score calculation from your throws

- **Player Linking**: Connect your personal stats to team profiles
  - Link to an existing player in the Clubhouse
  - Prevents duplicate names across the system
  - Optional syncing with team stats
  - Maintains separate personal history

- **Settings & Management**:
  - Configure your name and linked player profile
  - Toggle quick log visibility during games
  - Enable/disable team stats syncing
  - Reset personal stats if needed

**Key Benefits**:
- Track your bags separately from team games
- Works for solo practice, playing with teammates, or against multiple opponents
- Your personal stats never interfere with team-based CornholeIQ stats
- Focus on YOUR performance, not overall game outcomes
- Build a complete history of your bag throwing accuracy over time

### 🏆 Clubhouse (League Management)
- **Team Management**: Create and organize teams
- **Player Rosters**: Add 8+ players per team for league matches
- **Team Stats**: Track wins, losses, and total games
- **Player Profiles**: View detailed stats for each player
- **League Series**: Set up 12-game matches between teams
- **Easy Navigation**: Quick access to team and player details
- **Sample Data Generator**: Generate 6 teams with 10 players each for testing league functionality

### 📈 CornholeIQ (Statistics Dashboard)
- **Player Rankings**: Sorted by Dominance Rating (composite performance score)
- **Comprehensive Stats Categories**:

#### Core Stats
  - Win/Loss records and percentages
  - Total games played
  - Total points scored
  - Opponents faced

#### Accuracy & Efficiency
  - Bags In % (percentage of bags that go in the hole)
  - Bags On % (percentage of bags that land on the board)
  - Board % (combined In + On - overall landing accuracy)
  - Miss % (bags that completely miss)
  - Four Bagger Rate (% of rounds with all 4 bags in)
  - Three Bagger Rate (% of rounds with 3 bags in)
  - Perfect Rounds (total four-baggers)
  - Zero Point Rounds (rounds scored 0)

#### Scoring Performance
  - Points Per Round (PPR) - average points scored per round
  - Average Points Per Game
  - Highest Game Score
  - Total Career Points

#### Win Quality
  - Shutout Wins (opponent scored 0)
  - Dominant Wins (won by 10+ points)
  - Close Wins (won by 3 points or less)
  - Comeback Wins (won after being behind)
  - Comebacks from 10+ down

#### Loss Analysis
  - Close Losses (lost by 3 points or less)
  - Blowout Losses (lost by 10+ points)

#### Streaks & Momentum
  - Current Win Streak
  - Longest Win Streak
  - Current Losing Streak
  - Longest Losing Streak

#### Advanced Metrics
  - **Dominance Rating**: Composite score combining win%, accuracy, scoring, and clutch performance
  - **Clutch Factor**: Win rate in close games (within 3 points)
  - **Consistency Score**: Measure of scoring reliability

### 🏅 Achievement System
- **First Blood**: Win your first game
- **Four Bagger**: Get all 4 bags in the hole in one round
- **The Comeback Kid**: Win after being down 10+ points
- **On Fire!**: Win 5 games in a row
- **Shutout**: Win without opponent scoring
- Achievements automatically unlock during gameplay

### 🌽 CornHub (Practice Area)
Transform your game with comprehensive practice modes designed to elevate your skills. All practice modes now feature the intuitive bag counter interface from the main scoreboard for consistent scoring experience:

- **Ghost Player Mode**: Practice against AI opponents at 4 difficulty levels (Scoreholio-style)
  - Ghost Easy (1-3 PPR) - New to cornhole
  - Ghost Medium (4-6 PPR) - Average competition
  - Ghost Hard (7-9 PPR) - Strong opponents
  - Ghost Expert (10-12 PPR) - Expert level challenge
  - See ghost throws after each round
  - Live PPR tracking for both players
  - Uses bag counter interface for easy score entry
  - Game continues past 21 (no "exactly 21" rule)

- **Bag Run**: Track consecutive bags made in a row
  - 4 bags per round tracking
  - Real-time streak counter
  - Longest streak records
  - Overall accuracy stats

- **Airmail Run**: Track consecutive airmail shots (clean drops)
  - Focus on precision throwing
  - No board contact allowed
  - Build airmail consistency

- **Situational Games**: Drop into mid-game scenarios
  - "Comeback Time" - Down 15-8, can you recover?
  - "Close Game" - Tied 18-18, clutch time!
  - "Hold the Lead" - Up 12-7, don't blow it
  - "Clutch Moment" - Down 19-16, need a big round
  - "Late Game Pressure" - Up 20-17, close it out
  - "Blowout Recovery" - Down 18-6, miracle time
  - Uses bag counter interface for easy score entry

- **Best Game Challenge**: Play against your personal best performance
  - Automatically calculates your best game stats
  - Simulates your peak performance as opponent
  - Push yourself to new heights

- **Pressure Practice**: Practice clutch shots in critical moments
  - "Game Winner" - Need 3+ points at 18
  - "Four-Bagger Clutch" - All 4 must go in
  - "Comeback Round" - 2 in + 2 on required
  - "Consistency Test" - Get 3 bags in
  - "No Misses" - All 4 must hit board
  - "Perfect Closer" - Hit exactly 21

- **Practice Stats Dashboard**: Track all your practice progress
  - Ghost game win rates
  - Best bag run streaks
  - Best airmail streaks
  - Situational game records
  - Pressure practice success rates

### 🎯 Coming Soon
- **TossOff**: Tournament brackets and playoff tracking

## 🎮 How to Use

### Quick Game (Scoreboard)
1. Tap **📊 Scoreboard** from home
2. Enter player names
3. Optionally set total rounds
4. Tap the screen to enter scores
5. Use the counters to track bags in/on for each player
6. Tap **Enter** to complete the round
7. Game ends at 21 points or when rounds complete

### League Management (Clubhouse)
1. Tap **🏆 Clubhouse** from home
2. Create your first team with **+ Team**
3. Add players to the team (need 8+ for league matches)
4. Once you have 2+ teams with enough players, start a league series
5. Play through a 12-game series with player selection

**Quick Testing**: Tap **Generate Sample Data** to instantly create 6 teams with 10 players each for testing league functionality.

**Note**: Duplicate team and player names are automatically prevented

### Track Your Personal Bags (My Stats)
1. Tap **📊 My Stats** from home
2. Choose how you want to track:
   - **Quick Log**: Tap In/On/Miss buttons for each throw during practice
   - **Log Match**: Track a full game with opponent scores
3. View your stats dashboard to see:
   - Accuracy percentages and current streaks
   - Four-baggers and performance history
   - Match records (if logging full games)
4. Tap the settings icon to:
   - Link your profile to a Clubhouse player (prevents duplicate names)
   - Enable syncing with team stats (optional)
   - Configure tracking preferences

**Tip**: Link to a Clubhouse player to ensure your stats are tracked correctly across all games and avoid duplicate names in the system.

### View Stats (CornholeIQ)
1. Tap **📈 CornholeIQ** from home
2. View all players ranked by performance
3. Tap any player to see their detailed profile
4. Check achievements, game history, and trends

### Practice Your Skills (CornHub)
1. Tap **🌽 CornHub** from home
2. Choose a practice mode based on what you want to improve:
   - **Ghost Player**: Play full games against AI at your skill level
   - **Bag Run**: See how many consecutive bags you can make
   - **Airmail Run**: Practice clean drops without touching the board
   - **Situational Games**: Train for critical game moments
   - **Best Game Challenge**: Try to beat your personal best
   - **Pressure Practice**: Master clutch shots
3. Track your progress with detailed statistics
4. Return to practice regularly to see improvement over time

## 🎲 Game Rules

### Scoring
- **Bags In (Cornhole)**: 3 points each
- **Bags On (Board)**: 1 point each
- **Cancellation Scoring**: Only the difference between players counts per round
  - Example: P1 scores 9 (3 in), P2 scores 4 (4 on) → P1 gets 5 points
- **Winning**: First player to reach 21+ points wins (can go over 21, no "exactly 21" rule)

### League Series Format
- Teams need 8+ players to participate
- Series consists of 12 games
- Each player can play maximum 3 games per series
- Away team manager selects players first
- Home team responds with their selections
- Series winner determined by most games won

## 🛠️ Technical Details

### Built With
- **Expo SDK 53**
- **React Native 0.76.7**
- **TypeScript** for type safety
- **Zustand** for state management
- **AsyncStorage** for persistence
- **React Navigation** for navigation
- **NativeWind** (TailwindCSS) for styling
- **React Native Reanimated v3** for animations
- **React Native Safe Area Context** for safe layouts

### App Architecture
```
src/
├── components/        # Reusable UI components
├── screens/          # All app screens
│   ├── HomeScreen.tsx
│   ├── ScoreboardSetupScreen.tsx
│   ├── ScoreboardScreen.tsx
│   ├── ClubhouseScreen.tsx
│   ├── CreateTeamScreen.tsx
│   ├── TeamDetailScreen.tsx
│   ├── AddPlayerScreen.tsx
│   ├── PlayerProfileScreen.tsx
│   ├── SeriesSetupScreen.tsx
│   ├── CornholeIQScreen.tsx
│   ├── PersonalStatsScreen.tsx
│   ├── PersonalQuickLogScreen.tsx
│   ├── PersonalMatchLogScreen.tsx
│   ├── PersonalSettingsScreen.tsx
│   ├── TossOffScreen.tsx
│   ├── CornHubScreen.tsx (Practice Hub)
│   ├── GhostPlayerScreen.tsx
│   ├── BagRunScreen.tsx
│   ├── AirmailRunScreen.tsx
│   ├── SituationalGamesScreen.tsx
│   ├── BestGameChallengeScreen.tsx
│   └── PressurePracticeScreen.tsx
├── navigation/
│   └── types.ts      # Navigation type definitions
├── state/
│   ├── toss-series-store.ts     # Main game state
│   ├── personal-stats-store.ts  # Personal bag tracking state
│   └── practice-store.ts        # Practice mode state
└── types/
    ├── toss-series.ts           # TypeScript interfaces
    └── personal-stats.ts        # Personal tracking interfaces
```

### Data Persistence
All data is automatically saved to device storage:
- Teams and player rosters
- Game history with full round-by-round data
- Player statistics and achievements
- Personal bag tracking (separate from team stats)
- Personal match history and throw logs
- Tournament and series data
- Practice session records (all modes)
- Practice statistics and streaks

### Performance Optimizations
- Zustand selectors to prevent unnecessary re-renders
- Optimized list rendering for large player/team lists
- Efficient state updates
- Safe area handling for all screen types
- Proper keyboard dismissal

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for one-handed use
- **Clear Hierarchy**: Important actions are prominent
- **Instant Feedback**: Animations and celebrations
- **Consistent Colors**: Red/Blue for players, team colors for leagues
- **Dark Theme**: Reduces eye strain during outdoor play

## 📱 Screenshots

The app features:
- Beautiful gradient home screen with 5 main sections
- Full-screen scoreboard with large, readable numbers
- Intuitive bag counter interface
- Stats cards showing real-time game statistics
- Professional team and player management screens
- Achievement unlocks with visual celebrations

## 🚀 Future Enhancements

1. Tournament bracket visualization
2. Practice drills with targets and timers
3. Photo uploads for players and teams
4. Export stats to CSV/PDF
5. Head-to-head player comparisons
6. Historical trend charts
7. Leaderboards and rankings
8. Custom rule configurations
9. Multi-league support
10. Social features (share games, challenge friends)

## 🏁 Getting Started

The app automatically opens to the home screen. From there:
- Play a quick game with **Scoreboard**
- Build your league with **Clubhouse**
- Review performance in **CornholeIQ**
- Improve your skills in **CornHub** practice area
- Compete in tournaments with **TossOff** (coming soon)

## 📝 Notes

- All changes are automatically saved
- No internet connection required
- Works offline completely
- Data persists between app sessions
- Optimized for iOS (Android support may vary)

---

**TossSeries** - Track every toss, celebrate every win! 🎯
