import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, Settings, User, Calendar } from 'lucide-react-native';
import Svg, { Rect, Circle, Path, Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CENTER_BTN_SIZE = 72;
const NAVBAR_HEIGHT = 72;

// Wood grain SVG texture overlay
function WoodGrainOverlay({ style }: { style?: any }) {
    return (
        <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, style]} opacity={0.08}>
            {Array.from({ length: 12 }).map((_, i) => (
                <Path
                    key={i}
                    d={`M 0 ${i * 14 + 4} Q ${width / 3} ${i * 14 + 9} ${width * 0.66} ${i * 14 + 2} T ${width} ${i * 14 + 6}`}
                    stroke="#3B1A02"
                    strokeWidth="1.5"
                    fill="none"
                />
            ))}
        </Svg>
    );
}

interface DailyRewardBadgeProps {
    dayNumber: number;
    claimed: boolean;
    rewardPreview: string;
    onPress: () => void;
}

export function DailyRewardBadge({ dayNumber, claimed, rewardPreview, onPress }: DailyRewardBadgeProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (claimed) return;
        // Pulse the badge if unclaimed
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        const glow = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
            ])
        );
        pulse.start();
        glow.start();
        return () => { pulse.stop(); glow.stop(); };
    }, [claimed, pulseAnim, glowAnim]);

    const borderColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 200, 60, 0.5)', 'rgba(255, 220, 100, 1)'],
    });

    return (
        <Animated.View style={[styles.dailyBadgeContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Pressable onPress={onPress} style={styles.dailyBadgePressable}>
                <Animated.View style={[styles.dailyBadgeOuter, { borderColor }]}>
                    <LinearGradient
                        colors={claimed ? ['#8B7355', '#6B5530'] : ['#FFD864', '#FF9F00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.dailyBadgeGradient}
                    >
                        {/* Chest Icon */}
                        <Text style={styles.dailyBadgeChestIcon}>{claimed ? '🏆' : '🎁'}</Text>
                    </LinearGradient>
                </Animated.View>
                {/* Day pill */}
                <View style={[styles.dayPill, claimed && styles.dayPillClaimed]}>
                    <Text style={styles.dayPillText}>Day {dayNumber}</Text>
                </View>
                {/* Reward preview label */}
                {!claimed && (
                    <View style={styles.rewardPreviewBubble}>
                        <Text style={styles.rewardPreviewText}>{rewardPreview}</Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    isActive?: boolean;
}

function NavItem({ icon, label, onPress, isActive }: NavItemProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.navItem}
        >
            <Animated.View style={[styles.navItemInner, { transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.navIconContainer, isActive && styles.navIconContainerActive]}>
                    {icon}
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
}

interface WoodNavBarProps {
    onShop: () => void;
    onPlay: () => void;
    onSettings: () => void;
    onProfile: () => void;
    onDailyPuzzle: () => void;
    activeTab?: string;
}

export function WoodNavBar({ onShop, onPlay, onSettings, onProfile, onDailyPuzzle, activeTab }: WoodNavBarProps) {
    const playScaleAnim = useRef(new Animated.Value(1)).current;
    const playRotateAnim = useRef(new Animated.Value(0)).current;

    const handlePlayPressIn = () => {
        Animated.parallel([
            Animated.spring(playScaleAnim, { toValue: 0.92, useNativeDriver: true }),
            Animated.timing(playRotateAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };
    const handlePlayPressOut = () => {
        Animated.parallel([
            Animated.spring(playScaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
            Animated.timing(playRotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    };

    const playRotate = playRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-10deg'],
    });

    return (
        <View style={styles.navbar}>
            {/* Wood base shadow strip */}
            <View style={styles.woodShadowStrip} />

            {/* Main wood bar */}
            <LinearGradient
                colors={['#C8854A', '#A0622A', '#8B4F1E', '#7A3F10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.woodBar}
            >
                <WoodGrainOverlay />

                {/* Left edge highlight */}
                <View style={styles.woodEdgeHighlight} />

                {/* Nav items row: Shop | Settings | [CENTER] | Profile | Daily */}
                <View style={styles.navRow}>
                    {/* Shop */}
                    <NavItem
                        icon={<ShoppingBag size={22} color={activeTab === 'shop' ? '#FFD864' : '#F5DEB3'} strokeWidth={1.8} />}
                        label="Shop"
                        onPress={onShop}
                        isActive={activeTab === 'shop'}
                    />

                    {/* Settings - left of center */}
                    <NavItem
                        icon={<Settings size={22} color={activeTab === 'settings' ? '#FFD864' : '#F5DEB3'} strokeWidth={1.8} />}
                        label="Settings"
                        onPress={onSettings}
                        isActive={activeTab === 'settings'}
                    />

                    {/* Center gap (space for the elevated play button) */}
                    <View style={styles.centerGap} />

                    {/* Profile - right of center */}
                    <NavItem
                        icon={<User size={22} color={activeTab === 'profile' ? '#FFD864' : '#F5DEB3'} strokeWidth={1.8} />}
                        label="Profile"
                        onPress={onProfile}
                        isActive={activeTab === 'profile'}
                    />

                    {/* Daily Puzzle */}
                    <NavItem
                        icon={<Calendar size={22} color={activeTab === 'daily' ? '#FFD864' : '#F5DEB3'} strokeWidth={1.8} />}
                        label="Daily"
                        onPress={onDailyPuzzle}
                        isActive={activeTab === 'daily'}
                    />
                </View>

                {/* Notch/cut-out arc for center button */}
                <View style={styles.centerCutout} pointerEvents="none">
                    <View style={styles.centerCutoutInner} />
                </View>
            </LinearGradient>

            {/* Center PLAY button - elevated above bar */}
            <View style={styles.centerButtonWrapper}>
                <Animated.View style={[
                    styles.centerButtonShadow,
                    { transform: [{ scale: playScaleAnim }] }
                ]} />
                <Pressable
                    onPress={onPlay}
                    onPressIn={handlePlayPressIn}
                    onPressOut={handlePlayPressOut}
                    style={styles.centerButtonPressable}
                >
                    <Animated.View style={[styles.centerButtonOuter, { transform: [{ scale: playScaleAnim }, { rotate: playRotate }] }]}>
                        {/* Outer gold ring */}
                        <LinearGradient
                            colors={['#FFE566', '#FFB800', '#CC8800']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.centerButtonGoldRing}
                        >
                            {/* Inner wood button */}
                            <LinearGradient
                                colors={['#D4954A', '#A0622A', '#7A3F10']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.centerButtonInner}
                            >
                                {/* Play icon (SVG bottle/play) */}
                                <Svg width={36} height={36} viewBox="0 0 36 36">
                                    {/* Bottle body */}
                                    <Rect x="12" y="8" width="12" height="4" rx="2" fill="#FFE566" />
                                    <Rect x="9" y="12" width="18" height="18" rx="7" fill="rgba(255,255,255,0.15)" stroke="#FFD864" strokeWidth="1.5" />
                                    {/* Color fills in bottle */}
                                    <Rect x="11" y="22" width="14" height="7" rx="0" fill="#FF6B6B" />
                                    <Rect x="11" y="16" width="14" height="6" rx="0" fill="#4ECDC4" />
                                    <Rect x="11" y="12" width="14" height="4" rx="0" fill="#FFE66D" />
                                    {/* Bottle cap */}
                                    <Rect x="13" y="6" width="10" height="5" rx="2.5" fill="#8B6914" />
                                    {/* Shine */}
                                    <Rect x="14" y="14" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.3)" />
                                </Svg>
                                <Text style={styles.centerBtnLabel}>PLAY</Text>
                            </LinearGradient>
                        </LinearGradient>
                    </Animated.View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    woodShadowStrip: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: NAVBAR_HEIGHT,
        backgroundColor: '#3A1500',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        transform: [{ translateY: 6 }],
    },
    woodBar: {
        width: '100%',
        height: NAVBAR_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        position: 'relative',
    },
    woodEdgeHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2.5,
        backgroundColor: 'rgba(255, 220, 160, 0.45)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: NAVBAR_HEIGHT,
        paddingHorizontal: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: NAVBAR_HEIGHT,
    },
    navItemInner: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingTop: 4,
    },
    navIconContainer: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    navIconContainerActive: {
        backgroundColor: 'rgba(255, 216, 100, 0.18)',
    },
    navLabel: {
        fontSize: 9.5,
        color: '#F5DEB3',
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    navLabelActive: {
        color: '#FFD864',
    },
    centerGap: {
        width: CENTER_BTN_SIZE + 8,
    },
    centerGapRight: {
        width: 0,
    },
    centerCutout: {
        position: 'absolute',
        top: -20,
        left: '50%',
        marginLeft: -((CENTER_BTN_SIZE + 16) / 2),
        width: CENTER_BTN_SIZE + 16,
        height: 40,
        overflow: 'hidden',
    },
    centerCutoutInner: {
        width: CENTER_BTN_SIZE + 16,
        height: CENTER_BTN_SIZE + 16,
        borderRadius: (CENTER_BTN_SIZE + 16) / 2,
        backgroundColor: 'transparent',
    },
    centerButtonWrapper: {
        position: 'absolute',
        top: -(CENTER_BTN_SIZE / 2 + 4),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    centerButtonShadow: {
        position: 'absolute',
        width: CENTER_BTN_SIZE + 12,
        height: CENTER_BTN_SIZE + 12,
        borderRadius: (CENTER_BTN_SIZE + 12) / 2,
        backgroundColor: '#3A1500',
        top: 8,
    },
    centerButtonPressable: {
        width: CENTER_BTN_SIZE + 8,
        height: CENTER_BTN_SIZE + 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerButtonOuter: {
        width: CENTER_BTN_SIZE + 8,
        height: CENTER_BTN_SIZE + 8,
        borderRadius: (CENTER_BTN_SIZE + 8) / 2,
    },
    centerButtonGoldRing: {
        flex: 1,
        width: '100%',
        borderRadius: (CENTER_BTN_SIZE + 8) / 2,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerButtonInner: {
        flex: 1,
        width: '100%',
        borderRadius: (CENTER_BTN_SIZE) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
    },
    centerBtnLabel: {
        color: '#FFE566',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // Daily Reward Badge
    dailyBadgeContainer: {
        alignItems: 'center',
    },
    dailyBadgePressable: {
        alignItems: 'center',
    },
    dailyBadgeOuter: {
        width: 60,
        height: 60,
        borderRadius: 18,
        borderWidth: 2.5,
        overflow: 'hidden',
        shadowColor: '#FF9F00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    dailyBadgeGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    dailyBadgeChestIcon: {
        fontSize: 28,
    },
    dayPill: {
        marginTop: 5,
        backgroundColor: '#FF9F00',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    dayPillClaimed: {
        backgroundColor: '#8B7355',
    },
    dayPillText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    rewardPreviewBubble: {
        marginTop: 4,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    rewardPreviewText: {
        color: '#FFD864',
        fontSize: 9,
        fontWeight: '700',
    },
});
