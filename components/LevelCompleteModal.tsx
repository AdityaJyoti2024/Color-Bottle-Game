import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Share, Image } from 'react-native';
import { Trophy, Share2, ArrowRight, X, Star as StarIcon } from 'lucide-react-native';
import { GameButton } from './GameButton';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelCompleteModalProps {
    level: number;
    onNextLevel: () => void;
    onClose: () => void;
}

export function LevelCompleteModal({ level, onNextLevel, onClose }: LevelCompleteModalProps) {
    const handleShare = async () => {
        try {
            await Share.share({
                message: `I just completed level ${level} in Color Bottle Puzzle! 🎉`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, [scale]);

    return (
        <Modal transparent visible animationType="fade">
            <View style={styles.overlay}>
                {/* Celebration GIF Overlay */}
                <View style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10 }]} pointerEvents="none">
                    <Image
                        source={require('../assets/Exploding Ribbon and Confetti.gif')}
                        style={styles.celebrationGif}
                        resizeMode="contain"
                    />
                </View>

                <Animated.View style={[styles.modalContainer, { transform: [{ scale }] }]}>

                    {/* Close Button */}
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <X size={20} color="#8B5A2B" />
                    </Pressable>

                    {/* Trophy Area */}
                    <View style={styles.trophyContainer}>
                        <LinearGradient
                            colors={['#FFD84D', '#FF914D']}
                            style={styles.trophyGradient}
                        >
                            <Trophy size={64} color="#FFF" />
                        </LinearGradient>
                    </View>

                    {/* Celebration Banner */}
                    <View style={styles.bannerContainer}>
                        <Text style={styles.titleText}>Level Complete!</Text>
                        <Text style={styles.subtitleText}>Level {level}</Text>
                    </View>

                    {/* Stars */}
                    <View style={styles.starsContainer}>
                        <StarIcon size={48} color="#FFD84D" fill="#FFD84D" />
                        <StarIcon size={48} color="#FFD84D" fill="#FFD84D" style={{ marginHorizontal: 8, marginTop: -16 }} />
                        <StarIcon size={48} color="#FFD84D" fill="#FFD84D" />
                    </View>

                    {/* Reward Box */}
                    <View style={styles.rewardBox}>
                        <View style={styles.rewardColumn}>
                            <Text style={styles.rewardIcon}>💰</Text>
                            <Text style={styles.rewardText}>+10 Coins</Text>
                        </View>
                        <View style={styles.rewardColumn}>
                            <Text style={styles.rewardIcon}>🏆</Text>
                            <Text style={styles.rewardText}>1 Star</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <GameButton
                            onPress={onNextLevel}
                            variant="success"
                            icon={<ArrowRight size={24} color="#111827" />}
                            style={styles.actionButton}
                        >
                            Next Level
                        </GameButton>

                        <GameButton
                            onPress={handleShare}
                            variant="secondary"
                            icon={<Share2 size={20} color="#4A6CF7" />}
                            style={styles.actionButton}
                        >
                            Share
                        </GameButton>
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
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
        maxWidth: 340,
        backgroundColor: '#D8B384',
        borderWidth: 4,
        borderColor: '#8B5A2B',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#3d1b04',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 5,
        position: 'relative',
        zIndex: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        zIndex: 50,
        elevation: 10,
    },
    trophyContainer: {
        marginBottom: 24,
    },
    trophyGradient: {
        padding: 24,
        borderRadius: 9999,
    },
    bannerContainer: {
        backgroundColor: '#8B5A2B',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#5c3a18',
        alignItems: 'center',
        marginBottom: 24,
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
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    rewardBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(139, 90, 43, 0.3)',
    },
    rewardColumn: {
        alignItems: 'center',
    },
    rewardIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    rewardText: {
        color: '#5c3a18',
        fontWeight: 'bold',
    },
    actionsContainer: {
        width: '100%',
        gap: 12,
    },
    actionButton: {
        width: '100%',
    },
});
