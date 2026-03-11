import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Image, ScrollView } from 'react-native';
import { Coins, Lightbulb, SkipForward, PlusSquare, Gift, Check, X } from 'lucide-react-native';
import { GameButton } from './GameButton';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/sound';

interface DailyRewardModalProps {
    onClose: () => void;
}

export function DailyRewardModal({ onClose }: DailyRewardModalProps) {
    const { progress, claimDailyReward } = useGame();
    const scale = useRef(new Animated.Value(0)).current;

    const currentDay = progress.dailyRewardStreak === 0 ? 1 : progress.dailyRewardStreak;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
        soundManager.play('win');
    }, [scale]);

    const handleClaim = () => {
        const rewardConfig = rewards[currentDay - 1];
        claimDailyReward(rewardConfig.type as any, rewardConfig.amount);
        soundManager.play('pour');
        onClose();
    };

    const rewards = [
        { day: 1, type: 'coins', amount: 50, icon: <Coins size={28} color="#FFD84D" />, title: '50 Coins' },
        { day: 2, type: 'hint', amount: 1, icon: <Lightbulb size={28} color="#FFD84D" />, title: '1 Hint' },
        { day: 3, type: 'coins', amount: 100, icon: <Coins size={28} color="#FFD84D" />, title: '100 Coins' },
        { day: 4, type: 'skip', amount: 1, icon: <SkipForward size={28} color="#B84DFF" />, title: '1 Skip' },
        { day: 5, type: 'extraBottle', amount: 1, icon: <PlusSquare size={28} color="#4A6CF7" />, title: '+1 Bottle' },
        { day: 6, type: 'coins', amount: 200, icon: <Coins size={28} color="#FFD84D" />, title: '200 Coins' },
        { day: 7, type: 'mystery', amount: 1, icon: <Gift size={32} color="#FF4D4D" />, title: 'Mystery!' },
    ];

    return (
        <Modal transparent visible animationType="fade">
            <View style={styles.overlay}>
                {/* Celebration GIF inside the modal */}
                <View style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10 }]} pointerEvents="none">
                    <Image
                        source={require('../assets/Exploding Ribbon and Confetti.gif')}
                        style={styles.celebrationGif}
                        resizeMode="contain"
                    />
                </View>

                <Animated.View style={[styles.modalContainer, { transform: [{ scale }] }]}>

                    {/* Exitable X button, just in case user wants to save claim for later */}
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <X size={20} color="#8B5A2B" />
                    </Pressable>

                    <View style={styles.bannerContainer}>
                        <Text style={styles.titleText}>Daily Reward</Text>
                        <Text style={styles.subtitleText}>Day {currentDay} / 7</Text>
                    </View>

                    {/* Reward Cards Layout */}
                    <View style={styles.rewardsGrid}>
                        {rewards.map((reward, index) => {
                            const isPast = reward.day < currentDay;
                            const isToday = reward.day === currentDay;
                            const isFuture = reward.day > currentDay;

                            return (
                                <View
                                    key={reward.day}
                                    style={[
                                        styles.rewardCard,
                                        isToday && styles.rewardCardActive,
                                        isPast && styles.rewardCardClaimed,
                                        reward.day === 7 && styles.rewardCardDay7
                                    ]}
                                >
                                    <View style={styles.dayBadge}>
                                        <Text style={styles.dayText}>Day {reward.day}</Text>
                                    </View>

                                    <View style={styles.iconWrapper}>
                                        {isPast ? <Check size={32} color="#4DFF88" /> : reward.icon}
                                    </View>

                                    <Text style={[styles.rewardTitle, isPast && { color: '#888' }]}>
                                        {isPast ? 'Claimed' : reward.title}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <GameButton
                        onPress={handleClaim}
                        variant="success"
                        style={styles.claimButton}
                    >
                        Claim Reward
                    </GameButton>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    celebrationGif: {
        position: 'absolute',
        width: '150%',
        height: '150%',
        top: '-25%',
        left: '-25%',
        zIndex: 10,
        opacity: 0.8,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#D8B384',
        borderWidth: 4,
        borderColor: '#8B5A2B',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#3d1b04',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 5,
        zIndex: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        zIndex: 50,
        elevation: 10,
    },
    bannerContainer: {
        backgroundColor: '#8B5A2B',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#5c3a18',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitleText: {
        fontSize: 16,
        color: '#FFD84D',
        fontWeight: '600',
    },
    rewardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    rewardCard: {
        width: 80,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(139, 90, 43, 0.3)',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rewardCardActive: {
        backgroundColor: '#FFF',
        borderColor: '#FFD84D',
        shadowColor: '#FFD84D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 10,
        transform: [{ scale: 1.05 }],
    },
    rewardCardClaimed: {
        opacity: 0.6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderColor: 'transparent',
    },
    rewardCardDay7: {
        width: 168, // Double width to span the bottom row completely!
        height: 100,
        backgroundColor: 'rgba(255, 216, 77, 0.2)',
        borderColor: '#FF914D',
    },
    dayBadge: {
        backgroundColor: '#8B5A2B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    dayText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    iconWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#5c3a18',
        textAlign: 'center',
    },
    claimButton: {
        width: '100%',
        marginTop: 8,
    }
});
