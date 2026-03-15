import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ImageBackground, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import { useGame } from '../context/GameContext';
import { DailyRewardModal } from '../components/DailyRewardModal';
import { WoodNavBar, DailyRewardBadge } from '../components/WoodNavBar';

// Day-to-reward preview map
const DAY_REWARDS: Record<number, string> = {
    1: '🪙 50 Coins',
    2: '💡 2 Hints',
    3: '⏭️ Skip x1',
    4: '🪙 100 Coins',
    5: '🍾 Bottle+',
    6: '💡 5 Hints',
    7: '🎁 Mystery',
};

export default function HomeScreen() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const titleSlideAnim = useRef(new Animated.Value(-30)).current;
    const sparkAnim = useRef(new Animated.Value(0)).current;

    const { progress } = useGame();
    const [showDailyReward, setShowDailyReward] = useState(false);

    // Calculate current reward day (1-7 cycle)
    const rewardDay = ((progress.completedLevels?.length ?? 0) % 7) + 1;

    useEffect(() => {
        if (!progress.rewardClaimedToday) {
            const timer = setTimeout(() => setShowDailyReward(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [progress.rewardClaimedToday]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
            Animated.timing(titleSlideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        // Bottle floating
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -12, duration: 1200, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        ).start();

        // Sparkle on title
        Animated.loop(
            Animated.sequence([
                Animated.timing(sparkAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
                Animated.timing(sparkAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
            ])
        ).start();
    }, [fadeAnim, scaleAnim, floatAnim, titleSlideAnim, sparkAnim]);

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            {/* Semi-transparent overlay for readability */}
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>

                {/* Main Content */}
                <Animated.View style={[styles.content, {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }]}>

                    {/* Game Title - wooden board style */}
                    <Animated.View style={[styles.titleBoardWrapper, { transform: [{ translateY: titleSlideAnim }] }]}>
                        <LinearGradient
                            colors={['#C8854A', '#8B4F1E', '#6B3210']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.titleBoard}
                        >
                            {/* Top shine */}
                            <View style={styles.titleBoardShine} />
                            {/* Nail accents */}
                            <View style={[styles.nail, { left: 14, top: 14 }]} />
                            <View style={[styles.nail, { right: 14, top: 14 }]} />

                            <Text style={styles.titleLineColor}>COLOR</Text>
                            <Text style={styles.titleLineBottle}>BOTTLE</Text>
                            <Text style={styles.titleLinePuzzle}>PUZZLE</Text>
                        </LinearGradient>
                        {/* Wood board bottom shadow */}
                        <View style={styles.titleBoardShadow} />
                    </Animated.View>

                    {/* Daily Reward Badge — below title, centered */}
                    <View style={styles.dailyBadgeRow}>
                        <DailyRewardBadge
                            dayNumber={rewardDay}
                            claimed={!!progress.rewardClaimedToday}
                            rewardPreview={DAY_REWARDS[rewardDay] ?? '🎁 Surprise'}
                            onPress={() => setShowDailyReward(true)}
                        />
                    </View>

                    {/* Animated Bottle */}
                    <Animated.View style={[styles.bottleContainer, { transform: [{ translateY: floatAnim }] }]}>
                        <View style={styles.bottleGlow} />
                        <Svg width="90" height="130" viewBox="0 0 80 120">
                            <Rect x="15" y="12" width="50" height="18" rx="6" fill="#6B3210" />
                            <Rect x="20" y="8" width="40" height="10" rx="4" fill="#8B4F1E" />
                            <Rect x="10" y="30" width="60" height="82" rx="18" fill="white" stroke="#E8D5BF" strokeWidth="3" />
                            {/* Color layers */}
                            <Rect x="14" y="88" width="52" height="20" rx="0" fill="#FF6B6B" />
                            <Rect x="14" y="66" width="52" height="22" rx="0" fill="#4ECDC4" />
                            <Rect x="14" y="44" width="52" height="22" rx="0" fill="#FFE66D" />
                            <Rect x="14" y="30" width="52" height="14" rx="0" fill="#A8E6CF" />
                            {/* Bottle shine */}
                            <Rect x="22" y="38" width="10" height="52" rx="5" fill="rgba(255,255,255,0.35)" />
                        </Svg>
                        <View style={styles.bottleShadow} />
                    </Animated.View>

                    {/* Level Progress Chip */}
                    <View style={styles.progressChip}>
                        <Text style={styles.progressChipText}>Level {progress.currentLevel}</Text>
                        <View style={styles.progressDivider} />
                        <Text style={styles.progressChipSub}>Continue your journey</Text>
                    </View>

                    {/* Play Now CTA */}
                    <Pressable
                        onPress={() => router.push('/levels')}
                        style={({ pressed }) => [styles.playNowBtn, pressed && styles.playNowBtnPressed]}
                    >
                        <LinearGradient
                            colors={['#FFE566', '#FFB800', '#CC8800']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.playNowGradient}
                        >
                            <Text style={styles.playNowText}>▶  PLAY NOW</Text>
                        </LinearGradient>
                        <View style={styles.playNowShadow} />
                    </Pressable>

                </Animated.View>
            </SafeAreaView>

            {/* Wood Bottom Nav */}
            <View style={styles.navbarWrapper}>
                <WoodNavBar
                    onShop={() => router.push('/shop')}
                    onPlay={() => router.push('/levels')}
                    onSettings={() => router.push('/settings')}
                    onProfile={() => router.push('/profile')}
                    onDailyPuzzle={() => router.push('/daily')}
                    activeTab="play"
                />
            </View>

            {/* Daily Reward Modal */}
            {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} />}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20, 8, 0, 0.38)',
    },
    safeArea: {
        flex: 1,
        paddingBottom: 90, // space for navbar
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    // Daily Reward Top Right
    dailyBadgeRow: {
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 12,
    },

    // Title board
    titleBoardWrapper: {
        alignItems: 'center',
        marginBottom: 24,
    },
    titleBoard: {
        borderRadius: 20,
        paddingHorizontal: 36,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: '#3A1500',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,220,160,0.3)',
    },
    titleBoardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,220,160,0.4)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    titleBoardShadow: {
        height: 8,
        width: '85%',
        backgroundColor: '#1A0800',
        borderRadius: 10,
        opacity: 0.4,
    },
    nail: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFD864',
        borderWidth: 1.5,
        borderColor: '#AA8020',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    titleLineColor: {
        fontSize: 46,
        fontWeight: '900',
        color: '#4DFF88',
        letterSpacing: 6,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        lineHeight: 52,
    },
    titleLineBottle: {
        fontSize: 46,
        fontWeight: '900',
        color: '#FFD864',
        letterSpacing: 4,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        lineHeight: 52,
    },
    titleLinePuzzle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F5DEB3',
        letterSpacing: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        lineHeight: 34,
        opacity: 0.92,
    },

    // Bottle
    bottleContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    bottleGlow: {
        position: 'absolute',
        top: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4A6CF7',
        opacity: 0.18,
        transform: [{ scaleX: 1.4 }],
    },
    bottleShadow: {
        width: 60,
        height: 10,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginTop: 4,
    },

    // Progress chip
    progressChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,220,160,0.25)',
        gap: 10,
    },
    progressChipText: {
        color: '#FFD864',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    progressDivider: {
        width: 1.5,
        height: 14,
        backgroundColor: 'rgba(255,220,160,0.4)',
    },
    progressChipSub: {
        color: '#F5DEB3',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.85,
    },

    // Play Now button
    playNowBtn: {
        width: 220,
        alignItems: 'center',
    },
    playNowBtnPressed: {
        transform: [{ scale: 0.96 }, { translateY: 3 }],
    },
    playNowGradient: {
        width: '100%',
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,200,0.4)',
    },
    playNowText: {
        color: '#3A1500',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    playNowShadow: {
        height: 7,
        width: '88%',
        backgroundColor: '#3A1500',
        borderRadius: 12,
        opacity: 0.35,
    },

    // Navbar
    navbarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
