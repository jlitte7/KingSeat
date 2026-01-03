import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ProgramId = "beginner" | "consistency" | "pro";
export type ActivityType = "bagRun" | "airmail" | "ghost" | "situational" | "clutch";

export interface ChallengeGoal {
  type: "streak" | "wins" | "accuracy" | "count";
  target: number;
  current: number;
}

export interface WorkoutActivity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  goal?: string;
  goalRequirement?: ChallengeGoal; // Numeric goal that must be achieved
  completed: boolean;
  completedAt?: string;
}

export interface WorkoutDay {
  day: number;
  title: string;
  description: string;
  activities: WorkoutActivity[];
  completed: boolean;
  completedAt?: string;
}

export interface TrainingProgram {
  id: ProgramId;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalDays: number;
  currentDay: number;
  days: WorkoutDay[];
  started: boolean;
  startedAt?: string;
  completed: boolean;
  completedAt?: string;
}

export interface ActiveChallenge {
  programId: ProgramId;
  day: number;
  activityId: string;
  activityType: ActivityType;
  goalRequirement: ChallengeGoal;
  startedAt: string;
}

interface TrainingState {
  programs: TrainingProgram[];
  activeProgram: ProgramId | null;
  activeChallenge: ActiveChallenge | null;

  // Actions
  startProgram: (programId: ProgramId) => void;
  startChallenge: (programId: ProgramId, day: number, activityId: string) => void;
  updateChallengeProgress: (progress: number) => void;
  completeActiveChallenge: () => void;
  cancelActiveChallenge: () => void;
  completeActivity: (programId: ProgramId, day: number, activityId: string) => void;
  resetActivity: (programId: ProgramId, day: number, activityId: string) => void;
  completeDay: (programId: ProgramId, day: number) => void;
  resetDay: (programId: ProgramId, day: number) => void;
  resetProgram: (programId: ProgramId) => void;
  setActiveProgram: (programId: ProgramId | null) => void;
  getProgram: (programId: ProgramId) => TrainingProgram | undefined;
  getProgramProgress: (programId: ProgramId) => number;
}

const createBeginnerProgram = (): TrainingProgram => ({
  id: "beginner",
  name: "Beginner's Foundation",
  description: "Master the basics with structured drills",
  icon: "school",
  color: "#10b981",
  totalDays: 7,
  currentDay: 1,
  started: false,
  completed: false,
  days: [
    {
      day: 1,
      title: "Getting Started",
      description: "Learn the fundamentals of consistent throwing",
      completed: false,
      activities: [
        { id: "b1-1", type: "bagRun", name: "Bag Run", description: "Complete a bag run session", goal: "Aim for 3+ streak", completed: false },
        { id: "b1-2", type: "ghost", name: "Ghost Easy", description: "Play against Ghost Easy", goal: "Get comfortable with scoring", completed: false },
      ],
    },
    {
      day: 2,
      title: "Building Rhythm",
      description: "Develop your throwing rhythm",
      completed: false,
      activities: [
        { id: "b2-1", type: "bagRun", name: "Bag Run x2", description: "Complete 2 bag run sessions", goal: "Focus on form", completed: false },
        { id: "b2-2", type: "bagRun", name: "Bag Run x2", description: "Second session", goal: "Beat your first streak", completed: false },
      ],
    },
    {
      day: 3,
      title: "Accuracy Focus",
      description: "Work on hitting your target consistently",
      completed: false,
      activities: [
        { id: "b3-1", type: "airmail", name: "Airmail Practice", description: "Practice clean drops", goal: "Land 2+ airmails", completed: false },
        { id: "b3-2", type: "bagRun", name: "Bag Run", description: "Apply accuracy focus", goal: "4+ streak", completed: false },
      ],
    },
    {
      day: 4,
      title: "Game Situations",
      description: "Introduction to game pressure",
      completed: false,
      activities: [
        { id: "b4-1", type: "ghost", name: "Ghost Easy", description: "Win against Ghost Easy", goal: "Win the game", completed: false },
        { id: "b4-2", type: "situational", name: "Situational Game", description: "Try a comeback scenario", goal: "Experience pressure", completed: false },
      ],
    },
    {
      day: 5,
      title: "Consistency Check",
      description: "Test your progress",
      completed: false,
      activities: [
        { id: "b5-1", type: "bagRun", name: "Bag Run", description: "Streak challenge", goal: "5+ streak", completed: false },
        { id: "b5-2", type: "airmail", name: "Airmail Practice", description: "Clean drops", goal: "3+ airmails", completed: false },
        { id: "b5-3", type: "ghost", name: "Ghost Easy", description: "Confidence builder", goal: "Win decisively", completed: false },
      ],
    },
    {
      day: 6,
      title: "Level Up",
      description: "Push your limits",
      completed: false,
      activities: [
        { id: "b6-1", type: "ghost", name: "Ghost Medium", description: "Step up the challenge", goal: "Try to win", completed: false },
        { id: "b6-2", type: "bagRun", name: "Bag Run", description: "Personal best attempt", goal: "New streak record", completed: false },
      ],
    },
    {
      day: 7,
      title: "Foundation Complete",
      description: "Final assessment",
      completed: false,
      activities: [
        { id: "b7-1", type: "bagRun", name: "Bag Run", description: "Final streak test", goal: "6+ streak", completed: false },
        { id: "b7-2", type: "ghost", name: "Ghost Medium", description: "Competitive game", goal: "Win to graduate", completed: false },
        { id: "b7-3", type: "situational", name: "Situational Game", description: "Clutch moment", goal: "Handle pressure", completed: false },
      ],
    },
  ],
});

const createConsistencyProgram = (): TrainingProgram => ({
  id: "consistency",
  name: "Consistency Builder",
  description: "Develop reliable throwing patterns",
  icon: "bar-chart",
  color: "#3b82f6",
  totalDays: 7,
  currentDay: 1,
  started: false,
  completed: false,
  days: [
    {
      day: 1,
      title: "Baseline Assessment",
      description: "Establish your current consistency level",
      completed: false,
      activities: [
        { id: "c1-1", type: "bagRun", name: "Bag Run", description: "Warm up session", goal: "Find your rhythm", completed: false },
        { id: "c1-2", type: "bagRun", name: "Bag Run", description: "Baseline test", goal: "Record your best", completed: false },
        { id: "c1-3", type: "ghost", name: "Ghost Medium", description: "Competitive baseline", goal: "Note your PPR", completed: false },
      ],
    },
    {
      day: 2,
      title: "Volume Training",
      description: "Build muscle memory through repetition",
      completed: false,
      activities: [
        { id: "c2-1", type: "bagRun", name: "Bag Run x3", description: "First session", goal: "6+ streak", completed: false },
        { id: "c2-2", type: "bagRun", name: "Bag Run x3", description: "Second session", goal: "Match or beat", completed: false },
        { id: "c2-3", type: "bagRun", name: "Bag Run x3", description: "Third session", goal: "New record?", completed: false },
      ],
    },
    {
      day: 3,
      title: "Precision Day",
      description: "Focus on clean, accurate throws",
      completed: false,
      activities: [
        { id: "c3-1", type: "airmail", name: "Airmail Focus", description: "Clean drops only", goal: "4+ airmails", completed: false },
        { id: "c3-2", type: "airmail", name: "Airmail Focus", description: "Second round", goal: "5+ airmails", completed: false },
        { id: "c3-3", type: "bagRun", name: "Bag Run", description: "Apply precision", goal: "8+ streak", completed: false },
      ],
    },
    {
      day: 4,
      title: "Game Application",
      description: "Apply consistency under pressure",
      completed: false,
      activities: [
        { id: "c4-1", type: "ghost", name: "Ghost Medium", description: "Warm up game", goal: "Win comfortably", completed: false },
        { id: "c4-2", type: "ghost", name: "Ghost Hard", description: "Challenge game", goal: "Stay consistent", completed: false },
        { id: "c4-3", type: "situational", name: "Situational", description: "Pressure test", goal: "Close game", completed: false },
      ],
    },
    {
      day: 5,
      title: "Streak Building",
      description: "Push your consecutive makes",
      completed: false,
      activities: [
        { id: "c5-1", type: "bagRun", name: "Bag Run", description: "Streak focus", goal: "8+ streak", completed: false },
        { id: "c5-2", type: "bagRun", name: "Bag Run", description: "Beat previous", goal: "New record", completed: false },
        { id: "c5-3", type: "clutch", name: "Clutch Training", description: "Pressure makes", goal: "60%+ success", completed: false },
      ],
    },
    {
      day: 6,
      title: "Competition Simulation",
      description: "Full game intensity",
      completed: false,
      activities: [
        { id: "c6-1", type: "ghost", name: "Ghost Hard", description: "Competitive game 1", goal: "Win", completed: false },
        { id: "c6-2", type: "ghost", name: "Ghost Hard", description: "Competitive game 2", goal: "Back to back", completed: false },
        { id: "c6-3", type: "situational", name: "Clutch Scenarios", description: "Close game practice", goal: "Win 2/3", completed: false },
      ],
    },
    {
      day: 7,
      title: "Consistency Certified",
      description: "Final consistency test",
      completed: false,
      activities: [
        { id: "c7-1", type: "bagRun", name: "Bag Run", description: "Final streak test", goal: "10+ streak", completed: false },
        { id: "c7-2", type: "airmail", name: "Airmail Test", description: "Precision check", goal: "5+ airmails", completed: false },
        { id: "c7-3", type: "ghost", name: "Ghost Hard", description: "Final exam", goal: "Win decisively", completed: false },
      ],
    },
  ],
});

const createProProgram = (): TrainingProgram => ({
  id: "pro",
  name: "Pro Circuit",
  description: "Elite-level training for competitors",
  icon: "trophy",
  color: "#f59e0b",
  totalDays: 7,
  currentDay: 1,
  started: false,
  completed: false,
  days: [
    {
      day: 1,
      title: "Pro Warm-Up",
      description: "Elite-level session start",
      completed: false,
      activities: [
        { id: "p1-1", type: "bagRun", name: "Bag Run", description: "Quick warm-up", goal: "10+ streak", completed: false },
        { id: "p1-2", type: "ghost", name: "Ghost Pro", description: "Face the best", goal: "Compete closely", completed: false },
        { id: "p1-3", type: "situational", name: "Pressure Scenario", description: "High stakes", goal: "Win clutch", completed: false },
      ],
    },
    {
      day: 2,
      title: "Four Bagger Focus",
      description: "Train for perfect rounds",
      completed: false,
      activities: [
        { id: "p2-1", type: "bagRun", name: "Streak Training", description: "Max streak attempt", goal: "12+ streak", completed: false },
        { id: "p2-2", type: "airmail", name: "Airmail Mastery", description: "Clean 4-baggers", goal: "6+ airmails", completed: false },
        { id: "p2-3", type: "ghost", name: "Ghost Pro", description: "Apply perfect rounds", goal: "Win", completed: false },
      ],
    },
    {
      day: 3,
      title: "Mental Toughness",
      description: "Clutch performance training",
      completed: false,
      activities: [
        { id: "p3-1", type: "clutch", name: "Clutch Training", description: "Pressure reps", goal: "70%+ success", completed: false },
        { id: "p3-2", type: "situational", name: "Comeback Scenarios", description: "Down big, fight back", goal: "Win 2/3", completed: false },
        { id: "p3-3", type: "situational", name: "Close Games", description: "Tight finishes", goal: "Close it out", completed: false },
      ],
    },
    {
      day: 4,
      title: "Tournament Simulation",
      description: "Back-to-back high intensity",
      completed: false,
      activities: [
        { id: "p4-1", type: "ghost", name: "Ghost Hard", description: "Game 1", goal: "Win", completed: false },
        { id: "p4-2", type: "ghost", name: "Ghost Pro", description: "Game 2", goal: "Win", completed: false },
        { id: "p4-3", type: "ghost", name: "Ghost Pro", description: "Championship", goal: "Sweep", completed: false },
      ],
    },
    {
      day: 5,
      title: "Peak Performance",
      description: "Push your limits",
      completed: false,
      activities: [
        { id: "p5-1", type: "bagRun", name: "Max Streak", description: "Personal record attempt", goal: "15+ streak", completed: false },
        { id: "p5-2", type: "airmail", name: "Perfect Drops", description: "Airmail record", goal: "8+ airmails", completed: false },
        { id: "p5-3", type: "clutch", name: "Clutch Mastery", description: "Under pressure", goal: "80%+ success", completed: false },
      ],
    },
    {
      day: 6,
      title: "Championship Prep",
      description: "Final tuning",
      completed: false,
      activities: [
        { id: "p6-1", type: "bagRun", name: "Warm-Up", description: "Get loose", goal: "10+ streak", completed: false },
        { id: "p6-2", type: "situational", name: "Pressure Scenarios", description: "All scenarios", goal: "Win all", completed: false },
        { id: "p6-3", type: "ghost", name: "Ghost Pro x2", description: "Back to back wins", goal: "Dominate", completed: false },
      ],
    },
    {
      day: 7,
      title: "Pro Certified",
      description: "Prove you belong",
      completed: false,
      activities: [
        { id: "p7-1", type: "bagRun", name: "Elite Streak", description: "Final streak test", goal: "12+ streak", completed: false },
        { id: "p7-2", type: "ghost", name: "Ghost Pro", description: "Championship round 1", goal: "Win big", completed: false },
        { id: "p7-3", type: "ghost", name: "Ghost Pro", description: "Championship round 2", goal: "Prove elite", completed: false },
        { id: "p7-4", type: "situational", name: "Clutch Final", description: "Win under pressure", goal: "Champion", completed: false },
      ],
    },
  ],
});

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      programs: [
        createBeginnerProgram(),
        createConsistencyProgram(),
        createProProgram(),
      ],
      activeProgram: null,
      activeChallenge: null,

      startProgram: (programId: ProgramId) => {
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? { ...p, started: true, startedAt: new Date().toISOString() }
              : p
          ),
          activeProgram: programId,
        }));
      },

      startChallenge: (programId: ProgramId, day: number, activityId: string) => {
        const program = get().programs.find((p) => p.id === programId);
        if (!program) return;

        const dayData = program.days.find((d) => d.day === day);
        if (!dayData) return;

        const activity = dayData.activities.find((a) => a.id === activityId);
        if (!activity) return;

        // Parse goal string to determine requirement
        const goalText = activity.goal || "";
        let goalRequirement: ChallengeGoal = { type: "streak", target: 3, current: 0 };

        // Parse goals like "3+ streak", "6+ streak", "Win", etc.
        const streakMatch = goalText.match(/(\d+)\+?\s*streak/i);
        const airmailMatch = goalText.match(/(\d+)\+?\s*airmail/i);
        const winMatch = goalText.match(/win/i);
        const accuracyMatch = goalText.match(/(\d+)%/i);

        if (streakMatch) {
          goalRequirement = { type: "streak", target: parseInt(streakMatch[1]), current: 0 };
        } else if (airmailMatch) {
          goalRequirement = { type: "count", target: parseInt(airmailMatch[1]), current: 0 };
        } else if (winMatch) {
          goalRequirement = { type: "wins", target: 1, current: 0 };
        } else if (accuracyMatch) {
          goalRequirement = { type: "accuracy", target: parseInt(accuracyMatch[1]), current: 0 };
        }

        set({
          activeChallenge: {
            programId,
            day,
            activityId,
            activityType: activity.type,
            goalRequirement,
            startedAt: new Date().toISOString(),
          },
        });
      },

      updateChallengeProgress: (progress: number) => {
        set((state) => {
          if (!state.activeChallenge) return state;
          return {
            activeChallenge: {
              ...state.activeChallenge,
              goalRequirement: {
                ...state.activeChallenge.goalRequirement,
                current: progress,
              },
            },
          };
        });
      },

      completeActiveChallenge: () => {
        const challenge = get().activeChallenge;
        if (!challenge) return;

        // Complete the activity
        get().completeActivity(challenge.programId, challenge.day, challenge.activityId);

        // Clear the active challenge
        set({ activeChallenge: null });
      },

      cancelActiveChallenge: () => {
        set({ activeChallenge: null });
      },

      completeActivity: (programId: ProgramId, day: number, activityId: string) => {
        set((state) => ({
          programs: state.programs.map((p) => {
            if (p.id !== programId) return p;

            const updatedDays = p.days.map((d) => {
              if (d.day !== day) return d;

              const updatedActivities = d.activities.map((a) =>
                a.id === activityId
                  ? { ...a, completed: true, completedAt: new Date().toISOString() }
                  : a
              );

              // Check if all activities are complete
              const allComplete = updatedActivities.every((a) => a.completed);

              return {
                ...d,
                activities: updatedActivities,
                completed: allComplete,
                completedAt: allComplete ? new Date().toISOString() : undefined,
              };
            });

            // Check if moving to next day
            const currentDayComplete = updatedDays.find((d) => d.day === day)?.completed;
            const newCurrentDay = currentDayComplete && day < p.totalDays ? day + 1 : p.currentDay;

            // Check if program complete
            const programComplete = updatedDays.every((d) => d.completed);

            return {
              ...p,
              days: updatedDays,
              currentDay: Math.max(p.currentDay, newCurrentDay),
              completed: programComplete,
              completedAt: programComplete ? new Date().toISOString() : undefined,
            };
          }),
        }));
      },

      resetActivity: (programId: ProgramId, day: number, activityId: string) => {
        console.log("[resetActivity] Called with:", { programId, day, activityId });
        set((state) => {
          const newPrograms = state.programs.map((p) => {
            if (p.id !== programId) return p;

            const updatedDays = p.days.map((d) => {
              if (d.day !== day) return d;

              console.log("[resetActivity] Found day, activities:", d.activities.map(a => ({ id: a.id, completed: a.completed })));

              const updatedActivities = d.activities.map((a) => {
                if (a.id === activityId) {
                  console.log("[resetActivity] Resetting activity:", a.id);
                  return { ...a, completed: false, completedAt: undefined };
                }
                return a;
              });

              // Recalculate day completion
              const allComplete = updatedActivities.every((a) => a.completed);

              return {
                ...d,
                activities: updatedActivities,
                completed: allComplete,
                completedAt: allComplete ? d.completedAt : undefined,
              };
            });

            // Recalculate program completion
            const programComplete = updatedDays.every((d) => d.completed);

            return {
              ...p,
              days: updatedDays,
              completed: programComplete,
              completedAt: programComplete ? p.completedAt : undefined,
            };
          });

          console.log("[resetActivity] New state set");
          return { programs: newPrograms };
        });
      },

      completeDay: (programId: ProgramId, day: number) => {
        set((state) => ({
          programs: state.programs.map((p) => {
            if (p.id !== programId) return p;

            const updatedDays = p.days.map((d) =>
              d.day === day
                ? {
                    ...d,
                    completed: true,
                    completedAt: new Date().toISOString(),
                    activities: d.activities.map((a) => ({
                      ...a,
                      completed: true,
                      completedAt: a.completedAt || new Date().toISOString(),
                    })),
                  }
                : d
            );

            const newCurrentDay = day < p.totalDays ? day + 1 : p.currentDay;
            const programComplete = updatedDays.every((d) => d.completed);

            return {
              ...p,
              days: updatedDays,
              currentDay: Math.max(p.currentDay, newCurrentDay),
              completed: programComplete,
              completedAt: programComplete ? new Date().toISOString() : undefined,
            };
          }),
        }));
      },

      resetDay: (programId: ProgramId, day: number) => {
        set((state) => ({
          programs: state.programs.map((p) => {
            if (p.id !== programId) return p;

            const updatedDays = p.days.map((d) =>
              d.day === day
                ? {
                    ...d,
                    completed: false,
                    completedAt: undefined,
                    activities: d.activities.map((a) => ({
                      ...a,
                      completed: false,
                      completedAt: undefined,
                    })),
                  }
                : d
            );

            // Recalculate program completion
            const programComplete = updatedDays.every((d) => d.completed);

            return {
              ...p,
              days: updatedDays,
              completed: programComplete,
              completedAt: programComplete ? p.completedAt : undefined,
            };
          }),
        }));
      },

      resetProgram: (programId: ProgramId) => {
        set((state) => ({
          programs: state.programs.map((p) => {
            if (p.id !== programId) return p;

            // Reset to initial state based on program type
            if (programId === "beginner") return createBeginnerProgram();
            if (programId === "consistency") return createConsistencyProgram();
            if (programId === "pro") return createProProgram();
            return p;
          }),
          activeProgram: state.activeProgram === programId ? null : state.activeProgram,
        }));
      },

      setActiveProgram: (programId: ProgramId | null) => {
        set({ activeProgram: programId });
      },

      getProgram: (programId: ProgramId) => {
        return get().programs.find((p) => p.id === programId);
      },

      getProgramProgress: (programId: ProgramId) => {
        const program = get().programs.find((p) => p.id === programId);
        if (!program) return 0;

        const totalActivities = program.days.reduce(
          (sum, d) => sum + d.activities.length,
          0
        );
        const completedActivities = program.days.reduce(
          (sum, d) => sum + d.activities.filter((a) => a.completed).length,
          0
        );

        return totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
      },
    }),
    {
      name: "training-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
