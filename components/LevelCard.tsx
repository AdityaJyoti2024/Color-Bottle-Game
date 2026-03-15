import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Lock, Star, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelCardProps {
    level: number;
    isLocked: boolean;
    isCompleted: boolean;
    onPress: () => void;
    biomeAccent?: string;
    biomeNodeGrad?: readonly [string, string];
    biomeNodeShadow?: string;
}

export function LevelCard({
    level,
    isLocked,
    isCompleted,
    onPress,
    biomeAccent = '#4A6CF7',
    biomeNodeGrad = ['#4A6CF7', '#B84DFF'] as const,
    biomeNodeShadow = '#2A1A88',
}: LevelCardProps) {
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    const pressAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(0)).current;
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    // Idle float animation (only unlocked)
    React.useEffect(() => {
        if (isLocked) return;

        const float = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, { toValue: -4, duration: 1600, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 1600, useNativeDriver: true }),
            ])
        );
        float.start();

        // Glow pulse for current/active node
        if (!isCompleted) {
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
                ])
            );
            glow.start();
        }

        return () => { float.stop(); };
    }, [isLocked, isCompleted, translateY, glowAnim]);

    const handlePressIn = () => {
        if (isLocked) return;
        Animated.parallel([
            Animated.spring(scaleValue, { toValue: 0.92, useNativeDriver: true }),
            Animated.timing(pressAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        if (isLocked) return;
        Animated.parallel([
            Animated.spring(scaleValue, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
            Animated.timing(pressAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.75] });
    const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }, { translateY }] }}>
            <Pressable
                onPress={!isLocked ? onPress : undefined}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLocked}
                style={styles.container}
            >
                {/* Glow ring for active nodes */}
                {!isLocked && !isCompleted && (
                    <Animated.View style={[
                        styles.glowRing,
                        {
                            borderColor: biomeAccent,
                            opacity: glowOpacity,
                            transform: [{ scale: glowScale }],
                        }
                    ]} />
                )}

                {/* Bottom shadow layer (3D effect) */}
                <View style={[
                    styles.shadowLayer,
                    {
                        backgroundColor: isLocked ? '#555' :
                            isCompleted ? '#0D5B2A' : biomeNodeShadow,
                    }
                ]} />

                {/* Main node face */}
                <Animated.View style={[
                    styles.topLayer,
                    { transform: [{ translateY: pressAnim }] }
                ]}>
                    {isLocked ? (
                        <LinearGradient
                            colors={['#555', '#333']}
                            style={styles.gradientTop}
                        >
                            <Lock size={26} color="#888" strokeWidth={2} />
                        </LinearGradient>
                    ) : isCompleted ? (
                        <LinearGradient
                            colors={['#4DFF88', '#00CC55']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientTop}
                        >
                            <Check size={26} color="#FFF" strokeWidth={3} />
                        </LinearGradient>
                    ) : (
                        <LinearGradient
                            colors={[biomeNodeGrad[0], biomeNodeGrad[1]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientTop}
                        >
                            <Text style={styles.levelText}>{level}</Text>
                            {/* Shine overlay */}
                            <View style={styles.nodeShine} />
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Star badge for completed */}
                {isCompleted && (
                    <View style={styles.starBadge}>
                        <Star size={18} color="#FFD864" fill="#FFD864" />
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 68,
        height: 68,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2.5,
    },
    shadowLayer: {
        position: 'absolute',
        top: 7,
        left: 0,
        right: 0,
        height: '100%',
        borderRadius: 34,
    },
    topLayer: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        overflow: 'hidden',
    },
    gradientTop: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    nodeShine: {
        position: 'absolute',
        top: 6,
        left: 10,
        width: 12,
        height: 22,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.28)',
        transform: [{ rotate: '-20deg' }],
    },
    starBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        shadowColor: '#FFD864',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
});
