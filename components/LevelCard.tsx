import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Lock, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelCardProps {
    level: number;
    isLocked: boolean;
    isCompleted: boolean;
    onPress: () => void;
}

export function LevelCard({ level, isLocked, isCompleted, onPress }: LevelCardProps) {
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    const pressAnim = React.useRef(new Animated.Value(0)).current; // For 3D push down
    const translateY = React.useRef(new Animated.Value(0)).current; // Float animation

    // Idle floating animation
    React.useEffect(() => {
        if (isLocked) return;

        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -3,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [isLocked, translateY]);

    const handlePressIn = () => {
        if (isLocked) return;
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(pressAnim, { // Push button down 6px
                toValue: 6,
                duration: 50,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        if (isLocked) return;
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(pressAnim, { // Return to top position
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleValue }, { translateY }] }]}>
            <Pressable
                onPress={!isLocked ? onPress : undefined}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLocked}
                style={[styles.container, isLocked && styles.containerLocked]}
            >
                {/* 3D Base Shadow Layer */}
                <View style={[
                    styles.shadowLayer,
                    isLocked ? { backgroundColor: '#9CA3AF' } :
                        isCompleted ? { backgroundColor: '#10B981' } : { backgroundColor: '#4338CA' }
                ]} />

                {/* Top Interactive Layer */}
                <Animated.View style={[
                    styles.topLayer,
                    { transform: [{ translateY: pressAnim }] },
                    isLocked ? { backgroundColor: '#D1D5DB' } : {}
                ]}>
                    {isLocked ? (
                        <Lock size={28} color="#6B7280" />
                    ) : isCompleted ? (
                        <LinearGradient
                            colors={['#4DFF88', '#4DA6FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientTop}
                        >
                            <Text style={styles.levelText}>{level}</Text>
                        </LinearGradient>
                    ) : (
                        <LinearGradient
                            colors={['#4A6CF7', '#B84DFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientTop}
                        >
                            <Text style={styles.levelText}>{level}</Text>
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Complete Star Element placed OUTSIDE the pressable translation to float */}
                {isCompleted && !isLocked && (
                    <View style={styles.starBadgeContainer}>
                        <Star size={24} color="#FFD84D" fill="#FFD84D" style={styles.starIconCenter} />
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    containerLocked: {
        opacity: 0.9,
    },
    shadowLayer: {
        position: 'absolute',
        top: 6, // Offset to create 3D height
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    topLayer: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
    },
    gradientTop: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    starBadgeContainer: {
        position: 'absolute',
        top: -14,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '100%',
        zIndex: 10,
    },
    starIconCenter: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 4,
    },
});
