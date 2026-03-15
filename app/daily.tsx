import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground, SafeAreaView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Undo, Lightbulb, Clock, CalendarCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Bottle } from '../components/Bottle';
import { useGame } from '../context/GameContext';
import { generateLevel } from '../utils/levelGenerator';
import { Bottle as BottleType } from '../types';
import { TimeoutModal } from '../components/TimeoutModal';
import { soundManager } from '../utils/sound';

export default function DailyPuzzleScreen() {
    const router = useRouter();
    const { progress, useHint, completeDailyChallenge, spendCoins } = useGame();

    const todayStr = new Date().toISOString().split('T')[0];
    const dailyHash = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const [level] = useState(() => generateLevel(100 + (dailyHash % 50)));

    const [bottles, setBottles] = useState<BottleType[]>(level.bottles);
    const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
    const [pouringBottle, setPouringBottle] = useState<number | null>(null);
    const [targetBottle, setTargetBottle] = useState<number | null>(null);
    const [moveHistory, setMoveHistory] = useState<BottleType[][]>([]);
    const [showComplete, setShowComplete] = useState(progress.dailySolvedToday);

    const [timeLeft, setTimeLeft] = useState(300);
    const [showTimeout, setShowTimeout] = useState(false);

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-24)).current;
    const panelSlide = useRef(new Animated.Value(60)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
            Animated.spring(panelSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
        soundManager.init();
        return () => { soundManager.unloadAll(); };
    }, []);

    useEffect(() => {
        if (showComplete || showTimeout || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { setShowTimeout(true); return 0; }
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

    const isLevelComplete = () => bottles.every(b => {
        if (b.colors.length === 0) return true;
        if (b.colors.length !== b.maxCapacity) return false;
        return b.colors.every(c => c === b.colors[0]);
    });

    const canPour = (from: BottleType, to: BottleType) => {
        if (from.colors.length === 0) return false;
        if (to.colors.length >= to.maxCapacity) return false;
        if (to.colors.length === 0) return true;
        return from.colors[from.colors.length - 1] === to.colors[to.colors.length - 1];
    };

    const handleBottleClick = async (clickedId: number) => {
        if (progress.dailySolvedToday || pouringBottle !== null) return;
        soundManager.play('click');
        if (selectedBottle === null) {
            if (bottles[clickedId].colors.length > 0) setSelectedBottle(clickedId);
        } else {
            if (selectedBottle === clickedId) { setSelectedBottle(null); return; }
            const from = bottles[selectedBottle];
            const to = bottles[clickedId];
            if (canPour(from, to)) {
                soundManager.play('pour');
                const snap = JSON.parse(JSON.stringify(bottles));
                setPouringBottle(selectedBottle);
                setTargetBottle(clickedId);
                await new Promise(r => setTimeout(r, 600));
                setMoveHistory(prev => [...prev, snap]);
                setBottles(prev => {
                    const nb = JSON.parse(JSON.stringify(prev));
                    const f = nb[selectedBottle], t = nb[clickedId];
                    const col = f.colors[f.colors.length - 1];
                    let cnt = 0;
                    for (let i = f.colors.length - 1; i >= 0; i--) { if (f.colors[i] === col) cnt++; else break; }
                    const pour = Math.min(cnt, t.maxCapacity - t.colors.length);
                    for (let i = 0; i < pour; i++) { t.colors.push(col); f.colors.pop(); }
                    return nb;
                });
                setPouringBottle(null); setTargetBottle(null);
            } else { soundManager.play('error'); }
            setSelectedBottle(null);
        }
    };

    const handleUndo = () => {
        if (moveHistory.length > 0) {
            setBottles(JSON.parse(JSON.stringify(moveHistory[moveHistory.length - 1])));
            setMoveHistory(moveHistory.slice(0, -1));
            setSelectedBottle(null); setPouringBottle(null); setTargetBottle(null);
        }
    };

    const handleRestart = () => {
        setBottles(JSON.parse(JSON.stringify(level.bottles)));
        setSelectedBottle(null); setMoveHistory([]); setPouringBottle(null); setTargetBottle(null); setTimeLeft(300);
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

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const handleBuyTime = () => {
        if (spendCoins(10)) { soundManager.play('win'); setTimeLeft(60); setShowTimeout(false); }
        else soundManager.play('error');
    };

    const timerUrgent = timeLeft <= 30;

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            {/* Dark wood overlay */}
            <View style={styles.darkOverlay} />

            <SafeAreaView style={styles.safeArea}>

                {/* ── Header ── */}
                <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [styles.iconBtn, pressed && { transform: [{ scale: 0.9 }] }]}
                    >
                        <ArrowLeft size={22} color="#FFD864" strokeWidth={2.5} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Text style={styles.puzzleCalendar}>📅</Text>
                        <View>
                            <Text style={styles.headerTitle}>DAILY PUZZLE</Text>
                            <Text style={styles.headerSub}>
                                {progress.dailySolvedToday ? '✅ Solved Today!' : '⚡ Hard Challenge'}
                            </Text>
                        </View>
                    </View>

                    {/* Timer badge */}
                    <View style={[styles.timerBadge, timerUrgent && styles.timerBadgeUrgent]}>
                        <Clock size={15} color={timerUrgent ? '#FF6B6B' : '#FFD864'} />
                        <Text style={[styles.timerText, timerUrgent && styles.timerTextUrgent]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Streak Banner ── */}
                <View style={styles.streakBanner}>
                    <View style={styles.streakLeft}>
                        <CalendarCheck size={18} color="#FFD864" strokeWidth={2} />
                        <Text style={styles.streakDate}>{todayStr}</Text>
                    </View>
                    <View style={styles.streakRight}>
                        <Text style={styles.streakNumber}>{progress.currentStreak}</Text>
                        <Text style={styles.streakLabel}> day streak 🔥</Text>
                    </View>
                </View>

                {/* ── Complete Overlay ── */}
                {showComplete && (
                    <View style={styles.completeOverlay}>
                        <LinearGradient
                            colors={['rgba(15,5,0,0.97)', 'rgba(40,20,0,0.97)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <Text style={styles.completeEmoji}>🏆</Text>
                        <Text style={styles.completeTitle}>CHALLENGE SOLVED!</Text>
                        <Text style={styles.completeDesc}>You earned your daily rewards.</Text>
                        <View style={styles.rewardCard}>
                            <Text style={styles.rewardText}>+50 🪙 Base Reward</Text>
                            {progress.currentStreak % 3 === 0 && progress.currentStreak > 0 && (
                                <Text style={styles.rewardBonus}>+100 🪙 Streak Bonus!</Text>
                            )}
                        </View>
                        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}>
                            <LinearGradient colors={['#C8854A', '#7A3F10']} style={styles.homeBtnGrad}>
                                <Text style={styles.homeBtnText}>🏠 BACK TO HOME</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}

                {/* ── Bottle Grid ── */}
                <Animated.View style={[styles.gridContainer, { opacity: contentOpacity }]}>
                    <View style={styles.grid}>
                        {(() => {
                            const { width: windowWidth, height: windowHeight } = useWindowDimensions();
                            const isTablet = windowWidth >= 768;
                            
                            // Responsive scale: 
                            // - On phones, bottles should be smaller (0.45 - 0.6)
                            // - On tablets, bottles should be larger (0.8 - 1.0)
                            const baseScale = isTablet ? 0.9 : 0.55;
                            const scale = Math.min(baseScale, 12 / bottles.length);
                            
                            return bottles.map(bottle => (
                                <View key={bottle.id} style={[styles.bottleWrapper, { margin: isTablet ? 12 : 4 }]}>
                                    <Bottle
                                        bottle={bottle}
                                        isSelected={selectedBottle === bottle.id}
                                        isPouring={pouringBottle === bottle.id}
                                        isPouringTarget={targetBottle === bottle.id}
                                        bottleIndex={dailyHash % 4}
                                        rowIndex={Math.floor(dailyHash / 4) % 5}
                                        scaleOverride={scale}
                                        onClick={() => handleBottleClick(bottle.id)}
                                    />
                                </View>
                            ));
                        })()}
                    </View>
                </Animated.View>

                {/* ── Control Panel ── */}
                {!showComplete && (
                    <Animated.View style={[styles.controlPanel, { transform: [{ translateY: panelSlide }] }]}>
                        <View style={styles.panelShine} />
                        <View style={styles.controlsRow}>

                            {/* Undo */}
                            <Pressable
                                onPress={handleUndo}
                                disabled={moveHistory.length === 0}
                                style={({ pressed }) => [
                                    styles.ctrlBtn,
                                    moveHistory.length === 0 ? styles.ctrlDisabled : styles.ctrlActive,
                                    pressed && { transform: [{ scale: 0.94 }] }
                                ]}
                            >
                                <Undo size={24} color={moveHistory.length === 0 ? 'rgba(255,255,255,0.25)' : '#FFD864'} />
                                <Text style={[styles.ctrlLabel, moveHistory.length === 0 && styles.ctrlLabelDisabled]}>Undo</Text>
                            </Pressable>

                            {/* Hint */}
                            {(() => {
                                const hasHint = progress.boosters.hints > 0;
                                const canBuy = progress.coins >= 30;
                                const enabled = hasHint || canBuy;
                                return (
                                    <Pressable
                                        onPress={handleHint}
                                        disabled={!enabled}
                                        style={({ pressed }) => [
                                            styles.ctrlBtn,
                                            !enabled ? styles.ctrlDisabled : styles.ctrlActive,
                                            pressed && { transform: [{ scale: 0.94 }] }
                                        ]}
                                    >
                                        {hasHint && (
                                            <View style={styles.badgeStock}>
                                                <Text style={styles.badgeText}>{progress.boosters.hints}</Text>
                                            </View>
                                        )}
                                        {!hasHint && canBuy && (
                                            <View style={styles.badgeCoin}>
                                                <Text style={styles.badgeCoinText}>30🪙</Text>
                                            </View>
                                        )}
                                        <Lightbulb size={24} color={!enabled ? 'rgba(255,255,255,0.25)' : '#FFD864'} />
                                        <Text style={[styles.ctrlLabel, !enabled && styles.ctrlLabelDisabled]}>Hint</Text>
                                    </Pressable>
                                );
                            })()}

                            {/* Restart */}
                            <Pressable
                                onPress={handleRestart}
                                style={({ pressed }) => [styles.ctrlBtn, styles.ctrlActive, pressed && { transform: [{ scale: 0.94 }] }]}
                            >
                                <RotateCcw size={24} color="#FFD864" />
                                <Text style={styles.ctrlLabel}>Restart</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>

            <TimeoutModal visible={showTimeout} onBuyTime={handleBuyTime} onRestart={() => { setShowTimeout(false); handleRestart(); }} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 5, 0, 0.55)' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
    },
    iconBtn: {
        width: 44, height: 44,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: 'rgba(255,216,100,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    puzzleCalendar: { fontSize: 32 },
    headerTitle: {
        fontSize: 18, fontWeight: '900', color: '#F5DEB3', letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
    },
    headerSub: { fontSize: 11, color: '#FFD864', fontWeight: '700', letterSpacing: 0.5 },
    timerBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,216,100,0.35)',
        paddingHorizontal: 10, paddingVertical: 7,
    },
    timerBadgeUrgent: { borderColor: '#FF6B6B', backgroundColor: 'rgba(255,50,50,0.15)' },
    timerText: { fontSize: 15, fontWeight: '900', color: '#F5DEB3' },
    timerTextUrgent: { color: '#FF6B6B' },

    streakBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 10,
        backgroundColor: 'rgba(139,79,30,0.7)',
        borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,220,160,0.25)',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    streakDate: { fontSize: 13, fontWeight: '700', color: '#F5DEB3' },
    streakRight: { flexDirection: 'row', alignItems: 'center' },
    streakNumber: { fontSize: 20, fontWeight: '900', color: '#FF6B6B' },
    streakLabel: { fontSize: 13, color: '#F5DEB3', fontWeight: '600' },

    completeOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    completeEmoji: { fontSize: 72, marginBottom: 12 },
    completeTitle: {
        fontSize: 28, fontWeight: '900', color: '#FFD864', letterSpacing: 2, marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6,
    },
    completeDesc: { fontSize: 15, color: '#F5DEB3', marginBottom: 20, textAlign: 'center' },
    rewardCard: {
        backgroundColor: 'rgba(139,79,30,0.8)',
        borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,220,160,0.35)',
        padding: 20, alignItems: 'center', marginBottom: 32, width: '100%',
    },
    rewardText: { fontSize: 22, fontWeight: '900', color: '#F5DEB3', marginBottom: 6 },
    rewardBonus: { fontSize: 18, fontWeight: '800', color: '#B84DFF' },
    homeBtn: { borderRadius: 20, overflow: 'hidden', width: '100%' },
    homeBtnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 20 },
    homeBtnText: { color: '#F5DEB3', fontSize: 17, fontWeight: '900', letterSpacing: 1.5 },

    gridContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: 12 },
    bottleWrapper: { margin: 6 },

    panelShine: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        backgroundColor: 'rgba(255, 220, 160, 0.4)', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    },
    controlPanel: {
        backgroundColor: '#8B4F1E',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20,
        borderTopWidth: 2, borderTopColor: 'rgba(200,133,74,0.6)',
        shadowColor: '#1A0500', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
        position: 'relative',
    },
    controlsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    ctrlBtn: {
        width: 80, height: 90, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', gap: 5, position: 'relative',
    },
    ctrlActive: {
        backgroundColor: '#C8854A',
        borderWidth: 2, borderColor: 'rgba(255,220,160,0.4)',
        shadowColor: '#3d1b04', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
    },
    ctrlDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
    ctrlLabel: { fontSize: 12, fontWeight: '800', color: '#FFD864', letterSpacing: 0.3 },
    ctrlLabelDisabled: { color: 'rgba(255,255,255,0.3)' },

    badgeStock: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#FFB800', width: 20, height: 20, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    badgeCoin: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#FFD864', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2, zIndex: 10,
    },
    badgeCoinText: { color: '#3A1500', fontSize: 8, fontWeight: '900' },
});
