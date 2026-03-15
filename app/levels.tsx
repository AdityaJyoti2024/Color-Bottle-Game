import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trees, Sun, Snowflake, Star, Flame, Cherry } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Circle, Rect } from 'react-native-svg';
import { LevelCard } from '../components/LevelCard';
import { useGame } from '../context/GameContext';

// Enhanced Biome Definitions with richer theming
const BIOMES = [
    {
        name: 'Enchanted Forest',
        pathColor: 'rgba(200, 133, 74, 0.6)',
        dotColor: 'rgba(255, 216, 100, 0.7)',
        icon: Trees,
        iconColor: '#6DFFAA',
        accentColor: '#4DFF88',
        nodeGrad: ['#38D47A', '#1A8C4A'] as const,
        nodeShadow: '#0D5C2A',
        badge: '🌲',
    },
    {
        name: 'Sahara Desert',
        pathColor: 'rgba(200, 133, 74, 0.6)',
        dotColor: 'rgba(255, 216, 100, 0.7)',
        icon: Sun,
        iconColor: '#FFD864',
        accentColor: '#FFB800',
        nodeGrad: ['#FFB800', '#CC7800'] as const,
        nodeShadow: '#7A4200',
        badge: '🌵',
    },
    {
        name: 'Frozen Tundra',
        pathColor: 'rgba(200, 133, 74, 0.6)',
        dotColor: 'rgba(255, 216, 100, 0.7)',
        icon: Snowflake,
        iconColor: '#A0D8FF',
        accentColor: '#60B8FF',
        nodeGrad: ['#6CC8FF', '#3A88CC'] as const,
        nodeShadow: '#1A5090',
        badge: '❄️',
    },
    {
        name: 'Candy Kingdom',
        pathColor: 'rgba(200, 133, 74, 0.6)',
        dotColor: 'rgba(255, 216, 100, 0.7)',
        icon: Cherry,
        iconColor: '#FF8AE0',
        accentColor: '#FF55CC',
        nodeGrad: ['#FF70D8', '#CC30A0'] as const,
        nodeShadow: '#8A1060',
        badge: '🍭',
    },
    {
        name: 'Volcano Island',
        pathColor: 'rgba(200, 133, 74, 0.6)',
        dotColor: 'rgba(255, 216, 100, 0.7)',
        icon: Flame,
        iconColor: '#FF7A30',
        accentColor: '#FF5500',
        nodeGrad: ['#FF6A20', '#CC3800'] as const,
        nodeShadow: '#8A2000',
        badge: '🌋',
    },
];

const { width } = Dimensions.get('window');
const MAP_PADDING = 44;
const NODE_SIZE = 68;
const VERTICAL_SPACING = 110;
const SINE_AMPLITUDE = (width - MAP_PADDING * 2 - NODE_SIZE) / 2;

export default function LevelSelectScreen() {
    const router = useRouter();
    const { progress } = useGame();
    const totalLevels = 2000;

    const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);
    const flatListRef = useRef<FlatList>(null);
    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const headerSlideAnim = useRef(new Animated.Value(-20)).current;

    const getLevelPositionX = (index: number) => {
        const frequency = 0.48;
        const xOffset = width / 2 - NODE_SIZE / 2;
        return xOffset + Math.sin(index * frequency) * SINE_AMPLITUDE;
    };

    const renderPathSegment = (index: number, biome: typeof BIOMES[0]) => {
        if (index >= totalLevels - 1) return null;

        const currentX = getLevelPositionX(index) + NODE_SIZE / 2;
        const nextX = getLevelPositionX(index + 1) + NODE_SIZE / 2;

        const startY = VERTICAL_SPACING;
        const endY = 0;

        const c1X = currentX;
        const c1Y = startY - VERTICAL_SPACING / 2;
        const c2X = nextX;
        const c2Y = endY + VERTICAL_SPACING / 2;

        const d = `M ${currentX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${nextX} ${endY}`;

        return (
            <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
                <Svg width={width} height={VERTICAL_SPACING} style={{ position: 'absolute', top: -VERTICAL_SPACING + NODE_SIZE / 2, left: 0 }}>
                    {/* Thick glow path */}
                    <Path d={d} stroke={biome.pathColor} strokeWidth="28" strokeLinecap="round" fill="none" />
                    {/* White dash center */}
                    <Path d={d} stroke="rgba(255,255,255,0.55)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray="4, 20" fill="none" />
                    {/* Bright dot highlights */}
                    <Path d={d} stroke={biome.dotColor} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray="1, 14" fill="none" />
                </Svg>
            </View>
        );
    };

    useEffect(() => {
        // Animate header in
        Animated.parallel([
            Animated.timing(headerFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(headerSlideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
            if (flatListRef.current) {
                const targetIndex = Math.max(0, progress.currentLevel - 1);
                flatListRef.current.scrollToIndex({ index: targetIndex, animated: true, viewPosition: 0.5 });
            }
        }, 600);
    }, [progress.currentLevel]);

    const renderItem = ({ item, index }: { item: number; index: number }) => {
        const isCompleted = progress.completedLevels.includes(item);
        const isLocked = item > progress.currentLevel;
        const x = getLevelPositionX(index);

        const zoneIndex = Math.floor((item - 1) / 20);
        const biome = BIOMES[zoneIndex % BIOMES.length];
        const BiomeIcon = biome.icon;

        // Decorative icons alternate sides
        const isLeftCurve = x < width / 2 - NODE_SIZE / 2;
        const decorX = isLeftCurve ? width - 80 : 16;
        const showDecor = index % 4 === 2 && index !== 0;
        const showMilestone = item % 10 === 0; // Every 10th level gets a star milestone

        return (
            <View style={{ height: VERTICAL_SPACING, width, backgroundColor: 'transparent', zIndex: index }}>
                {renderPathSegment(index, biome)}

                {/* Biome decorative icon */}
                {showDecor && (
                    <View style={{ position: 'absolute', left: decorX, top: VERTICAL_SPACING / 3, zIndex: 2 }}>
                        <View style={[styles.decorIconBg, { backgroundColor: `${biome.accentColor}22` }]}>
                            <BiomeIcon size={32} color={biome.iconColor} strokeWidth={1.5} />
                        </View>
                    </View>
                )}

                {/* Milestone ring for every 10th level */}
                {showMilestone && !isLocked && (
                    <View style={[styles.milestoneRing, {
                        left: x - 6,
                        top: -6,
                        borderColor: biome.accentColor,
                        shadowColor: biome.accentColor,
                        zIndex: 3,
                    }]} />
                )}

                <View style={[styles.nodeWrapper, { left: x, top: 0, zIndex: 10 }]}>
                    <LevelCard
                        level={item}
                        isLocked={isLocked}
                        isCompleted={isCompleted}
                        onPress={() => router.push(`/game?id=${item}`)}
                        biomeAccent={biome.accentColor}
                        biomeNodeGrad={biome.nodeGrad}
                        biomeNodeShadow={biome.nodeShadow}
                    />
                </View>
            </View>
        );
    };

    // Current zone for header
    const currentZoneIndex = Math.floor((progress.currentLevel - 1) / 20);
    const currentBiome = BIOMES[currentZoneIndex % BIOMES.length];

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
            {/* Consistent dark wood overlay - no more biome-color tint */}
            <View style={styles.woodOverlay} />

            <FlatList
                ref={flatListRef}
                data={levels}
                keyExtractor={(item) => item.toString()}
                renderItem={renderItem}
                inverted
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: 160 }]}
                getItemLayout={(data, index) => ({
                    length: VERTICAL_SPACING,
                    offset: VERTICAL_SPACING * index,
                    index,
                })}
                initialScrollIndex={Math.max(0, progress.currentLevel - 1)}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    }, 500);
                }}
            />

            {/* Floating Header with wood style */}
            <Animated.View style={[styles.headerContainer, {
                opacity: headerFadeAnim,
                transform: [{ translateY: headerSlideAnim }]
            }]}>
                <LinearGradient
                    colors={['#8B4F1E', '#7A3F10', 'rgba(80, 40, 10, 0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Wood edge shimmer */}
                <View style={styles.headerShine} />

                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                    >
                        <ArrowLeft size={22} color="#FFD864" strokeWidth={2.5} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Text style={styles.biomeEmoji}>{currentBiome.badge}</Text>
                        <View>
                            <Text style={styles.headerTitle}>Journey Map</Text>
                            <Text style={[styles.biomeName, { color: currentBiome.accentColor }]}>
                                {currentBiome.name}
                            </Text>
                        </View>
                    </View>

                    {/* Level progress chip */}
                    <View style={[styles.levelChip, { borderColor: currentBiome.accentColor }]}>
                        <Text style={[styles.levelChipNum, { color: currentBiome.accentColor }]}>
                            {progress.currentLevel}
                        </Text>
                        <Text style={styles.levelChipLabel}> / {totalLevels}</Text>
                    </View>
                </View>

                {/* Mini progress bar */}
                <View style={styles.miniProgressBg}>
                    <View style={[styles.miniProgressFill, {
                        width: `${(progress.currentLevel / totalLevels) * 100}%`,
                        backgroundColor: currentBiome.accentColor,
                    }]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A1200',
    },
    woodOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 5, 0, 0.55)',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 52,
        paddingHorizontal: 16,
        paddingBottom: 12,
        overflow: 'hidden',
    },
    headerShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1.5,
        backgroundColor: 'rgba(255, 220, 160, 0.3)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,216,100,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonPressed: {
        transform: [{ scale: 0.9 }],
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    biomeEmoji: {
        fontSize: 32,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#F5DEB3',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    biomeName: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    levelChip: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    levelChipNum: {
        fontSize: 18,
        fontWeight: '900',
    },
    levelChipLabel: {
        fontSize: 11,
        color: '#F5DEB3',
        fontWeight: '600',
        opacity: 0.75,
    },
    miniProgressBg: {
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 2,
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    nodeWrapper: {
        position: 'absolute',
        width: NODE_SIZE,
        height: NODE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    decorIconBg: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    milestoneRing: {
        position: 'absolute',
        width: NODE_SIZE + 12,
        height: NODE_SIZE + 12,
        borderRadius: (NODE_SIZE + 12) / 2,
        borderWidth: 3,
        borderStyle: 'dashed',
        shadowOpacity: 0.5,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 5,
    },
});
