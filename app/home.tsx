import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Calendar, Settings, User, Bell } from 'lucide-react-native';
import { GameButton } from '../components/GameButton';
import Svg, { Rect } from 'react-native-svg';
import { useGame } from '../context/GameContext';
import { DailyRewardModal } from '../components/DailyRewardModal';

export default function HomeScreen() {
    const router = useRouter();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    const { progress } = useGame();
    const [showDailyReward, setShowDailyReward] = useState(false);

    useEffect(() => {
        if (!progress.rewardClaimedToday) {
            const timer = setTimeout(() => setShowDailyReward(true), 1200); // Give home screen time to cleanly animate in first
            return () => clearTimeout(timer);
        }
    }, [progress.rewardClaimedToday]);

    useEffect(() => {
        // Initial fade in and scale
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Bottle floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [fadeAnim, scaleAnim, floatAnim]);

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

                {/* Game Title */}
                <View style={styles.titleContainer}>
                    <Text style={[styles.titleText, { color: '#4A6CF7' }]}>Color</Text>
                    <Text style={[styles.titleText, { color: '#B84DFF' }]}>Bottle</Text>
                    <Text style={[styles.titleText, { color: '#4DFF88' }]}>Puzzle</Text>
                </View>

                {/* Bottle Icon */}
                <Animated.View style={[styles.bottleContainer, { transform: [{ translateY: floatAnim }] }]}>
                    <Svg width="80" height="120" viewBox="0 0 80 120">
                        <Rect x="15" y="15" width="50" height="20" rx="5" fill="#2D2D2D" />
                        <Rect x="10" y="35" width="60" height="80" rx="15" fill="white" stroke="#2D2D2D" strokeWidth="4" />
                        <Rect x="14" y="85" width="52" height="26" fill="#4A6CF7" />
                        <Rect x="14" y="59" width="52" height="26" fill="#B84DFF" />
                    </Svg>
                </Animated.View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <GameButton
                        onPress={() => router.push('/levels')}
                        icon={<Play size={24} color="#FFF" />}
                        style={styles.button}
                    >
                        Play
                    </GameButton>

                    <GameButton
                        onPress={() => router.push('/daily')}
                        variant="secondary"
                        icon={<Calendar size={24} color="#4A6CF7" />}
                        style={styles.button}
                    >
                        Daily Puzzle
                    </GameButton>
                </View>

                {/* Bottom Navigation Tray */}
                <View style={styles.navTray}>
                    <Pressable
                        style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                        onPress={() => router.push('/settings')}
                    >
                        <Settings size={28} color="#4A6CF7" />
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.iconButton, styles.profileButton, pressed && styles.iconButtonPressed]}
                        onPress={() => router.push('/profile')}
                    >
                        <User size={32} color="#FFF" />
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                        onPress={() => router.push('/notifications')}
                    >
                        <Bell size={28} color="#4A6CF7" />
                    </Pressable>
                </View>

            </Animated.View>

            {/* Daily Reward Modal Trigger */}
            {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} />}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    titleText: {
        fontSize: 56,
        fontWeight: 'bold',
        lineHeight: 64,
    },
    bottleContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    button: {
        width: 260,
    },
    navTray: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 48,
        gap: 32,
    },
    iconButton: {
        width: 56,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    profileButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#4A6CF7',
        transform: [{ translateY: -10 }],
    },
    iconButtonPressed: {
        transform: [{ scale: 0.9 }],
    },
});
