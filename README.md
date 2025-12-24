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

### 👤 Profile & Customization
Create and customize your personal profile to make the app truly yours:

#### Profile Features
- **Avatar Selection**: Choose from 48+ emoji avatars including crowns, sports, faces, and animals
- **Theme Colors**: Select from 12 premium color presets to personalize your profile
  - Royal Purple, Crimson Red, Ocean Blue, Forest Green, and more
  - Your chosen color appears throughout the app interface
- **Personal Details**: Add your name, bio, location, and playing history
- **Playing Info**: Set your favorite position (pitcher, blocker, or both) and when you started playing
- **Quick Stats Display**: Toggle to show/hide your personal stats on your profile
- **Member Badge**: Automatically tracks when you joined the app

#### Access Your Profile
- Tap your avatar icon in the top-right corner of the home screen
- Edit mode allows you to customize all aspects of your profile
- Changes save automatically

### 📊 Scoreboard
- **Quick Game Setup**: Enter player names and start tracking immediately
- **Player Name Display**: Shows actual player names throughout the game
- **Tap Mode Scoreboard**: Clean, minimal interface with massive score numbers (220pt font)
  - Tap top half of player area to increment score (+1)
  - Tap bottom half of player area to decrement (-1)
  - No instruction text, just pure scoring interface
  - Scoreholio-style design for maximum visibility
- **Landscape Mode Support**: Automatic landscape orientation detection
  - Screen automatically unlocks orientation when scoreboard opens
  - Player names displayed above scores in landscape
  - Player names displayed below scores in portrait
  - Optimized number sizes and spacing for landscape viewing
  - Returns to portrait lock when you exit the scoreboard
- **Live Scoring**: Real-time score tracking with large, easy-to-read numbers
- **Game Completion**: Winner announcement with final stats
- **Flexible Rounds**: Play unlimited rounds or set a specific limit

### 📊 My Stats (Personal Bag Tracking)
A completely redesigned personal tracking system with enhanced visual appeal and multi-view statistics:

#### View Modes
- **Personal View**: Your overall performance across all matches
- **League View**: Stats broken down by individual leagues (when matches are tagged with league IDs)
- **Global View**: Compare your performance vs all app users worldwide

#### Personal View Features
- **Hero Stats Card**: Large, eye-catching display of your key metrics
  - Win rate with large percentage display
  - Average PPR with round count
  - Quick stats: Total Rounds, DPR (Deadwood Per Round), Four Baggers, and Accuracy

- **Performance vs Opponents**: Visual bar charts comparing your stats
  - Your PPR vs Opponent PPR with colored progress bars
  - Point differential with prominent display
  - Color-coded for quick understanding (green = good, red = needs work)

- **Throwing Accuracy**: Large visual progress bars showing
  - Bags In Hole percentage (green)
  - Bags On Board percentage (blue)
  - Bags Missed percentage (red)
  - Four Bagger Rate highlight card

- **Win Quality Grid**: Card-based display of
  - Shutouts, Dominant wins (10+)
  - Close wins (≤3), Comebacks

- **Current Streak Badge**: Large, prominent display when on a streak
  - Win streaks in green
  - Losing streaks in red (for motivation!)
  - Shows your best streak below

#### League View Features
- **League-Specific Breakdown**: View your performance in each league separately
- **Per-League Stats**: Games played, win percentage, PPR, and accuracy for each league
- **Compare Leagues**: See which leagues you perform best in
- **Match Tracking**: Each league shows number of matches and your record

#### Global View Features
- **Global Rank Display**: See your rank out of all app users
  - Large rank number (#1, #50, #200, etc.)
  - Total user count
  - Percentile ranking (e.g., "Top 15%")

- **Global Leaderboard**: Top 10 users worldwide
  - Shows win rate, PPR, and accuracy for each player
  - Your position highlighted in purple
  - Gold/Silver/Bronze colors for top 3
  - Dominance rating scores

- **vs Global Average**: Compare your stats to worldwide averages
  - Win rate comparison (avg: 50%)
  - Bags In % comparison (avg: 35%)
  - Points Per Round comparison (avg: 4.5 PPR)
  - Visual progress bars showing your performance
  - Color-coded indicators (green = above average, yellow/red = below)

#### Additional Features

- **Sample Season Data**: Load 24 sample matches to test functionality
  - Click "Load Sample" button when you have no stats
  - Generates realistic match data over 3 months
  - 60% win rate with varied opponents

- **Recent Matches**: Condensed, card-based display
  - Match score with win/loss badge
  - PPR and round count
  - Easy-to-scan layout
  - **Tap to View Details**: Click any match to see complete round-by-round breakdown
  - **View All Button**: Navigate to full Match History to see all completed games

- **Match History**: Complete archive of all your games
  - View every match you've played with scores, dates, and results
  - See match stats: rounds played, PPR, and accuracy
  - Tap any match to view detailed breakdown
  - **Edit Protection**: Completed games (reached 21 points) are locked to preserve stat integrity

- **Match Details**: Deep dive into individual game performance
  - Complete round-by-round breakdown showing your throws and opponent's performance
  - Match summary stats: total bags in/on/missed, accuracy percentages
  - Notable achievements: four-baggers, three-baggers, zero rounds
  - Your PPR vs opponent PPR comparison
  - **Round Editing**: Edit individual rounds for in-progress games only (locked when game reaches 21)
  - **Lock Indicators**: Clear visual badges show when a game is complete and editing is disabled
  - Full scoring history with raw points per round
  - **Edit Round Feature**: Tap the "Edit" button on any specific round to edit just that round
    - Opens the scoreboard interface with that round's data pre-loaded
    - Make your corrections and tap "Enter" to save
    - Returns directly to Match Details when done
    - Quick and focused editing for fixing individual round errors
  - **Game Completion Lock**: Once a game reaches 21 points, editing is locked
    - Maintains accurate historical stats by preventing retroactive changes
    - Edit buttons show "Locked" for completed games
    - Prevents editing after final score is recorded
    - Info badge explains why completed games cannot be edited

- **Quick Log Mode**: Fast bag throw logging for practice
  - Big, colorful buttons for instant logging (In/On/Miss)
  - Real-time stats updates showing session performance
  - Live streak tracking
  - Perfect for solo practice or casual play

- **Match Logging**: Full game tracking with comprehensive real-time stats
  - Log complete matches with opponent names
  - **Ultra-Compact Grid Layout - Zero Scrolling for Round Entry**:
    - YOUR stats: Bags In and Bags On side-by-side in compact 2x3 grids
    - Green for Bags In, Blue for Bags On
    - Smart validation prevents exceeding 4 total bags
    - Opponent score: All valid scores (0-10, 12) visible in compact grid
    - Entire round entry fits on screen - no scrolling needed to enter scores
    - Reduced padding and font sizes for maximum efficiency
  - **Compact Real-Time Stats Display**: Complete performance dashboard updating live, no scrolling needed
    - **IN%**: Percentage of throws that go in the hole
    - **BOARD%**: Total percentage on board (in + on combined)
    - **OFF%**: Percentage that miss the board entirely
    - **PPR**: Points Per Round - average raw points from your bags per round (3 × bags in + 1 × bags on) ÷ rounds, calculated BEFORE cancellation scoring
    - **OPPR**: Opponent Points Per Round - average raw points from their bags per round (3 × bags in + 1 × bags on) ÷ rounds, calculated BEFORE cancellation scoring
    - **DIFF**: PPR minus OPPR (green when winning, red when losing)
    - **TOT PTS**: Your cumulative game score
    - **OPP**: Opponent's cumulative game score
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
  - Opponent PPR based on YOUR personal stats (from My Stats)
  - Difficulty modifiers: Easy (same PPR), Medium (+0.5), Hard (+1.0), Pro (+1.5)
  - Shows opponent PPR before each game so you know what you're facing
  - If you have no stats, defaults to a 5.0 PPR baseline
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

### 🏆 TossOff (Tournaments & Brackets)
Professional tournament management system with blind draw functionality, Switcholio, and bracket visualization. Perfect for running ACL-compliant events.

#### Tournament Scoreboard
- **Scoreboard 3 Design**: Clean tap-style layout with bag counter overlays
  - Large score displays with team names
  - Compact bag counters (In/On) overlaid in corners
  - Real-time round score calculation
  - Enter button to complete rounds
  - Undo functionality for last round
  - Landscape mode support
  - **Dual Match Type Support**: Works seamlessly for both round-robin and bracket matches

#### Bracket Visualization
- **Dedicated Bracket Screen**: Full-screen bracket view with enhanced visibility
  - **Quick Access Button**: Prominent "View Tournament Bracket" button on tournament detail page
  - **Coming Up Section**: Shows next 3 ready-to-play matches at the top for easy reference
  - **Match Statistics**: Display completed vs upcoming matches with progress tracking
  - **Always Available**: Bracket button visible as soon as bracket is generated
- **Visual Bracket Trees**: Beautiful, interactive tournament brackets
  - Horizontal scrolling bracket display
  - Color-coded winner highlighting (green for winners)
  - **Seed Numbers**: Purple badges showing team seeds (1, 2, 3, etc.) for proper tournament structure
  - **Improved Round Labels**: Clear progression (Round of 16, Quarter-Finals, Semi-Finals, Finals)
  - Team name abbreviations for compact display
  - Tap any match to enter scores
  - Support for both single and double elimination
  - Automatic spacing and visual connections between rounds
  - Real-time bracket updates as matches complete
- **Bracket Preview**: Info badge during team generation showing teams ready for bracket creation

#### Search & Filter
- **Team Search**: Find teams or players quickly in Teams List
  - Search by team name or player name
  - Real-time filtering as you type
  - Clear search button for quick reset
  - Works with Active/Hidden/All views
- **Player Search**: Search players in CornholeIQ stats screen
  - Search by player name or nickname
  - Instant results with stat preservation
  - Smart empty states for no results

#### Tournament Formats
- **Blind Draw Doubles**: Automatically generate balanced teams using skill tier system (A/B/C)
  - Smart pairing algorithm: pairs A with C first, then A with B, then B with C
  - Ghost player handling for odd numbers
  - Manual pairing override available
  - Proceeds through round-robin phase before bracket play
- **Switcholio**: Rotating partners each game for individual rankings
  - Track partner history to prevent repeats
  - **Individual Leaderboards**: Full leaderboard with wins, losses, PPR, and accuracy
  - **Complete Scoring System**: Record match results and track individual performance
  - Does NOT lead to bracket play (individual competition only)
- **Round Robin**: Every team plays every other team
  - Automatic scheduling
  - Track standings and point differential
  - Proceeds to bracket phase after completion
- **Single Elimination**: Traditional bracket tournament
  - **Full Bracket Pre-Generation**: All rounds created upfront for complete visibility
  - **Automatic Advancement**: Winners automatically move to next round
  - **Bye Handling**: Non-power-of-2 team counts handled with automatic byes
  - **Real-Time Updates**: Bracket updates immediately when matches complete
- **Double Elimination**: Second chance bracket for losers
  - **Winners Bracket + Losers Bracket**: Complete double elimination structure
  - **Automatic Loser Routing**: Losing teams automatically enter losers bracket
  - **Grand Finals**: Winners of both brackets meet in final match
  - **Full Implementation**: True double elimination with all bracket logic

#### ACL Compliance
- Minimum team requirements (default 6 teams)
- Tournament type tagging (Local, Regional, Open)
- Large event splitting (>64 teams)
- Points to win configuration (default 21)

#### Tournament Management Features
- **Player Registration & Check-In**: Manage player lists with check-in tracking
- **Skill Tier Assignment**: Rate players as A/B/C for balanced team generation
- **Team Generation**: One-click random team creation with tier balancing
- **Live Leaderboards**: Real-time standings during events
- **Season Tracking**: Track multiple tournaments and cumulative stats
- **Match History**: Complete record of all tournament games

#### Creating a Tournament
1. Tap **TossOff** from home
2. Tap **+ New** to create tournament
3. Enter tournament name
4. Select format (Blind Draw, Switcholio, Round Robin, or Bracket)
5. Choose type (Local, Regional, or Open)
6. Configure settings:
   - Enable skill tiers for balanced pairing
   - Set minimum teams (ACL compliance)
   - Set points to win (default 21)
7. Tap **Create** to start registration

#### Running a Tournament
1. **Registration Phase**: Add players to the tournament
2. **Check-In Phase**: Check in players as they arrive
3. **Team Generation**: Generate teams using blind draw algorithm
4. **Competition Phase**:
   - For Round Robin: Tap "Start Round Robin" to generate the full schedule
   - Tap **Start** on any match to begin live scoring
   - Track bags in/on for each team using the scoring modal
   - Scores automatically save to the tournament when the game ends
5. **Completion**: View final standings and champion

## 🎮 How to Use

### Your Profile
1. Tap your **avatar icon** in the top-right corner of the home screen
2. Tap the **edit icon** to enter edit mode
3. Customize your profile:
   - Tap your avatar to choose a new one from 48+ options
   - Select a theme color from 12 premium presets
   - Add your name, bio, location, and playing history
   - Set your favorite position and when you started playing
4. Toggle settings like displaying stats on your profile
5. Tap **Save** when done, or **Cancel** to discard changes

### Quick Game (Scoreboard)
1. Tap **📊 Scoreboard** from home
2. Enter player names
3. Optionally set total rounds
4. Tap **Start Game**
5. Tap top half of player area to add points (+1)
6. Tap bottom half of player area to subtract points (-1)
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
- User profile and customization preferences
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

### Code Quality & Best Practices
- **Custom Modal System**: All native Alert.alert calls replaced with beautiful custom modals
  - `AlertModal` component for simple notifications
  - `ConfirmModal` component for confirmation dialogs with destructive action support
  - `ErrorToast` component for animated error notifications
  - Consistent, iOS-style design across all modals
- **Proper Error Handling**: All API errors are properly thrown and propagated to the UI
  - No silent console.log failures
  - Errors include descriptive context about what failed
  - API key validation with clear error messages
- **Type Safety**: Strict TypeScript usage throughout the app
  - Navigation types properly defined
  - Icon types validated against Ionicons glyphMap
  - Minimal use of `any` type (only where necessary for React Native APIs)
- **Clean Console**: Production code free of debug console statements
  - Sound playback failures handled gracefully
  - Sample data generation runs silently
  - API errors properly thrown instead of logged

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

1. ~~Tournament bracket visualization~~ ✅ **COMPLETED**
2. ~~Search/filter for teams and players~~ ✅ **COMPLETED**
3. Tournament seeding options (manual/skill-based)
4. Practice drills with targets and timers
5. Photo uploads for players and teams
6. Export stats to CSV/PDF
7. Head-to-head player comparisons
8. Historical trend charts
9. Game templates for recurring matchups
10. Social features (share games, challenge friends)

## 🏁 Getting Started

The app automatically opens to the home screen. From there:
- **Customize your profile** by tapping your avatar icon in the top-right
- Play a quick game with **Scoreboard**
- Build your league with **Clubhouse**
- Review performance in **CornholeIQ**
- Improve your skills in **CornHub** practice area
- Compete in tournaments with **TossOff** (coming soon)

## 🌐 Offline & Network Support

Your app now works seamlessly both online and offline with intelligent handling of network-dependent features.

### Offline Features
- **All Core Functionality Works Offline**:
  - Scoreboard and game tracking
  - Team and league management
  - Personal stats tracking
  - Practice modes and CornHub
  - Tournament management
  - All data is stored locally and persists between sessions

### Network Detection
- **Live Status Indicator**: Amber banner appears at the top when you go offline
- **Smart Caching**: API responses are cached so you can access previously loaded data offline
- **Pending Actions Queue**: Actions that require internet are saved and automatically sync when you reconnect

### Online-Only Features
When internet is available, you can use:
- AI-powered features (chat, analysis)
- Image generation
- Audio transcription
- External API integrations

### How It Works
- The app automatically detects your network status
- Features that require internet will show helpful messages when offline
- All your game data, teams, players, and stats work without internet
- When you reconnect, any pending actions automatically sync

### Developer Tools
Developers can use the offline system:
- `useNetwork()` hook to check connection status
- `useOfflineCache()` for caching API responses
- `OfflineGuard` component to protect online-only features
- `chatWithAIOffline()`, `generateImageOffline()`, `transcribeAudioOffline()` wrappers for graceful offline handling

## 📝 Notes

- All changes are automatically saved
- Core features work without internet
- Network-dependent features gracefully handle offline state
- Data persists between app sessions
- Optimized for iOS (Android support may vary)

---

**TossSeries** - Track every toss, celebrate every win! 🎯
