import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, FlatList, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Trees, Cloud, Mountain, Sun, Snowflake, Star, Shield, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { LevelCard } from '../components/LevelCard';
import { useGame } from '../context/GameContext';

// Biome Definitions
const BIOMES = [
    { name: 'Grassland', bg: '#F5F7FF', pathColor: 'rgba(74, 108, 247, 0.4)', icon: Trees, iconColor: '#A7F3D0' },
    { name: 'Desert', bg: '#FEF3C7', pathColor: 'rgba(217, 119, 6, 0.4)', icon: Sun, iconColor: '#FDE68A' },
    { name: 'Snow', bg: '#E0F2FE', pathColor: 'rgba(56, 189, 248, 0.4)', icon: Snowflake, iconColor: '#BAE6FD' },
    { name: 'Candy', bg: '#FCE7F3', pathColor: 'rgba(219, 39, 119, 0.4)', icon: Star, iconColor: '#FBCFE8' },
    { name: 'Volcano', bg: '#FEE2E2', pathColor: 'rgba(220, 38, 38, 0.4)', icon: Flame, iconColor: '#FECACA' }
];

const { width } = Dimensions.get('window');
const MAP_PADDING = 40;
const NODE_SIZE = 64;
const VERTICAL_SPACING = 100;
const SINE_AMPLITUDE = (width - MAP_PADDING * 2 - NODE_SIZE) / 2;

export default function LevelSelectScreen() {
    const router = useRouter();
    const { progress } = useGame();
    const totalLevels = 2000;

    // Ordered levels where Level 1 is rendered at the bottom
    const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

    const flatListRef = useRef<FlatList>(null);
    const progressBarAnim = useRef(new Animated.Value(0)).current;

    // Calculate Coordinates based on index
    const getLevelPositionX = (index: number) => {
        const frequency = 0.5;
        const xOffset = width / 2 - (NODE_SIZE / 2);
        return xOffset + Math.sin(index * frequency) * SINE_AMPLITUDE;
    };

    // Render path fragment
    const renderPathSegment = (index: number, biome: typeof BIOMES[0]) => {
        if (index === 0) return null;

        const prevX = getLevelPositionX(index - 1) + NODE_SIZE / 2;
        const currentX = getLevelPositionX(index) + NODE_SIZE / 2;

        const startY = VERTICAL_SPACING;
        const startX = prevX;
        const endY = 0;
        const endX = currentX;

        const c1X = startX;
        const c1Y = startY - VERTICAL_SPACING / 2;
        const c2X = endX;
        const c2Y = endY + VERTICAL_SPACING / 2;

        const d = `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;

        // Dots line underneath to enhance path texture
        return (
            <View style={StyleSheet.absoluteFill}>
                <Svg width={width} height={VERTICAL_SPACING} style={{ position: 'absolute', top: NODE_SIZE / 2, left: 0 }}>
                    <Path d={d} stroke={biome.pathColor} strokeWidth="24" strokeLinecap="round" fill="none" />
                    <Path d={d} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="12" strokeLinecap="round" strokeDasharray="1, 24" fill="none" />
                </Svg>
            </View>
        );
    };

    // Animate progress bar fill
    useEffect(() => {
        const fraction = Math.min(progress.completedLevels.length / totalLevels, 1);
        Animated.timing(progressBarAnim, {
            toValue: fraction,
            duration: 1000,
            useNativeDriver: false,
        }).start();

        setTimeout(() => {
            if (flatListRef.current) {
                const targetIndex = Math.max(0, progress.currentLevel - 1);
                flatListRef.current.scrollToIndex({ index: targetIndex, animated: true, viewPosition: 0.5 });
            }
        }, 500);
    }, [progress.currentLevel, progress.completedLevels.length, progressBarAnim]);

    const progressBarWidth = progressBarAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const renderItem = ({ item, index }: { item: number; index: number }) => {
        const isCompleted = progress.completedLevels.includes(item);
        const isLocked = item > progress.currentLevel;
        const x = getLevelPositionX(index);

        // 20 levels per zone biome
        const zoneIndex = Math.floor((item - 1) / 20);
        const biome = BIOMES[zoneIndex % BIOMES.length];
        const BiomeIcon = biome.icon;

        // Decorative scatter based on odd/even to appear on opposite sides of the sine wave
        const isLeftCurve = x < width / 2 - NODE_SIZE / 2;
        const decorX = isLeftCurve ? width - 80 : 20;
        const showDecor = index % 3 === 0 && index !== 0;

        return (
            <View style={{ height: VERTICAL_SPACING, width, backgroundColor: 'transparent' }}>
                {renderPathSegment(index, biome)}

                {/* Decorative Elements */}
                {showDecor && (
                    <View style={{ position: 'absolute', left: decorX, top: VERTICAL_SPACING / 3, opacity: 0.7 }}>
                        <BiomeIcon size={48} color={biome.iconColor} strokeWidth={1.5} />
                    </View>
                )}

                <View style={[styles.nodeWrapper, { left: x, top: 0 }]}>
                    <LevelCard
                        level={item}
                        isLocked={isLocked}
                        isCompleted={isCompleted}
                        onPress={() => router.push(`/game?id=${item}`)}
                    />
                </View>
            </View>
        );
    };

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            <FlatList
                ref={flatListRef}
                data={levels}
                keyExtractor={(item) => item.toString()}
                renderItem={renderItem}
                inverted
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                getItemLayout={(data, index) => ({
                    length: VERTICAL_SPACING,
                    offset: VERTICAL_SPACING * index,
                    index,
                })}
                initialScrollIndex={Math.max(0, progress.currentLevel - 1)}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
            />

            {/* Header - Absolute Positioned to float over map */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                    >
                        <ArrowLeft size={24} color="#4A6CF7" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Journey Map</Text>
                    <View style={styles.spacer} />
                </View>

            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 60,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(245, 247, 255, 0.9)', // Slight transparency
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    backButtonPressed: {
        transform: [{ scale: 0.9 }],
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A6CF7',
    },
    spacer: {
        width: 48,
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
        marginLeft: 8,
    },
    progressValue: {
        fontSize: 16,
        color: '#4A6CF7',
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingTop: 240, // Space for the floating header
        paddingBottom: 40,
    },
    nodeWrapper: {
        position: 'absolute',
        width: NODE_SIZE,
        height: NODE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
