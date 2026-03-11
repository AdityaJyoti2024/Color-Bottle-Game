import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/levelGenerator';
import { Bottle as BottleType } from '../types';
import { useGame } from '../context/GameContext';

type GradientColors = readonly [string, string, ...string[]];

const THEME_STYLES: Record<string, { rim: GradientColors, neck: GradientColors, bodyBorder: string, bodyBg: string, liquidShadow: GradientColors, glassOverlay: GradientColors }> = {
    glass: {
        rim: ['rgba(255,255,255,0.9)', 'rgba(210,210,210,0.4)', 'rgba(255,255,255,0.8)'],
        neck: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.4)'],
        bodyBorder: 'rgba(255,255,255,0.7)',
        bodyBg: 'rgba(255,255,255,0.1)',
        liquidShadow: ['rgba(0,0,0,0.25)', 'transparent', 'rgba(255,255,255,0.2)'],
        glassOverlay: ['rgba(255,255,255,0.5)', 'transparent', 'rgba(255,255,255,0.15)']
    },
    ghost: {
        rim: ['rgba(255,255,255,1)', 'rgba(240,240,240,0.8)', 'rgba(255,255,255,0.9)'],
        neck: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.8)'],
        bodyBorder: 'rgba(255,255,255,1)',
        bodyBg: 'rgba(255,255,255,0.3)',
        liquidShadow: ['rgba(255,255,255,0.4)', 'transparent', 'rgba(255,255,255,0.6)'],
        glassOverlay: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)']
    },
    shadow: {
        rim: ['rgba(20,20,20,0.9)', 'rgba(0,0,0,0.8)', 'rgba(20,20,20,0.8)'],
        neck: ['rgba(30,30,30,0.8)', 'rgba(10,10,10,0.6)', 'rgba(30,30,30,0.7)'],
        bodyBorder: 'rgba(40,40,40,0.9)',
        bodyBg: 'rgba(10,10,10,0.8)',
        liquidShadow: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(255,255,255,0.05)'],
        glassOverlay: ['rgba(255,255,255,0.1)', 'transparent', 'rgba(255,255,255,0.02)']
    },
    ruby: {
        rim: ['rgba(255,100,100,0.9)', 'rgba(200,20,20,0.4)', 'rgba(255,50,50,0.8)'],
        neck: ['rgba(255,50,50,0.6)', 'rgba(150,10,10,0.2)', 'rgba(255,100,100,0.5)'],
        bodyBorder: 'rgba(255,50,50,0.8)',
        bodyBg: 'rgba(200,20,20,0.15)',
        liquidShadow: ['rgba(100,0,0,0.4)', 'transparent', 'rgba(255,150,150,0.3)'],
        glassOverlay: ['rgba(255,150,150,0.5)', 'transparent', 'rgba(255,100,100,0.2)']
    },
    sapphire: {
        rim: ['rgba(100,150,255,0.9)', 'rgba(20,50,200,0.4)', 'rgba(50,100,255,0.8)'],
        neck: ['rgba(50,100,255,0.6)', 'rgba(10,30,150,0.2)', 'rgba(100,150,255,0.5)'],
        bodyBorder: 'rgba(50,100,255,0.8)',
        bodyBg: 'rgba(20,50,200,0.15)',
        liquidShadow: ['rgba(0,0,100,0.4)', 'transparent', 'rgba(150,200,255,0.3)'],
        glassOverlay: ['rgba(150,200,255,0.5)', 'transparent', 'rgba(100,150,255,0.2)']
    },
    emerald: {
        rim: ['rgba(100,255,150,0.9)', 'rgba(20,200,50,0.4)', 'rgba(50,255,100,0.8)'],
        neck: ['rgba(50,255,100,0.6)', 'rgba(10,150,30,0.2)', 'rgba(100,255,150,0.5)'],
        bodyBorder: 'rgba(50,255,100,0.8)',
        bodyBg: 'rgba(20,200,50,0.15)',
        liquidShadow: ['rgba(0,100,0,0.4)', 'transparent', 'rgba(150,255,200,0.3)'],
        glassOverlay: ['rgba(150,255,200,0.5)', 'transparent', 'rgba(100,255,150,0.2)']
    },
    amethyst: {
        rim: ['rgba(200,100,255,0.9)', 'rgba(100,20,200,0.4)', 'rgba(150,50,255,0.8)'],
        neck: ['rgba(150,50,255,0.6)', 'rgba(80,10,150,0.2)', 'rgba(200,100,255,0.5)'],
        bodyBorder: 'rgba(150,50,255,0.8)',
        bodyBg: 'rgba(100,20,200,0.15)',
        liquidShadow: ['rgba(50,0,100,0.4)', 'transparent', 'rgba(220,150,255,0.3)'],
        glassOverlay: ['rgba(220,150,255,0.5)', 'transparent', 'rgba(150,100,255,0.2)']
    },
    bronze: {
        rim: ['rgba(205,127,50,0.9)', 'rgba(139,69,19,0.6)', 'rgba(210,140,70,0.8)'],
        neck: ['rgba(180,100,40,0.8)', 'rgba(100,50,10,0.4)', 'rgba(205,127,50,0.7)'],
        bodyBorder: 'rgba(180,100,40,0.9)',
        bodyBg: 'rgba(139,69,19,0.2)',
        liquidShadow: ['rgba(60,30,0,0.5)', 'transparent', 'rgba(255,200,150,0.2)'],
        glassOverlay: ['rgba(255,200,150,0.4)', 'transparent', 'rgba(205,127,50,0.2)']
    },
    silver: {
        rim: ['rgba(230,232,250,0.9)', 'rgba(150,150,160,0.6)', 'rgba(200,200,210,0.8)'],
        neck: ['rgba(200,200,210,0.8)', 'rgba(120,120,130,0.4)', 'rgba(230,232,250,0.7)'],
        bodyBorder: 'rgba(200,200,210,0.9)',
        bodyBg: 'rgba(150,150,160,0.2)',
        liquidShadow: ['rgba(50,50,60,0.5)', 'transparent', 'rgba(255,255,255,0.3)'],
        glassOverlay: ['rgba(255,255,255,0.6)', 'transparent', 'rgba(200,200,210,0.3)']
    },
    dark: {
        rim: ['rgba(80,80,80,0.9)', 'rgba(30,30,30,0.4)', 'rgba(80,80,80,0.8)'],
        neck: ['rgba(100,100,100,0.6)', 'rgba(40,40,40,0.1)', 'rgba(100,100,100,0.4)'],
        bodyBorder: 'rgba(120,120,120,0.7)',
        bodyBg: 'rgba(50,50,50,0.4)',
        liquidShadow: ['rgba(0,0,0,0.6)', 'transparent', 'rgba(255,255,255,0.1)'],
        glassOverlay: ['rgba(255,255,255,0.2)', 'transparent', 'rgba(255,255,255,0.05)']
    },
    gold: {
        rim: ['rgba(255,215,0,0.9)', 'rgba(184,134,11,0.6)', 'rgba(255,223,0,0.8)'],
        neck: ['rgba(218,165,32,0.8)', 'rgba(139,101,8,0.4)', 'rgba(255,215,0,0.7)'],
        bodyBorder: 'rgba(218,165,32,0.9)',
        bodyBg: 'rgba(184,134,11,0.2)',
        liquidShadow: ['rgba(100,70,0,0.5)', 'transparent', 'rgba(255,250,200,0.3)'],
        glassOverlay: ['rgba(255,250,200,0.6)', 'transparent', 'rgba(255,215,0,0.3)']
    },
    poison: {
        rim: ['rgba(150,255,50,0.9)', 'rgba(50,100,10,0.6)', 'rgba(100,200,30,0.8)'],
        neck: ['rgba(100,200,30,0.8)', 'rgba(30,80,5,0.4)', 'rgba(150,255,50,0.7)'],
        bodyBorder: 'rgba(100,200,30,0.9)',
        bodyBg: 'rgba(50,100,10,0.25)',
        liquidShadow: ['rgba(20,50,0,0.5)', 'transparent', 'rgba(200,255,150,0.3)'],
        glassOverlay: ['rgba(200,255,150,0.5)', 'transparent', 'rgba(100,255,50,0.2)']
    },
    lava: {
        rim: ['rgba(255,80,0,0.9)', 'rgba(150,20,0,0.6)', 'rgba(255,120,0,0.8)'],
        neck: ['rgba(255,100,0,0.8)', 'rgba(100,10,0,0.4)', 'rgba(255,80,0,0.7)'],
        bodyBorder: 'rgba(255,100,0,0.9)',
        bodyBg: 'rgba(150,20,0,0.25)',
        liquidShadow: ['rgba(80,0,0,0.6)', 'transparent', 'rgba(255,200,100,0.3)'],
        glassOverlay: ['rgba(255,200,100,0.5)', 'transparent', 'rgba(255,100,0,0.2)']
    },
    crystal: {
        rim: ['rgba(255,255,255,0.95)', 'rgba(200,220,255,0.6)', 'rgba(255,255,255,0.9)'],
        neck: ['rgba(220,240,255,0.8)', 'rgba(150,180,255,0.3)', 'rgba(255,255,255,0.7)'],
        bodyBorder: 'rgba(220,240,255,0.9)',
        bodyBg: 'rgba(200,220,255,0.1)',
        liquidShadow: ['rgba(100,150,255,0.3)', 'transparent', 'rgba(255,255,255,0.4)'],
        glassOverlay: ['rgba(255,255,255,0.7)', 'rgba(200,220,255,0.2)', 'rgba(255,255,255,0.5)']
    },
    neon: {
        rim: ['rgba(255,100,200,0.9)', 'rgba(50,20,50,0.4)', 'rgba(100,200,255,0.8)'],
        neck: ['rgba(255,100,200,0.6)', 'rgba(50,20,50,0.1)', 'rgba(100,200,255,0.4)'],
        bodyBorder: 'rgba(200,100,255,0.8)',
        bodyBg: 'rgba(20,0,40,0.4)',
        liquidShadow: ['rgba(0,0,50,0.6)', 'transparent', 'rgba(255,150,255,0.2)'],
        glassOverlay: ['rgba(255,150,255,0.3)', 'transparent', 'rgba(100,255,255,0.1)']
    }
};

interface BottleProps {
    bottle: BottleType;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    isPouring?: boolean;
    isPouringTarget?: boolean;
    bottleIndex?: number;
    rowIndex?: number;
    scaleOverride?: number;
    previewThemeId?: string;
}

export function Bottle({ bottle, isSelected, onClick, disabled, isPouring, isPouringTarget, scaleOverride = 1, previewThemeId }: BottleProps) {
    const { progress } = useGame();
    // Prioritize explicit preview themes (like in the shop layout) over global activeTheme
    const activeTheme = previewThemeId || progress.activeTheme || 'glass';
    const themeConfig = THEME_STYLES[activeTheme] || THEME_STYLES.glass;

    const { colors, maxCapacity } = bottle;
    const isComplete = colors.length === maxCapacity &&
        colors.length > 0 &&
        colors.every(color => color === colors[0]);

    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(scaleOverride)).current;
    const glowOpacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: isSelected ? -20 : 0,
            useNativeDriver: true,
        }).start();

        Animated.spring(rotate, {
            toValue: isPouring ? -35 : 0,
            useNativeDriver: true,
        }).start();

        Animated.spring(scale, {
            toValue: isSelected ? scaleOverride + 0.05 : scaleOverride,
            useNativeDriver: true,
        }).start();
    }, [isSelected, isPouring, translateY, rotate, scale, scaleOverride]);

    useEffect(() => {
        if (isComplete) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(glowOpacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [isComplete, glowOpacity]);

    const rotateInterpolation = rotate.interpolate({
        inputRange: [-45, 0],
        outputRange: ['-45deg', '0deg']
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY },
                        { rotate: rotateInterpolation },
                        { scale }
                    ],
                    opacity: disabled ? 0.5 : 1,
                }
            ]}
        >
            <Pressable onPress={!disabled ? onClick : undefined} style={styles.pressable}>

                {/* Back Glowing Effect for Completed/Target */}
                {isComplete && <Animated.View style={[styles.completeGlow, { opacity: glowOpacity }]} />}
                {isPouringTarget && <View style={styles.targetGlow} />}

                {/* Main Bottle Container */}
                <View style={styles.bottleContainer}>

                    {/* Shadow underneath */}
                    <View style={styles.shadow} />

                    {/* Bottle Top Rim */}
                    <LinearGradient
                        colors={themeConfig.rim}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.rim, isSelected && styles.rimSelected, { borderColor: themeConfig.rim[0] }]}
                    />

                    {/* Bottle Neck */}
                    <LinearGradient
                        colors={themeConfig.neck}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.neck, isSelected && styles.neckSelected, { borderColor: themeConfig.bodyBorder }]}
                    />

                    {/* Main Glass Body */}
                    <View style={[
                        styles.body,
                        (isSelected || isPouringTarget) && styles.bodyHighlighted,
                        { borderColor: themeConfig.bodyBorder, backgroundColor: themeConfig.bodyBg }
                    ]}>

                        {/* Colored Liquid Stack */}
                        <View style={styles.liquidsWrapper}>
                            {colors.map((color, index) => (
                                <View
                                    key={`color-${index}`}
                                    style={[
                                        styles.colorSegment,
                                        {
                                            height: `${100 / maxCapacity}%`,
                                            backgroundColor: COLORS[color as keyof typeof COLORS] || '#000',
                                        }
                                    ]}
                                >
                                    {/* Liquid Volume Gradient Shadow */}
                                    <LinearGradient
                                        colors={themeConfig.liquidShadow}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                    {/* 3D Liquid Top Edge Rim */}
                                    <View style={styles.liquidTopEdge} />
                                </View>
                            ))}
                        </View>

                        {/* Glossy Front Glass Reflections */}
                        <LinearGradient
                            colors={themeConfig.glassOverlay}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.glassOverlay}
                            pointerEvents="none"
                        >
                            <View style={styles.highlightLeft} />
                            <View style={styles.highlightRight} />
                        </LinearGradient>
                    </View>

                </View>

                {/* Golden Sparkles for Complete Bottles */}
                {isComplete && (
                    <View style={styles.sparklesContainer1}>
                        <Sparkles size={24} color="#FBBF24" fill="#FBBF24" />
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 6,
    },
    pressable: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    bottleContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        paddingTop: 10,
    },
    shadow: {
        position: 'absolute',
        bottom: -6,
        width: 48,
        height: 14,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        transform: [{ scaleX: 1.5 }],
        zIndex: -1,
    },
    rim: {
        width: 74,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.8)',
        marginBottom: -4,
        zIndex: 3,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    rimSelected: {
        borderColor: '#fff',
        shadowOpacity: 0.8,
    },
    neck: {
        width: 50,
        height: 20,
        borderLeftWidth: 2.5,
        borderRightWidth: 2.5,
        borderColor: 'rgba(255,255,255,0.7)',
        zIndex: 2,
    },
    neckSelected: {
        borderColor: 'rgba(255,255,255,0.9)',
    },
    body: {
        width: 66,
        height: 160,
        borderWidth: 2.5,
        borderColor: 'rgba(255,255,255,0.7)',
        borderTopWidth: 0,
        borderBottomLeftRadius: 33,
        borderBottomRightRadius: 33,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 1,
    },
    bodyHighlighted: {
        borderColor: 'rgba(255,255,255,0.9)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    liquidsWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'flex-start',
        flexDirection: 'column-reverse', // Makes index 0 bottom liquid!
    },
    colorSegment: {
        width: '100%',
        marginTop: -0.5, // Slight pixel smoothing overlap
    },
    liquidTopEdge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 12,
        borderRadius: 33, // Match body radius gracefully 
    },
    highlightLeft: {
        width: 6,
        height: '92%',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 4,
    },
    highlightRight: {
        width: 3,
        height: '75%',
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 2,
        marginTop: 15,
    },
    completeGlow: {
        position: 'absolute',
        top: 20,
        bottom: -10,
        left: -10,
        right: -10,
        backgroundColor: '#FDE047',
        borderRadius: 40,
        zIndex: -1,
        opacity: 0.5,
    },
    targetGlow: {
        position: 'absolute',
        top: 15,
        bottom: -10,
        left: -5,
        right: -5,
        backgroundColor: '#4A6CF7',
        borderRadius: 40,
        opacity: 0.5,
        zIndex: -1,
    },
    sparklesContainer1: {
        position: 'absolute',
        top: -10,
        right: -15,
        zIndex: 10,
    },
});
