# TossSeries - Ultimate Cornhole Tracker

TossSeries is a comprehensive cornhole league management and scoring app built with Expo and React Native.

## Features

### ✅ Implemented

#### 📊 Scoreboard
- Quick game setup with player names
- Unlimited rounds or custom round limits
- Live scoring with bag counters (in/on)
- Real-time statistics during gameplay
- Four-bagger celebration animations
- Game completion modal with winner announcement
- Points Per Round (PPR), bag accuracy percentages

#### 🏆 Clubhouse (League Management)
- Create and manage teams
- Add players to teams (8+ players per team)
- Team statistics tracking
- Player profiles with detailed stats
- League match setup (12-game series format)

#### 📈 CornholeIQ (Advanced Stats)
- Player rankings by bag-in percentage
- Comprehensive player statistics:
  - Win/Loss records
  - Bag accuracy (In %, On %)
  - Points Per Round (PPR)
  - Four-bagger counts
  - Win streaks
  - Total games played

#### 👤 Player Profiles
- Individual player statistics
- Achievement tracking system
- Game history
- Performance metrics

#### 🏅 Achievements System
- First Blood - Win your first game
- Four Bagger - Get all 4 bags in the hole
- The Comeback Kid - Win after being down 10+ points
- On Fire! - Win 5 games in a row
- Shutout - Win without opponent scoring
- More achievements unlock during gameplay

### 🚧 In Progress

#### League Match System
- 12-game series format between teams
- Away team selects players first
- 3-game maximum per player
- Manager notifications for player selection
- Series score tracking

### 📅 Coming Soon

#### 🎯 TossOff (Tournaments)
- Tournament bracket system
- Multi-team competitions
- Playoff tracking

#### 🌽 CornHub (Practice Mode)
- Practice drills with specific goals
- Accuracy training
- Skill progression tracking

## Technical Stack

- **Framework**: Expo SDK 53
- **UI**: React Native 0.76.7
- **Navigation**: React Navigation (Native Stack)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: Zustand with AsyncStorage persistence
- **Animations**: React Native Reanimated v3
- **Icons**: @expo/vector-icons (Ionicons)

## App Structure

```
src/
├── components/           # Reusable UI components
├── navigation/
│   └── types.ts         # Navigation type definitions
├── screens/             # All app screens
│   ├── HomeScreen.tsx
│   ├── ScoreboardSetupScreen.tsx
│   ├── ScoreboardScreen.tsx
│   ├── ClubhouseScreen.tsx
│   ├── CreateTeamScreen.tsx
│   ├── TeamDetailScreen.tsx
│   ├── AddPlayerScreen.tsx
│   ├── PlayerProfileScreen.tsx
│   ├── SeriesSetupScreen.tsx
│   ├── TossOffScreen.tsx
│   ├── CornHubScreen.tsx
│   └── CornholeIQ Screen.tsx
├── state/
│   └── toss-series-store.ts  # Zustand store with persistence
└── types/
    └── toss-series.ts   # TypeScript interfaces

```

## Key Features Explained

### Scoring System
- **Bags In**: 3 points each
- **Bags On**: 1 point each
- **Cancellation scoring**: Only the difference counts each round
- **Winning**: First to 21 points (or high score at round limit)

### League Match Format
- Teams must have 8+ players
- 12 games per series
- Each player can play maximum 3 games
- Away team manager selects players first
- Home team manager responds with their selection
- Games play to 21 points

### Statistics Tracked
- Total games, wins, losses
- Total points scored
- Bags in/on percentages
- Four-baggers
- Points per round average
- Win streaks (current and longest)
- Comeback wins
- Achievements earned

### Data Persistence
All data is automatically saved to device storage using Zustand + AsyncStorage:
- Teams and player rosters
- Game history
- Player statistics
- Achievements
- Tournament data

## Future Enhancements

1. **Photo Integration** - Player profile photos
2. **Live Scoring** - Share live game links
3. **Tournament Brackets** - Full playoff system
4. **Practice Drills** - Skill-building exercises
5. **Historical Trends** - Charts and graphs
6. **Head-to-Head Stats** - Player vs player breakdowns
7. **Team Photos** - Team logos and group photos
8. **Settings** - Customizable rules and notifications
9. **Export Data** - Share stats via email/social
10. **Leaderboards** - Global or league rankings

## Getting Started

The app automatically opens to the home screen with 5 main sections:
1. **Scoreboard** - Quick game tracking
2. **Clubhouse** - League and team management
3. **TossOff** - Tournaments (coming soon)
4. **CornHub** - Practice mode (coming soon)
5. **CornholeIQ** - Statistics dashboard

## Development Notes

- All state management uses Zustand for simplicity and performance
- AsyncStorage automatically persists teams, players, games, and stats
- React Navigation handles all screen transitions
- NativeWind provides responsive, mobile-optimized styling
- Achievement system automatically triggers based on game events
- Four-bagger celebrations use Reanimated for smooth animations

---

Built with ❤️ for cornhole enthusiasts everywhere!
