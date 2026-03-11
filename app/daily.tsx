import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Undo, Lightbulb, Clock, CalendarCheck, Gift } from 'lucide-react-native';

import { Bottle } from '../components/Bottle';
import { useGame } from '../context/GameContext';
import { generateLevel } from '../utils/levelGenerator';
import { Bottle as BottleType } from '../types';
import { TimeoutModal } from '../components/TimeoutModal';
import { soundManager } from '../utils/sound';

export default function DailyPuzzleScreen() {
    const router = useRouter();
    const { progress, useHint, completeDailyChallenge, spendCoins } = useGame();

    // Generate a consistent "level id" based on today's date so it's identical for everyone
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyHash = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Base it loosely around level 100 for a decent challenge
    const [level] = useState(() => generateLevel(100 + (dailyHash % 50)));

    const [bottles, setBottles] = useState<BottleType[]>(level.bottles);
    const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
    const [pouringBottle, setPouringBottle] = useState<number | null>(null);
    const [targetBottle, setTargetBottle] = useState<number | null>(null);
    const [moveHistory, setMoveHistory] = useState<BottleType[][]>([]);
    const [showComplete, setShowComplete] = useState(progress.dailySolvedToday);

    // 5 Minute Timer
    const [timeLeft, setTimeLeft] = useState(300);
    const [showTimeout, setShowTimeout] = useState(false);

    const contentOpacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        soundManager.init();
        return () => { soundManager.unloadAll(); };
    }, []);

    useEffect(() => {
        if (showComplete || showTimeout || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setShowTimeout(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showComplete, showTimeout, timeLeft]);

    useEffect(() => {
        if (!progress.dailySolvedToday && isLevelComplete()) {
            setTimeout(() => {
                soundManager.play('win');
                completeDailyChallenge();
                setShowComplete(true);
            }, 1000);
        }
    }, [bottles]);

    const isLevelComplete = () => {
        return bottles.every(bottle => {
            if (bottle.colors.length === 0) return true;
            if (bottle.colors.length !== bottle.maxCapacity) return false;
            return bottle.colors.every(color => color === bottle.colors[0]);
        });
    };

    const canPour = (fromBottle: BottleType, toBottle: BottleType) => {
        if (fromBottle.colors.length === 0) return false;
        if (toBottle.colors.length >= toBottle.maxCapacity) return false;
        if (toBottle.colors.length === 0) return true;
        return fromBottle.colors[fromBottle.colors.length - 1] === toBottle.colors[toBottle.colors.length - 1];
    };

    const handleBottleClick = async (clickedBottleId: number) => {
        if (progress.dailySolvedToday) return;
        if (pouringBottle !== null) return; // Block input during animation

        soundManager.play('click');
        if (selectedBottle === null) {
            if (bottles[clickedBottleId].colors.length > 0) {
                setSelectedBottle(clickedBottleId);
            }
        } else {
            if (selectedBottle === clickedBottleId) {
                setSelectedBottle(null);
            } else {
                const fromBottle = bottles[selectedBottle];
                const toBottle = bottles[clickedBottleId];

                if (canPour(fromBottle, toBottle)) {
                    soundManager.play('pour');

                    // Capture current state synchronously BEFORE async wait
                    const historySnapshot = JSON.parse(JSON.stringify(bottles));

                    setPouringBottle(selectedBottle);
                    setTargetBottle(clickedBottleId);
                    await new Promise(resolve => setTimeout(resolve, 600));

                    setMoveHistory(prev => [...prev, historySnapshot]);

                    setBottles(prevBottles => {
                        const newBottles = JSON.parse(JSON.stringify(prevBottles));
                        const currentFrom = newBottles[selectedBottle];
                        const currentTo = newBottles[clickedBottleId];
                        const colorToPour = currentFrom.colors[currentFrom.colors.length - 1];

                        let count = 0;
                        for (let i = currentFrom.colors.length - 1; i >= 0; i--) {
                            if (currentFrom.colors[i] === colorToPour) count++;
                            else break;
                        }

                        const amountToPour = Math.min(count, currentTo.maxCapacity - currentTo.colors.length);
                        for (let i = 0; i < amountToPour; i++) {
                            currentTo.colors.push(colorToPour);
                            currentFrom.colors.pop();
                        }
                        return newBottles;
                    });

                    setPouringBottle(null);
                    setTargetBottle(null);
                } else {
                    soundManager.play('error');
                }
                setSelectedBottle(null);
            }
        }
    };

    const handleUndo = () => {
        if (moveHistory.length > 0) {
            const previousState = moveHistory[moveHistory.length - 1];
            setBottles(JSON.parse(JSON.stringify(previousState)));
            setMoveHistory(moveHistory.slice(0, -1));
            setSelectedBottle(null);
            setPouringBottle(null);
            setTargetBottle(null);
        }
    };

    const handleRestart = () => {
        setBottles(JSON.parse(JSON.stringify(level.bottles)));
        setSelectedBottle(null);
        setMoveHistory([]);
        setPouringBottle(null);
        setTargetBottle(null);
        setTimeLeft(300);
    };

    const handleHint = () => {
        if (useHint()) {
            for (let i = 0; i < bottles.length; i++) {
                for (let j = 0; j < bottles.length; j++) {
                    if (i !== j && canPour(bottles[i], bottles[j])) {
                        setSelectedBottle(i);
                        setTimeout(() => handleBottleClick(j), 1000);
                        return;
                    }
                }
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleBuyTime = () => {
        if (spendCoins(10)) {
            soundManager.play('win');
            setTimeLeft(60);
            setShowTimeout(false);
        } else {
            soundManager.play('error');
        }
    };

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color="#4A6CF7" />
                </Pressable>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.levelTitle}>Daily Puzzle</Text>
                    <Text style={styles.difficultyText}>{progress.dailySolvedToday ? "Already Solved!" : "Hard Challenge"}</Text>
                </View>

                {/* Top Right Timer */}
                <View style={[styles.timerBadge, { backgroundColor: timeLeft <= 30 ? '#FEE2E2' : '#FFFFFF' }]}>
                    <Clock size={20} color={timeLeft <= 30 ? '#FF4D4D' : '#4B5563'} />
                    <Text style={[styles.timerText, { color: timeLeft <= 30 ? '#FF4D4D' : '#4B5563' }]}>
                        {formatTime(timeLeft)}
                    </Text>
                </View>
            </View>

            {/* Streak & Date Banner */}
            <View style={styles.streakBanner}>
                <View style={styles.row}>
                    <CalendarCheck size={20} color="#10B981" />
                    <Text style={styles.bannerText}>{todayStr}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.streakText}>{progress.currentStreak}</Text>
                    <Text style={styles.bannerSubtext}> Day Streak 🔥</Text>
                </View>
            </View>

            {/* Complete Splash Overlay */}
            {showComplete && (
                <View style={styles.completeOverlay}>
                    <Gift size={64} color="#FBBF24" />
                    <Text style={styles.completeTitle}>Challenge Solved!</Text>
                    <Text style={styles.completeDesc}>You've earned your daily rewards.</Text>
                    <Text style={styles.rewardText}>+50 💰 Base Reward</Text>
                    {progress.currentStreak % 3 === 0 && progress.currentStreak > 0 && (
                        <Text style={styles.rewardBonus}>+100 💰 Streak Bonus!</Text>
                    )}
                    <Pressable style={styles.primaryButton} onPress={() => router.push('/')}>
                        <Text style={styles.buttonText}>Back to Home</Text>
                    </Pressable>
                </View>
            )}

            {/* Grid */}
            <Animated.View style={[styles.gridContainer, { opacity: contentOpacity }]}>
                <View style={styles.grid}>
                    {(() => {
                        const dynamicScale = Math.min(1, 10 / bottles.length);
                        return bottles.map((bottle) => (
                            <View key={bottle.id} style={styles.bottleWrapper}>
                                <Bottle
                                    bottle={bottle}
                                    isSelected={selectedBottle === bottle.id}
                                    isPouring={pouringBottle === bottle.id}
                                    isPouringTarget={targetBottle === bottle.id}
                                    bottleIndex={dailyHash % 4}
                                    rowIndex={Math.floor(dailyHash / 4) % 5}
                                    scaleOverride={dynamicScale}
                                    onClick={() => handleBottleClick(bottle.id)}
                                />
                            </View>
                        ));
                    })()}
                </View>
            </Animated.View>

            {/* Bottom Controls */}
            {!showComplete && (
                <View style={styles.controlPanel}>
                    <View style={styles.controlsGrid}>
                        <Pressable onPress={handleUndo} disabled={moveHistory.length === 0} style={[styles.controlItem, moveHistory.length === 0 ? styles.bgDisabled : styles.bgPrimary]}>
                            <Undo size={24} color={moveHistory.length === 0 ? '#9CA3AF' : '#FFF'} />
                            <Text style={[styles.controlText, moveHistory.length === 0 ? styles.textDisabled : styles.textWhite]}>Undo</Text>
                        </Pressable>

                        <Pressable onPress={handleHint} disabled={progress.boosters.hints === 0} style={[styles.controlItem, progress.boosters.hints === 0 ? styles.bgDisabled : styles.bgWarning]}>
                            {progress.boosters.hints > 0 && (
                                <View style={styles.hintBadge}>
                                    <Text style={styles.hintBadgeText}>{progress.boosters.hints}</Text>
                                </View>
                            )}
                            <Lightbulb size={24} color={progress.boosters.hints === 0 ? '#9CA3AF' : '#111827'} />
                            <Text style={[styles.controlText, progress.boosters.hints === 0 ? styles.textDisabled : styles.textDark]}>Hint</Text>
                        </Pressable>

                        <Pressable onPress={handleRestart} style={[styles.controlItem, styles.bgSuccess]}>
                            <RotateCcw size={24} color="#111827" />
                            <Text style={[styles.controlText, styles.textDark]}>Restart</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <TimeoutModal visible={showTimeout} onBuyTime={handleBuyTime} onRestart={() => { setShowTimeout(false); handleRestart(); }} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 },
    iconButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 3 },
    headerTextContainer: { alignItems: 'center' },
    levelTitle: { fontSize: 24, fontWeight: 'bold', color: '#D97706' },
    difficultyText: { fontSize: 14, color: '#B45309' },
    timerBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, elevation: 3 },
    timerText: { fontSize: 16, fontWeight: 'bold' },

    streakBanner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 16, marginBottom: 16, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    bannerText: { fontSize: 16, fontWeight: '600', color: '#374151' },
    streakText: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
    bannerSubtext: { fontSize: 14, color: '#6B7280' },

    completeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 24 },
    completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#D97706', marginTop: 16 },
    completeDesc: { fontSize: 16, color: '#6B7280', marginVertical: 12, textAlign: 'center' },
    rewardText: { fontSize: 24, fontWeight: 'bold', color: '#10B981', marginBottom: 8 },
    rewardBonus: { fontSize: 20, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 32 },
    primaryButton: { backgroundColor: '#4A6CF7', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    gridContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: 16 },
    bottleWrapper: { margin: 8 },

    controlPanel: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, elevation: 10 },
    controlsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    controlItem: { width: 72, height: 84, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 4 },
    bgPrimary: { backgroundColor: '#4A6CF7' },
    bgWarning: { backgroundColor: '#FFD84D' },
    bgSuccess: { backgroundColor: '#4DFF88' },
    bgDisabled: { backgroundColor: '#E5E7EB' },
    controlText: { fontSize: 12, fontWeight: '600' },
    textWhite: { color: '#FFF' },
    textDark: { color: '#111827' },
    textDisabled: { color: '#9CA3AF' },
    hintBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    hintBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});
