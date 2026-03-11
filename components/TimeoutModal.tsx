import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, RotateCcw } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

interface TimeoutModalProps {
    visible: boolean;
    onBuyTime: () => void;
    onRestart: () => void;
    buyAmountSeconds?: number;
    buyCostCoins?: number;
}

export function TimeoutModal({ visible, onBuyTime, onRestart, buyAmountSeconds = 60, buyCostCoins = 10 }: TimeoutModalProps) {
    const { progress } = useGame();
    const canAfford = progress.coins >= buyCostCoins;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <Clock size={48} color="#FF4D4D" />
                    </View>

                    <Text style={styles.title}>Time's Up!</Text>
                    <Text style={styles.subtitle}>You ran out of time.</Text>

                    <View style={styles.buttonsContainer}>
                        <Pressable
                            style={({ pressed }) => [styles.buyButtonContainer, pressed && canAfford && { transform: [{ scale: 0.95 }] }]}
                            onPress={onBuyTime}
                            disabled={!canAfford}
                        >
                            <LinearGradient
                                colors={canAfford ? ['#FFD84D', '#FF914D'] : ['#D1D5DB', '#9CA3AF']}
                                style={styles.buyGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.buyMainText}>+{buyAmountSeconds} Secs</Text>
                                <View style={styles.costBadge}>
                                    <Text style={styles.costText}>{buyCostCoins} 💰</Text>
                                </View>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.restartButton, pressed && { transform: [{ scale: 0.95 }] }]}
                            onPress={onRestart}
                        >
                            <RotateCcw size={20} color="#4B5563" />
                            <Text style={styles.restartText}>Restart Level</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
    },
    buyButtonContainer: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    buyGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    buyMainText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    costBadge: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    costText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    restartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        gap: 8,
    },
    restartText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
});
