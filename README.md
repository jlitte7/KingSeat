# KingSeat - Ultimate Cornhole Tracker

A world-class cornhole league management and scoring app built with Expo and React Native. Experience premium design, intelligent insights, and comprehensive tracking - all optimized for mobile.

## 🌟 World-Class Features

### 🎬 Premium Onboarding
- **4-Screen Welcome Flow**: Beautiful, animated introduction for first-time users
- **Feature Highlights**: Showcases Quick Game, My Stats, CornHub, and more
- **Skip Option**: Get started immediately if you're ready
- **Zero Friction**: No signup, no account - just pure gameplay
- **Privacy First**: All data stays on your device

### 🏠 Intelligent Homepage
- **Dynamic Greeting**: Personalized welcome based on time of day
- **Live Stats Dashboard**: Real-time overview of games, weekly activity, and current streaks
- **Smart Recommendations**: AI-powered suggestions based on your usage patterns
  - Guides new users through onboarding
  - Suggests features you haven't tried yet
  - Celebrates your activity when you're on fire
- **Premium Cards**: Beautiful gradient hero cards with live stats
  - Quick Game shows today's game count
  - My Stats displays your accuracy percentage
- **Activity Badges**: Visual indicators for hot streaks and milestones
- **Crown Badge**: Premium branding that screams "top of the charts"

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

- **Match Logging**: Full game tracking with comprehensive real-time stats
  - Log complete matches with opponent names
  - **Simplified Input Interface**:
    - Track YOUR bags in/on with detailed buttons
    - Select opponent score directly (0-12) - no need to track their bags
    - More space for stats, less scrolling
  - **Compact Real-Time Stats Display**: Complete performance dashboard updating live, no scrolling needed
    - **IN%**: Percentage of throws that go in the hole
    - **BOARD%**: Total percentage on board (in + on combined)
    - **OFF%**: Percentage that miss the board entirely
    - **PPR**: Your average points per round
    - **OPPR**: Opponent's average points per round
    - **DIFF**: PPR minus OPPR (green when winning, red when losing)
    - **TOT PTS**: Your cumulative points scored
    - **OPP**: Opponent's cumulative points
    - **RNDS**: Number of rounds completed
    - **4-BAG%**: Percentage of rounds with all 4 in the hole
    - **ON%**: Just bags on board (not in hole)
    - **SCR%**: Percentage of bags that scored
  - **4-Bagger & 3-Bagger Badges**: Compact achievement tracking
  - **Singles & Doubles Support**: Track YOUR 4 bags only (not your partner's)
  - **Smart Validation**: Prevents logging more than 4 bags per round (In + On combined)
  - Enter opponent/team scores for win/loss tracking
  - View round history during active matches
  - Automatic score calculation from your throws
  - **Manual Round Control**: "Start Next Round" button prevents accidental entries
  - **Game Over Detection**: Properly shows end screen when someone reaches 21
  - **No Auto-Loops**: Game waits for your input instead of auto-starting rounds

- **Clear Tracking Info**: Blue info box explains exactly what's being tracked
  - In doubles: Only log your personal 4 bags
  - Opponent score is their team total
  - No confusion about singles vs doubles

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

### 🏆 Clubhouse (League & Match Management)
Clubhouse is your central hub for managing teams, leagues, and matches. The homepage provides easy access to all team management features.

#### Clubhouse Home
- **Teams Button**: Access your full teams roster with hide/show capabilities
- **View Leagues**: Browse and manage all your leagues
- **Start Single Match**: Set up quick matches between teams

#### Team Management
- **Create & Organize Teams**: Build your roster of teams
- **Team Visibility Controls**: Hide/show teams to keep your list organized
  - **Active Teams**: View only teams you're currently using
  - **Hidden Teams**: View archived or inactive teams
  - **All Teams**: See your complete roster
  - Toggle visibility with the eye icon on any team card
- **Player Rosters**: Add players to teams (minimum 2 visible teams required for matches)
- **Team Stats**: Track wins, losses, and total games
- **Player Profiles**: View detailed stats for each player
- **Sample Data Generator**: Instantly create 6 teams with 10 players each via the "Sample Data" button in Teams screen

#### League System
- **Create Leagues**: Set up multi-week leagues with any number of teams
- **Custom Duration**: Choose how many weeks the league should run
- **Round-Robin Scheduling**: Automatic schedule generation where each team plays every other team
- **Weekly Matches**: One match per week per team (12 games per match)
- **League Schedule View**: See all weeks and matches at a glance
- **Match Details**: Click on any match to view all 12 games
- **Player Selection**: Dropdown selection for each game (choose from team rosters)
- **Live Scoring**: Real-time scorekeeping for each game with cancellation scoring
- **Match Tracking**: Automatic score updates as games complete

#### Single Matches
- **Quick Setup**: Set up individual 12-game matches between two teams
- **8-Player Rosters**: Select 8 players per team (max 3 games per player)
- **Series Tracking**: Track game-by-game results

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

### 🌽 CornHub (Elite Training Facility)
Transform your game with a comprehensive, elite-level practice environment designed to elevate your skills. CornHub is your personal training facility with data-driven insights and structured development.

#### Elite Features
- **Hero Dashboard**: View your total sessions and weekly activity at a glance
- **AI Training Insights**: Get personalized recommendations based on your performance data
- **Performance Metrics**: Track key stats that matter:
  - Ghost Win Rate - Your competitive performance against AI
  - Clutch Rate - Success rate in high-pressure situations
  - Best Bag Run & Airmail streaks
  - Situational game win rates
- **Training Programs** (Coming Soon):
  - Beginner's Foundation - Master the basics
  - Consistency Builder - Develop reliable patterns
  - Pro Circuit - Elite-level competitive training

#### Practice Modes by Category

**Skill Development:**
- **Bag Run Challenge**: Track consecutive bags made - build consistency
- **Airmail Precision**: Perfect your clean drops without board contact

**Mental Game:**
- **Situational Games**: Train for critical game moments and scenarios
- **Clutch Training**: Master high-pressure shots when it matters most

**Competitive Edge:**
- **Ghost Player**: Play full games against AI at 4 difficulty levels (Easy/Medium/Hard/Pro)
  - Ghost Easy (1-3 PPR) - New to cornhole
  - Ghost Medium (4-6 PPR) - Average competition
  - Ghost Hard (7-9 PPR) - Strong opponents
  - Ghost Expert (10-12 PPR) - Expert level challenge
  - See ghost throws after each round with live PPR tracking
- **Beat Your Best**: Compete against your peak performance

All practice modes feature the intuitive bag counter interface and comprehensive stat tracking to help you identify strengths and target areas for improvement.

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

#### Accessing Clubhouse
1. Tap **🏆 Clubhouse** from home
2. Choose from the following options:
   - **👥 Teams** - Manage your teams roster
   - **🏆 View Leagues** - Browse and manage leagues (requires 2+ visible teams)
   - **🎯 Start Single Match** - Set up quick matches (requires 2+ visible teams)

#### Creating Teams & Players
1. From Clubhouse home, tap **👥 Teams**
2. Create teams with **+ Team** button
3. Add players to each team (need at least 2 visible teams for leagues)
4. **Quick Testing**: Tap gray **Sample Data** button in header to instantly create 6 teams with 10 players each
5. **Organize Teams**: Use the filter tabs to view Active, Hidden, or All teams
6. **Hide/Show Teams**: Tap the eye icon on any team card to toggle visibility (hide inactive teams to keep your list organized)

#### Creating a League
1. From Clubhouse, tap **🏆 View Leagues**
2. Tap **+ League** button to create a new league
3. Enter league name (e.g., "Summer League 2025")
4. Set number of weeks (e.g., 8, 10, 12)
5. Select which teams to include (minimum 2)
6. Tap **Create League**

The app automatically generates a complete round-robin schedule where:
- Each team plays every other team once before rotation
- One match per week per team
- Schedule continues for the specified number of weeks
- **Smart Scheduling**: Teams never play against themselves

**League Persistence**: All leagues are saved permanently! View all your leagues from the League List screen, track progress with visual progress bars, and jump back into any match at any time.

#### Playing League Matches
1. View the league schedule (organized by week)
2. Tap on any match to see all 12 games
3. Expand a game to select players **(2v2 Doubles Format)**:
   - Choose **2 players** from away team (Player 1 & Player 2)
   - Choose **2 players** from home team (Player 1 & Player 2)
   - Total: **4 players per game** (2 from each team playing together)
4. Tap **Start Game (2v2)** to begin live scoring
5. Use counters to track combined bags in/on for each **team**
6. Tap **Enter** after each round
7. Game automatically completes at 21 points
8. Match score updates automatically as games finish

**Key Features**:
- **2v2 Doubles Format**: Two players from each team play together as a team
- Games can be played in any order within a match
- Player selections are made per-game (not locked for entire match)
- Live round-by-round scoring with cancellation rules
- Automatic winner detection
- Match completion tracking (X/12 games)

#### Single Matches (Non-League)
1. From Clubhouse, tap **🎯 Start Single Match**
2. Select away and home teams
3. Select 8 players per team (max 3 games each)
4. Play through 12-game series

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
