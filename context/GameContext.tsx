import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProgress } from '../types';

interface GameContextType {
    progress: GameProgress;
    updateProgress: (progress: Partial<GameProgress>) => void;
    completeLevel: (levelId: number) => void;
    useHint: () => boolean;
    useSkip: () => boolean;
    useExtraBottle: () => boolean;
    claimDailyReward: (rewardType: 'coins' | 'hint' | 'skip' | 'extraBottle' | 'mystery', amount: number) => void;
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => boolean;
    skipLevel: () => boolean;
    isLoaded: boolean;
    completeDailyChallenge: () => void;
    unlockTheme: (themeId: string, cost: number) => boolean;
    setActiveTheme: (themeId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultProgress: GameProgress = {
    completedLevels: [],
    currentLevel: 1,
    coins: 100,
    boosters: {
        hints: 3,
        skips: 1,
        extraBottles: 1
    },
    stars: 0,
    username: 'Player',
    avatar: '1',
    lastDailyPlayDate: null,
    currentStreak: 0,
    dailySolvedToday: false,
    lastDailyRewardDate: null,
    dailyRewardStreak: 0,
    rewardClaimedToday: false,
    unlockedThemes: ['glass'],
    activeTheme: 'glass',
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [progress, setProgress] = useState<GameProgress>(defaultProgress);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const saved = await AsyncStorage.getItem('colorBottleProgress');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Default merge to prevent missing properties in migrated dev environments
                    let mergedProgress = { ...defaultProgress, ...parsed };

                    // Verify Daily Puzzle Streak
                    const today = new Date().toISOString().split('T')[0];
                    if (mergedProgress.lastDailyPlayDate !== today) {
                        mergedProgress.dailySolvedToday = false;
                        if (mergedProgress.lastDailyPlayDate) {
                            const lastDate = new Date(mergedProgress.lastDailyPlayDate);
                            const currentDate = new Date(today);
                            const diffDays = (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
                            if (diffDays > 1) {
                                mergedProgress.currentStreak = 0;
                            }
                        }
                    }

                    // Verify Daily Login Reward Streak
                    if (mergedProgress.lastDailyRewardDate !== today) {
                        mergedProgress.rewardClaimedToday = false;
                        if (mergedProgress.lastDailyRewardDate) {
                            const lastDate = new Date(mergedProgress.lastDailyRewardDate);
                            const currentDate = new Date(today);
                            const diffDays = (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
                            if (diffDays > 1) {
                                mergedProgress.dailyRewardStreak = 0; // Broke the streak, reset to Day 1
                            }
                        }
                    }

                    setProgress(mergedProgress);
                }
            } catch (error) {
                console.error('Failed to load progress', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadProgress();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem('colorBottleProgress', JSON.stringify(progress)).catch(console.error);
        }
    }, [progress, isLoaded]);

    const updateProgress = (updates: Partial<GameProgress>) => {
        setProgress(prev => ({ ...prev, ...updates }));
    };

    const completeLevel = (levelId: number, earnedStars: number = 3) => {
        setProgress(prev => {
            // Don't award duplicate rewards if the level was already completed
            const isAlreadyCompleted = prev.completedLevels.includes(levelId);

            return {
                ...prev,
                completedLevels: Array.from(new Set([...prev.completedLevels, levelId])),
                currentLevel: Math.max(prev.currentLevel, levelId + 1),
                coins: prev.coins + (isAlreadyCompleted ? 0 : 10),
                stars: prev.stars + (isAlreadyCompleted ? 0 : earnedStars)
            };
        });
    };

    const useHint = () => {
        if (progress.boosters.hints > 0) {
            setProgress(prev => ({
                ...prev,
                boosters: { ...prev.boosters, hints: prev.boosters.hints - 1 }
            }));
            return true;
        }
        return false;
    };

    const useSkip = () => {
        if (progress.boosters.skips > 0) {
            setProgress(prev => ({
                ...prev,
                boosters: { ...prev.boosters, skips: prev.boosters.skips - 1 }
            }));
            return true;
        }
        return false;
    };

    const useExtraBottle = () => {
        if (progress.boosters.extraBottles > 0) {
            setProgress(prev => ({
                ...prev,
                boosters: { ...prev.boosters, extraBottles: prev.boosters.extraBottles - 1 }
            }));
            return true;
        }
        return false;
    };

    const claimDailyReward = (rewardType: 'coins' | 'hint' | 'skip' | 'extraBottle' | 'mystery', amount: number) => {
        setProgress(prev => {
            if (prev.rewardClaimedToday) return prev;
            const today = new Date().toISOString().split('T')[0];
            const nextStreak = (prev.dailyRewardStreak + 1) > 7 ? 1 : (prev.dailyRewardStreak + 1); // Loop back after day 7

            let newProgress = { ...prev };

            if (rewardType === 'coins') {
                newProgress.coins += amount;
            } else if (rewardType === 'hint') {
                newProgress.boosters.hints += amount;
            } else if (rewardType === 'skip') {
                newProgress.boosters.skips += amount;
            } else if (rewardType === 'extraBottle') {
                newProgress.boosters.extraBottles += amount;
            } else if (rewardType === 'mystery') {
                // Mystery Chest gives all 3 boosters!
                newProgress.boosters.hints += 1;
                newProgress.boosters.skips += 1;
                newProgress.boosters.extraBottles += 1;
                newProgress.coins += 250;
            }

            return {
                ...newProgress,
                lastDailyRewardDate: today,
                dailyRewardStreak: nextStreak,
                rewardClaimedToday: true
            };
        });
    };

    const addCoins = (amount: number) => {
        setProgress(prev => ({ ...prev, coins: prev.coins + amount }));
    };

    const spendCoins = (amount: number) => {
        if (progress.coins >= amount) {
            setProgress(prev => ({ ...prev, coins: prev.coins - amount }));
            return true;
        }
        return false;
    };

    const skipLevel = () => {
        if (progress.coins >= 20) {
            setProgress(prev => ({
                ...prev,
                coins: prev.coins - 20,
                currentLevel: prev.currentLevel + 1
            }));
            return true;
        }
        return false;
    };

    const completeDailyChallenge = () => {
        setProgress(prev => {
            if (prev.dailySolvedToday) return prev; // Don't award twice

            const today = new Date().toISOString().split('T')[0];
            const newStreak = prev.currentStreak + 1;

            // Base reward 50, Streak Bonus 100 every 3 days
            let earnedCoins = 50;
            if (newStreak % 3 === 0) {
                earnedCoins += 100;
            }

            return {
                ...prev,
                coins: prev.coins + earnedCoins,
                lastDailyPlayDate: today,
                currentStreak: newStreak,
                dailySolvedToday: true,
            };
        });
    };
    const unlockTheme = (themeId: string, cost: number) => {
        if (progress.coins >= cost) {
            setProgress(prev => ({
                ...prev,
                coins: prev.coins - cost,
                unlockedThemes: [...prev.unlockedThemes, themeId]
            }));
            return true;
        }
        return false;
    };

    const setActiveTheme = (themeId: string) => {
        setProgress(prev => ({ ...prev, activeTheme: themeId }));
    };

    return (
        <GameContext.Provider value={{
            progress, updateProgress, completeLevel, useHint, useSkip, useExtraBottle, claimDailyReward, addCoins, spendCoins, skipLevel, isLoaded, completeDailyChallenge, unlockTheme, setActiveTheme
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
}
