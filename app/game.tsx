import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, Undo, Lightbulb, Coins, SkipForward, Clock, PlusSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Bottle } from '../components/Bottle';
import { useGame } from '../context/GameContext';
import { generateLevel } from '../utils/levelGenerator';
import { Bottle as BottleType } from '../types';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { TimeoutModal } from '../components/TimeoutModal';
import { soundManager } from '../utils/sound';

export default function GameScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const levelId = id ? Number(id) : 1;

    const { progress, completeLevel, useHint, useSkip, useExtraBottle, skipLevel, spendCoins } = useGame();

    const [level, setLevel] = useState(() => generateLevel(levelId));
    const [bottles, setBottles] = useState<BottleType[]>(level.bottles);
    const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
    const [pouringBottle, setPouringBottle] = useState<number | null>(null);
    const [targetBottle, setTargetBottle] = useState<number | null>(null);
    const [moveHistory, setMoveHistory] = useState<BottleType[][]>([]);
    const [showComplete, setShowComplete] = useState(false);
    const [extraBottlesUsed, setExtraBottlesUsed] = useState(0);

    // Timer
    const getInitialTime = (difficulty: string) => {
        if (difficulty === 'hard') return 120;
        if (difficulty === 'medium') return 90;
        return 60; // easy
    };

    const [timeLeft, setTimeLeft] = useState(() => getInitialTime(level.difficulty));
    const [showTimeout, setShowTimeout] = useState(false);

    // Animations
    const contentOpacity = React.useRef(new Animated.Value(0)).current;
    const panelTranslateY = React.useRef(new Animated.Value(100)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(panelTranslateY, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
        ]).start();
    }, [contentOpacity, panelTranslateY]);

    useEffect(() => {
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
        if (isLevelComplete()) {
            setTimeout(() => {
                soundManager.play('win');
                setShowComplete(true);
                completeLevel(levelId);
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

        const topColorFrom = fromBottle.colors[fromBottle.colors.length - 1];
        const topColorTo = toBottle.colors[toBottle.colors.length - 1];
        return topColorFrom === topColorTo;
    };

    const handleBottleClick = async (clickedBottleId: number) => {
        if (pouringBottle !== null) return;

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
                    // Start pour animation
                    soundManager.play('pour');

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
                            if (currentFrom.colors[i] === colorToPour) {
                                count++;
                            } else {
                                break;
                            }
                        }

                        const spaceInTo = currentTo.maxCapacity - currentTo.colors.length;
                        const amountToPour = Math.min(count, spaceInTo);

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

    const handleRestart = () => {
        setBottles(JSON.parse(JSON.stringify(level.bottles)));
        setSelectedBottle(null);
        setMoveHistory([]);
        setPouringBottle(null);
        setTargetBottle(null);
        setExtraBottlesUsed(0);
        setTimeLeft(getInitialTime(level.difficulty));
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

    const handleBuyTime = () => {
        if (spendCoins(10)) {
            soundManager.play('win');
            setTimeLeft(60);
            setShowTimeout(false);
        } else {
            soundManager.play('error');
        }
    };

    const handleTimeoutRestart = () => {
        setShowTimeout(false);
        handleRestart();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleHint = () => {
        if (useHint()) {
            for (let i = 0; i < bottles.length; i++) {
                for (let j = 0; j < bottles.length; j++) {
                    if (i !== j && canPour(bottles[i], bottles[j])) {
                        setSelectedBottle(i);
                        setTimeout(() => {
                            handleBottleClick(j);
                        }, 1000);
                        return;
                    }
                }
            }
        }
    };

    const handleSkip = () => {
        if (useSkip()) {
            soundManager.play('pour'); // Or another custom sound
            handleNextLevel();
        } else {
            soundManager.play('error');
        }
    };

    const handleExtraBottle = () => {
        if (extraBottlesUsed >= 2) {
            soundManager.play('error');
            return;
        }

        if (useExtraBottle()) {
            soundManager.play('pour');
            const nextId = Math.max(...bottles.map(b => b.id), 0) + 1;
            const newBottle: BottleType = {
                id: nextId,
                colors: [],
                maxCapacity: 4
            };
            setBottles([...bottles, newBottle]);
            setExtraBottlesUsed(prev => prev + 1);
        } else {
            soundManager.play('error');
        }
    };

    const handleNextLevel = () => {
        setShowComplete(false);
        const nextLevelId = levelId + 1;
        router.replace(`/game?id=${nextLevelId}`);
        const nextLevel = generateLevel(nextLevelId);
        setLevel(nextLevel);
        setBottles(nextLevel.bottles);
        setSelectedBottle(null);
        setMoveHistory([]);
        setPouringBottle(null);
        setTargetBottle(null);
        setExtraBottlesUsed(0);
        setTimeLeft(300);
    };

    // Dynamic Visual Shrinking for high bottlenecks
    const dynamicScale = Math.min(1, 10 / bottles.length);

    return (
        <ImageBackground
            source={require('../assets/orange-wall-bg.jpg')}
            style={styles.container}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.iconButton, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                    <ArrowLeft size={24} color="#4A6CF7" />
                </Pressable>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.levelTitle}>Level {levelId}</Text>
                    <Text style={styles.difficultyText}>{level.difficulty}</Text>
                </View>

                <View style={styles.headerRight}>
                    <View style={[styles.coinsBadge, { marginRight: 8, backgroundColor: timeLeft <= 30 ? '#FEE2E2' : '#FFFFFF' }]}>
                        <Clock size={20} color={timeLeft <= 30 ? '#FF4D4D' : '#4B5563'} />
                        <Text style={[styles.coinsText, { color: timeLeft <= 30 ? '#FF4D4D' : '#4B5563' }]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                    <View style={styles.coinsBadge}>
                        <Coins size={20} color="#FFD84D" />
                        <Text style={styles.coinsText}>{progress.coins}</Text>
                    </View>
                </View>
            </View>

            {/* Bottles Grid */}
            <Animated.View style={[styles.gridContainer, { opacity: contentOpacity }]}>
                <View style={styles.grid}>
                    {bottles.map((bottle) => (
                        <View key={bottle.id} style={styles.bottleWrapper}>
                            <Bottle
                                bottle={bottle}
                                isSelected={selectedBottle === bottle.id}
                                isPouring={pouringBottle === bottle.id}
                                isPouringTarget={targetBottle === bottle.id}
                                bottleIndex={levelId % 4}
                                rowIndex={Math.floor(levelId / 4) % 5}
                                scaleOverride={dynamicScale}
                                onClick={() => handleBottleClick(bottle.id)}
                            />
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Bottom Control Panel */}
            <Animated.View style={[styles.controlPanel, { transform: [{ translateY: panelTranslateY }] }]}>
                <View style={styles.controlsGrid}>

                    {/* Undo Button */}
                    <Pressable
                        onPress={handleUndo}
                        disabled={moveHistory.length === 0}
                        style={({ pressed }) => [
                            styles.controlItem,
                            moveHistory.length === 0 ? styles.controlItemDisabled : styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            moveHistory.length > 0 && styles.woodCarvedShadow
                        ]}
                    >
                        <Undo size={24} color={moveHistory.length === 0 ? '#9CA3AF' : '#8B5A2B'} />
                        <Text style={[styles.controlText, moveHistory.length === 0 ? styles.textDisabled : styles.textWoodDark]}>Undo</Text>
                    </Pressable>

                    {/* Hint Button */}
                    <Pressable
                        onPress={handleHint}
                        disabled={progress.boosters.hints === 0}
                        style={({ pressed }) => [
                            styles.controlItem,
                            progress.boosters.hints === 0 ? styles.controlItemDisabled : styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            progress.boosters.hints > 0 && styles.woodCarvedShadow
                        ]}
                    >
                        {progress.boosters.hints > 0 && (
                            <View style={styles.hintBadge}>
                                <Text style={styles.hintBadgeText}>{progress.boosters.hints}</Text>
                            </View>
                        )}
                        <Lightbulb size={24} color={progress.boosters.hints === 0 ? '#9CA3AF' : '#8B5A2B'} />
                        <Text style={[styles.controlText, progress.boosters.hints === 0 ? styles.textDisabled : styles.textWoodDark]}>Hint</Text>
                    </Pressable>

                    {/* Extra Bottle Button */}
                    <Pressable
                        onPress={handleExtraBottle}
                        disabled={progress.boosters.extraBottles === 0 || extraBottlesUsed >= 2}
                        style={({ pressed }) => [
                            styles.controlItem,
                            (progress.boosters.extraBottles === 0 || extraBottlesUsed >= 2) ? styles.controlItemDisabled : styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            (progress.boosters.extraBottles > 0 && extraBottlesUsed < 2) && styles.woodCarvedShadow
                        ]}
                    >
                        {(progress.boosters.extraBottles > 0 && extraBottlesUsed < 2) && (
                            <View style={[styles.hintBadge, { backgroundColor: '#4A6CF7' }]}>
                                <Text style={styles.hintBadgeText}>{progress.boosters.extraBottles}</Text>
                            </View>
                        )}
                        <PlusSquare size={24} color={(progress.boosters.extraBottles === 0 || extraBottlesUsed >= 2) ? '#9CA3AF' : '#8B5A2B'} />
                        <Text style={[styles.controlText, (progress.boosters.extraBottles === 0 || extraBottlesUsed >= 2) ? styles.textDisabled : styles.textWoodDark]}>+Bottle</Text>
                        <Text style={[styles.controlSubtext, (progress.boosters.extraBottles === 0 || extraBottlesUsed >= 2) ? styles.textDisabled : styles.textWoodDark]}>{extraBottlesUsed}/2</Text>
                    </Pressable>

                    {/* Skip Button */}
                    <Pressable
                        onPress={handleSkip}
                        disabled={progress.boosters.skips === 0}
                        style={({ pressed }) => [
                            styles.controlItem,
                            progress.boosters.skips === 0 ? styles.controlItemDisabled : styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            progress.boosters.skips > 0 && styles.woodCarvedShadow
                        ]}
                    >
                        {progress.boosters.skips > 0 && (
                            <View style={[styles.hintBadge, { backgroundColor: '#B84DFF' }]}>
                                <Text style={styles.hintBadgeText}>{progress.boosters.skips}</Text>
                            </View>
                        )}
                        <SkipForward size={24} color={progress.boosters.skips === 0 ? '#9CA3AF' : '#8B5A2B'} />
                        <Text style={[styles.controlText, progress.boosters.skips === 0 ? styles.textDisabled : styles.textWoodDark]}>Skip</Text>
                    </Pressable>

                    {/* Restart Button */}
                    <Pressable
                        onPress={handleRestart}
                        style={({ pressed }) => [
                            styles.controlItem,
                            styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            styles.woodCarvedShadow
                        ]}
                    >
                        <RotateCcw size={24} color="#8B5A2B" />
                        <Text style={[styles.controlText, styles.textWoodDark]}>Restart</Text>
                    </Pressable>

                </View>
            </Animated.View>

            {/* Level Complete Modal */}
            {showComplete && (
                <LevelCompleteModal
                    level={levelId}
                    onNextLevel={handleNextLevel}
                    onClose={() => router.push('/levels')}
                />
            )}
            {/* Timeout Modal */}
            <TimeoutModal
                visible={showTimeout}
                onBuyTime={handleBuyTime}
                onRestart={handleTimeoutRestart}
            />

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    levelTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A6CF7',
    },
    difficultyText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    coinsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    coinsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A6CF7',
    },
    gridContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    boardImage: {
        width: '100%',
        paddingVertical: 32,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    boardImageStyle: {
        borderRadius: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        gap: 16,
    },
    bottleWrapper: {
        margin: 8,
    },
    controlPanel: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    controlsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    controlItem: {
        width: 62, // Scaled down slightly to fit 5 buttons organically side-by-side
        height: 84,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    controlItemDisabled: {
        backgroundColor: '#E5E7EB',
    },
    bgWoodLight: {
        backgroundColor: '#D8B384',
        borderWidth: 2,
        borderColor: '#8B5A2B',
    },
    woodCarvedShadow: {
        shadowColor: '#3d1b04',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 8,
    },
    bgPrimary: { backgroundColor: '#4A6CF7' },
    bgWarning: { backgroundColor: '#FFD84D' },
    bgPurple: { backgroundColor: '#B84DFF' },
    bgSuccess: { backgroundColor: '#4DFF88' },
    controlText: {
        fontSize: 12,
        fontWeight: '700',
    },
    controlSubtext: {
        fontSize: 10,
        fontWeight: 'bold',
        opacity: 0.75,
    },
    textWhite: { color: '#FFF' },
    textDark: { color: '#111827' },
    textDisabled: { color: '#9CA3AF' },
    textWoodDark: { color: '#8B5A2B' },
    hintBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    hintBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
