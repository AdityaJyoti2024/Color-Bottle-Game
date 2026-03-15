export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'empty';

export interface Bottle {
    id: number;
    colors: Color[];
    maxCapacity: number;
}

export interface Level {
    id: number;
    bottles: Bottle[];
    moves: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameProgress {
    completedLevels: number[];
    currentLevel: number;
    coins: number;
    boosters: {
        hints: number;
        skips: number;
        extraBottles: number;
    };
    stars: number;
    username: string;
    avatar: string;
    lastDailyPlayDate: string | null;
    currentStreak: number;
    dailySolvedToday: boolean;
    lastDailyRewardDate: string | null;
    dailyRewardStreak: number;
    rewardClaimedToday: boolean;
    unlockedThemes: string[];
    activeTheme: string;
    country?: string;
}
