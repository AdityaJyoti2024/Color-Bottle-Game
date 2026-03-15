import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, Undo, Lightbulb, Coins, SkipForward, Clock, PlusSquare, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Bottle } from '../components/Bottle';
import { useGame } from '../context/GameContext';
import { generateLevel } from '../utils/levelGenerator';
import { Bottle as BottleType } from '../types';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { TimeoutModal } from '../components/TimeoutModal';
import { soundManager } from '../utils/sound';
import { RewardAdModal } from '../components/RewardAdModal';

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

    const [adConfig, setAdConfig] = useState<{
        visible: boolean;
        type: 'coins' | 'hint' | 'skip' | 'extraBottle';
        amount: number;
        videoSource: any;
    }>({
        visible: false,
        type: 'coins',
        amount: 50,
        videoSource: require('../assets/reel ads.mp4')
    });

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
            // Fallback to Rewarded Ad
            setAdConfig({
                visible: true,
                type: 'skip',
                amount: 1,
                videoSource: require('../assets/reel ads.mp4')
            });
        }
    };

    const handleExtraBottle = () => {
        if (extraBottlesUsed >= 2) {
            soundManager.play('error');
            return;
        }

        if (useExtraBottle()) {
            performExtraBottleAction();
        } else {
            // Fallback to Rewarded Ad
            setAdConfig({
                visible: true,
                type: 'extraBottle',
                amount: 1,
                videoSource: require('../assets/600+ Ghibli Art Reels Bundle (1).mp4')
            });
        }
    };

    const performExtraBottleAction = () => {
        soundManager.play('pour');
        const nextId = Math.max(...bottles.map(b => b.id), 0) + 1;
        const newBottle: BottleType = {
            id: nextId,
            colors: [],
            maxCapacity: 4
        };
        setBottles([...bottles, newBottle]);
        setExtraBottlesUsed(prev => prev + 1);
    };

    const handleNextLevel = () => {
        // Trigger interstitial ad after level completion
        // adsManager.showInterstitialAd(); // Disabled for now to use our custom modal for rewards

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
            {/* Dark overlay for readability */}
            <View style={styles.darkOverlay} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.iconButton, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                    <ArrowLeft size={22} color="#FFD864" strokeWidth={2.5} />
                </Pressable>

                {/* Get Reward Button */}
                <Pressable
                    onPress={() => setAdConfig({
                        visible: true,
                        type: 'coins',
                        amount: 100,
                        videoSource: require('../assets/reel ads.mp4')
                    })}
                    style={({ pressed }) => [styles.getRewardBtn, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                    <Gift size={18} color="#FFD864" strokeWidth={2.5} />
                    <Text style={styles.getRewardText}>GET REWARD</Text>
                </Pressable>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.levelTitle}>LEVEL {levelId}</Text>
                    <Text style={styles.difficultyText}>{level.difficulty.toUpperCase()}</Text>
                </View>

                <View style={styles.headerRight}>
                    <View style={[styles.coinsBadge, { marginRight: 8, borderColor: timeLeft <= 30 ? '#FF4D4D' : 'rgba(255,216,100,0.35)' }]}>
                        <Clock size={16} color={timeLeft <= 30 ? '#FF4D4D' : '#FFD864'} />
                        <Text style={[styles.coinsText, { color: timeLeft <= 30 ? '#FF4D4D' : '#F5DEB3' }]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                    <View style={styles.coinsBadge}>
                        <Coins size={16} color="#FFD864" />
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
                {/* Wood panel top edge shine */}
                <View style={styles.panelShine} />
                <View style={styles.controlsGrid}>

                    {/* Undo Button - disabled only if no move history */}
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
                        <Undo size={24} color={moveHistory.length === 0 ? 'rgba(255,255,255,0.2)' : '#FFD864'} />
                        <Text style={[styles.controlText, moveHistory.length === 0 ? styles.textDisabled : styles.textWoodDark]}>Undo</Text>
                    </Pressable>

                    {/* Hint Button - enabled if has hints OR has ≥30 coins */}
                    {(() => {
                        const hasHints = progress.boosters.hints > 0;
                        const canBuy = progress.coins >= 30;
                        const enabled = hasHints || canBuy;
                        return (
                            <Pressable
                                onPress={handleHint}
                                disabled={!enabled}
                                style={({ pressed }) => [
                                    styles.controlItem,
                                    !enabled ? styles.controlItemDisabled : styles.bgWoodLight,
                                    pressed && { transform: [{ scale: 0.95 }] },
                                    enabled && styles.woodCarvedShadow
                                ]}
                            >
                                {hasHints ? (
                                    <View style={[styles.hintBadge, { backgroundColor: '#FFB800' }]}>
                                        <Text style={styles.hintBadgeText}>{progress.boosters.hints}</Text>
                                    </View>
                                ) : canBuy ? (
                                    <View style={styles.coinCostBadge}>
                                        <Text style={styles.coinCostText}>30🪙</Text>
                                    </View>
                                ) : null}
                                <Lightbulb size={24} color={!enabled ? 'rgba(255,255,255,0.2)' : '#FFD864'} />
                                <Text style={[styles.controlText, !enabled ? styles.textDisabled : styles.textWoodDark]}>Hint</Text>
                            </Pressable>
                        );
                    })()}

                    {/* Extra Bottle - enabled if has stock OR has ≥40 coins, max 2 */}
                    {(() => {
                        const hasBottle = progress.boosters.extraBottles > 0 && extraBottlesUsed < 2;
                        const canBuy = progress.coins >= 40 && extraBottlesUsed < 2;
                        const enabled = hasBottle || canBuy;
                        return (
                            <Pressable
                                onPress={handleExtraBottle}
                                disabled={!enabled}
                                style={({ pressed }) => [
                                    styles.controlItem,
                                    !enabled ? styles.controlItemDisabled : styles.bgWoodLight,
                                    pressed && { transform: [{ scale: 0.95 }] },
                                    enabled && styles.woodCarvedShadow
                                ]}
                            >
                                {hasBottle ? (
                                    <View style={[styles.hintBadge, { backgroundColor: '#4ECDC4' }]}>
                                        <Text style={styles.hintBadgeText}>{progress.boosters.extraBottles}</Text>
                                    </View>
                                ) : canBuy ? (
                                    <View style={styles.coinCostBadge}>
                                        <Text style={styles.coinCostText}>40🪙</Text>
                                    </View>
                                ) : null}
                                <PlusSquare size={24} color={!enabled ? 'rgba(255,255,255,0.2)' : '#FFD864'} />
                                <Text style={[styles.controlText, !enabled ? styles.textDisabled : styles.textWoodDark]}>+Bottle</Text>
                                <Text style={[styles.controlSubtext, !enabled ? styles.textDisabled : styles.textWoodDark]}>{extraBottlesUsed}/2</Text>
                            </Pressable>
                        );
                    })()}

                    {/* Skip Button - enabled if has skips OR has ≥50 coins */}
                    {(() => {
                        const hasSkip = progress.boosters.skips > 0;
                        const canBuy = progress.coins >= 50;
                        const enabled = hasSkip || canBuy;
                        return (
                            <Pressable
                                onPress={handleSkip}
                                disabled={!enabled}
                                style={({ pressed }) => [
                                    styles.controlItem,
                                    !enabled ? styles.controlItemDisabled : styles.bgWoodLight,
                                    pressed && { transform: [{ scale: 0.95 }] },
                                    enabled && styles.woodCarvedShadow
                                ]}
                            >
                                {hasSkip ? (
                                    <View style={[styles.hintBadge, { backgroundColor: '#B84DFF' }]}>
                                        <Text style={styles.hintBadgeText}>{progress.boosters.skips}</Text>
                                    </View>
                                ) : canBuy ? (
                                    <View style={styles.coinCostBadge}>
                                        <Text style={styles.coinCostText}>50🪙</Text>
                                    </View>
                                ) : null}
                                <SkipForward size={24} color={!enabled ? 'rgba(255,255,255,0.2)' : '#FFD864'} />
                                <Text style={[styles.controlText, !enabled ? styles.textDisabled : styles.textWoodDark]}>Skip</Text>
                            </Pressable>
                        );
                    })()}

                    {/* Restart Button - always enabled */}
                    <Pressable
                        onPress={handleRestart}
                        style={({ pressed }) => [
                            styles.controlItem,
                            styles.bgWoodLight,
                            pressed && { transform: [{ scale: 0.95 }] },
                            styles.woodCarvedShadow
                        ]}
                    >
                        <RotateCcw size={24} color="#FFD864" />
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

            {/* Reward Ad Modal */}
            <RewardAdModal
                visible={adConfig.visible}
                rewardType={adConfig.type}
                rewardAmount={adConfig.amount}
                videoSource={adConfig.videoSource}
                onClose={() => {
                    setAdConfig(prev => ({ ...prev, visible: false }));
                    // If it was a booster reward, handle the action
                    if (adConfig.type === 'skip') {
                        handleNextLevel();
                    } else if (adConfig.type === 'extraBottle') {
                        performExtraBottleAction();
                    }
                }}
            />

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 5, 0, 0.52)',
    },
    container: {
        flex: 1,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: 'rgba(255,216,100,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    getRewardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 216, 100, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#FFD864',
        gap: 6,
    },
    getRewardText: {
        color: '#FFD864',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    levelTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#F5DEB3',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    difficultyText: {
        fontSize: 11,
        color: '#FFD864',
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    coinsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 5,
        borderWidth: 1.5,
        borderColor: 'rgba(255,216,100,0.35)',
    },
    coinsText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#F5DEB3',
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
    panelShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255, 220, 160, 0.4)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    controlPanel: {
        backgroundColor: '#8B4F1E',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
        paddingBottom: 36,
        shadowColor: '#1A0500',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
        position: 'relative',
        borderTopWidth: 2,
        borderTopColor: 'rgba(200,133,74,0.6)',
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
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bgWoodLight: {
        backgroundColor: '#C8854A',
        borderWidth: 2,
        borderColor: 'rgba(255,220,160,0.4)',
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
    textDisabled: { color: 'rgba(255,255,255,0.3)' },
    textWoodDark: { color: '#FFD864' },
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
    coinCostBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFD864',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 10,
    },
    coinCostText: {
        color: '#3A1500',
        fontSize: 8,
        fontWeight: '900',
    },
    hintBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
