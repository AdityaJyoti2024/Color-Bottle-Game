import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Animated,
    ImageBackground,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Coins, ShoppingBag, Star, Check, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { Bottle } from '../components/Bottle';
import { RewardAdModal } from '../components/RewardAdModal';

// Real bottle themes (same as themes.tsx)
const BOTTLE_THEMES = [
    { id: 'glass',    name: 'Classic Glass',  cost: 0,    desc: 'Clean, elegant test-tube glass.' },
    { id: 'ghost',    name: 'Ghost White',    cost: 20,   desc: 'Ethereal pure white.' },
    { id: 'shadow',   name: 'Shadow Black',   cost: 40,   desc: 'Pitch black void.' },
    { id: 'ruby',     name: 'Ruby Red',       cost: 60,   desc: 'Deep crimson jewel tones.' },
    { id: 'sapphire', name: 'Sapphire Blue',  cost: 80,   desc: 'Rich ocean blue cuts.' },
    { id: 'emerald',  name: 'Emerald Green',  cost: 100,  desc: 'Vibrant forest jewel.' },
    { id: 'amethyst', name: 'Amethyst',       cost: 150,  desc: 'Royal purple mystique.' },
    { id: 'bronze',   name: 'Bronze Age',     cost: 200,  desc: 'Antique copper and bronze.' },
    { id: 'silver',   name: 'Silver Bullet',  cost: 250,  desc: 'Polished chrome and silver.' },
    { id: 'dark',     name: 'Obsidian Dark',  cost: 300,  desc: 'Smoked glass with matte finishes.' },
    { id: 'gold',     name: 'Gold Rush',      cost: 450,  desc: 'Pure 24k gold reflective shine.' },
    { id: 'poison',   name: 'Poison Dart',    cost: 500,  desc: 'Toxic green with dark undertones.' },
    { id: 'lava',     name: 'Lava Flow',      cost: 600,  desc: 'Molten rock and magma glow.' },
    { id: 'crystal',  name: 'Crystal Clear',  cost: 800,  desc: 'Diamond clear prismatic cuts.' },
    { id: 'neon',     name: 'Cyber Neon',     cost: 1000, desc: 'Vibrant neon outlines and dark matter.' },
];

const MOCK_BOTTLE = { id: 999, colors: ['red', 'blue', 'green', 'yellow'], maxCapacity: 4 } as any;

const BOOSTERS = [
    { id: 'hint',  boosterKey: 'hints' as const,        icon: '💡', name: 'Hint',         desc: 'Auto-makes the best move',  price: 30,  color: ['#FFD864', '#FFB800'] as const, shadow: '#AA7800', count: 3  },
    { id: 'skip',  boosterKey: 'skips' as const,        icon: '⏭️', name: 'Skip Level',   desc: 'Skip any difficult level',   price: 50,  color: ['#B84DFF', '#7A00CC'] as const, shadow: '#5A008A', count: 1  },
    { id: 'extra', boosterKey: 'extraBottles' as const,  icon: '🍾', name: 'Extra Bottle', desc: 'Add an empty bottle',        price: 40,  color: ['#4ECDC4', '#00A896'] as const, shadow: '#006860', count: 2  },
    { id: 'undo',  boosterKey: 'hints' as const,        icon: '↩️', name: 'Undo Pack',    desc: '10 unlimited undos',         price: 20,  color: ['#FF6B6B', '#CC3333'] as const, shadow: '#8A0000', count: 10 },
];

const COIN_PACKS = [] as any[]; 

export default function ShopScreen() {
    const router = useRouter();
    const { progress, spendCoins, setActiveTheme, unlockTheme, addBoosters } = useGame();
    const [activeTab, setActiveTab] = useState<'boosters' | 'coins' | 'themes'>('boosters');
    
    const [adConfig, setAdConfig] = useState<{
        visible: boolean;
        type: 'coins' | 'hint' | 'skip' | 'extraBottle';
        amount: number;
        videoSource: any;
    }>({
        visible: false,
        type: 'coins',
        amount: 50,
        videoSource: require('../assets/reel ads.mp4')
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleBuyBooster = (booster: typeof BOOSTERS[0]) => {
        if (progress.coins < booster.price) {
            Alert.alert('Not Enough Coins 🪙', `You need ${booster.price} coins. Visit the Coins tab to get more!`);
            return;
        }
        if (spendCoins(booster.price)) {
            // Actually add the booster to the player's inventory!
            addBoosters(booster.boosterKey, booster.count);
            Alert.alert(
                '✅ Purchased!',
                `You bought ${booster.count}x ${booster.name}!\nYou now have ${progress.boosters[booster.boosterKey] + booster.count} in stock.`
            );
        }
    };

    const handleThemeSelect = (theme: typeof BOTTLE_THEMES[0]) => {
        if (progress.activeTheme === theme.id) return;
        const isUnlocked = theme.cost === 0 || progress.unlockedThemes.includes(theme.id);
        if (isUnlocked) {
            setActiveTheme(theme.id);
            Alert.alert('🎨 Theme Applied!', `${theme.name} is now active!`);
        } else {
            if (progress.coins >= theme.cost) {
                Alert.alert(
                    'Unlock Theme',
                    `Unlock "${theme.name}" for ${theme.cost} coins?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Unlock 🎨', onPress: () => unlockTheme(theme.id, theme.cost) },
                    ]
                );
            } else {
                Alert.alert('Not Enough Coins 🪙', `You need ${theme.cost} coins to unlock this theme.`);
            }
        }
    };

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            <View style={styles.darkOverlay} />
            <LinearGradient
                colors={['rgba(40, 15, 0, 0.75)', 'rgba(20, 5, 0, 0.5)']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [styles.backBtn, pressed && { transform: [{ scale: 0.9 }] }]}
                    >
                        <ArrowLeft size={22} color="#FFD864" strokeWidth={2.5} />
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <ShoppingBag size={22} color="#FFD864" strokeWidth={2} />
                        <Text style={styles.headerTitle}>  SHOP</Text>
                    </View>

                    <View style={styles.coinsBadge}>
                        <Coins size={16} color="#FFD864" />
                        <Text style={styles.coinsText}>{progress.coins}</Text>
                    </View>
                </Animated.View>

                {/* Tab switcher */}
                <Animated.View style={[styles.tabRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {(['boosters', 'coins', 'themes'] as const).map(tab => (
                        <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
                            <LinearGradient
                                colors={activeTab === tab ? ['#C8854A', '#7A3F10'] : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.2)']}
                                style={styles.tabBtnGrad}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                    {tab === 'boosters' ? '⚡ Boosters' : tab === 'coins' ? '🪙 Coins' : '🎨 Themes'}
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    ))}
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* ─── BOOSTERS TAB ─── */}
                    {activeTab === 'boosters' && (
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <Text style={styles.sectionLabel}>⚡ Power-Ups & Boosters</Text>
                            <View style={styles.boosterGrid}>
                                {BOOSTERS.map(b => {
                                    // Show live stock count for this booster type
                                    const stockCount = b.boosterKey === 'hints' && b.id === 'hint'
                                        ? progress.boosters.hints
                                        : b.boosterKey === 'skips'
                                        ? progress.boosters.skips
                                        : b.boosterKey === 'extraBottles'
                                        ? progress.boosters.extraBottles
                                        : null;
                                    return (
                                    <Pressable
                                        key={b.id}
                                        onPress={() => handleBuyBooster(b)}
                                        style={({ pressed }) => [styles.boosterCard, pressed && { transform: [{ scale: 0.96 }] }]}
                                    >
                                        <View style={[styles.boosterCardShadow, { backgroundColor: b.shadow }]} />
                                        <LinearGradient colors={b.color} style={styles.boosterCardGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                            <Text style={styles.boosterEmoji}>{b.icon}</Text>
                                            {/* Stock badge */}
                                            {stockCount !== null && stockCount > 0 && (
                                                <View style={styles.boosterStockBadge}>
                                                    <Text style={styles.boosterStockText}>x{stockCount} owned</Text>
                                                </View>
                                            )}
                                            <Text style={styles.boosterName}>{b.name}</Text>
                                            <Text style={styles.boosterDesc}>{b.desc}</Text>
                                             <View style={styles.boosterPriceRow}>
                                                <Coins size={12} color="#FFF" />
                                                <Text style={styles.boosterPrice}> {b.price}</Text>
                                             </View>
                                        </LinearGradient>
                                    </Pressable>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                    {/* ─── COINS TAB ─── */}
                    {activeTab === 'coins' && (
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <Text style={styles.sectionLabel}>🪙 Get Coins</Text>
                            <View style={styles.freeCoinsRow}>
                                <Pressable 
                                    style={styles.freeCoinsCard} 
                                    onPress={() => setAdConfig({
                                        visible: true,
                                        type: 'coins',
                                        amount: 50,
                                        videoSource: require('../assets/reel ads.mp4')
                                    })}
                                >
                                    <LinearGradient colors={['#4ECDC4', '#00A896']} style={styles.freeCoinsGrad}>
                                        <Text style={styles.freeCoinsIcon}>📺</Text>
                                        <Text style={styles.freeCoinsLabel}>Watch Ad</Text>
                                        <View style={styles.boosterPriceRow}>
                                            <Coins size={12} color="#FFF" />
                                            <Text style={styles.boosterPrice}> +50</Text>
                                        </View>
                                    </LinearGradient>
                                </Pressable>
                                <Pressable 
                                    style={styles.freeCoinsCard} 
                                    onPress={() => setAdConfig({
                                        visible: true,
                                        type: 'hint',
                                        amount: 1,
                                        videoSource: require('../assets/600+ Ghibli Art Reels Bundle (1).mp4')
                                    })}
                                >
                                    <LinearGradient colors={['#FFD864', '#FFB800']} style={styles.freeCoinsGrad}>
                                        <Text style={styles.freeCoinsIcon}>💡</Text>
                                        <Text style={styles.freeCoinsLabel}>Free Hint</Text>
                                        <View style={styles.boosterPriceRow}>
                                            <Coins size={12} color="#FFF" />
                                            <Text style={styles.boosterPrice}> Watch Ad</Text>
                                        </View>
                                    </LinearGradient>
                                </Pressable>
                            </View>

                            {/* Purchase Coins section removed per user request */}
                        </Animated.View>
                    )}

                    {/* ─── THEMES TAB ─── */}
                    {activeTab === 'themes' && (
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <Text style={styles.sectionLabel}>🎨 Bottle Themes</Text>
                            <View style={styles.themeGrid}>
                                {BOTTLE_THEMES.map((theme) => {
                                    const isUnlocked = theme.cost === 0 || progress.unlockedThemes.includes(theme.id);
                                    const isActive = progress.activeTheme === theme.id;
                                    return (
                                        <Pressable
                                            key={theme.id}
                                            onPress={() => handleThemeSelect(theme)}
                                            style={({ pressed }) => [styles.themeCard, isActive && styles.themeCardActive, pressed && { transform: [{ scale: 0.96 }] }]}
                                        >
                                            {/* Active badge */}
                                            {isActive && (
                                                <View style={styles.activeBadge}>
                                                    <Check size={11} color="#003A1A" strokeWidth={3} />
                                                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                                </View>
                                            )}

                                            {/* Bottle preview using the real Bottle component */}
                                            <View style={styles.bottlePreview}>
                                                <Bottle
                                                    bottle={MOCK_BOTTLE}
                                                    isSelected={false}
                                                    onClick={() => {}}
                                                    previewThemeId={theme.id}
                                                    scaleOverride={0.55}
                                                />
                                            </View>

                                            <Text style={[styles.themeName, isActive && styles.themeNameActive]} numberOfLines={1} adjustsFontSizeToFit>
                                                {theme.name}
                                            </Text>
                                            <Text style={styles.themeDesc} numberOfLines={1}>{theme.desc}</Text>

                                            {isUnlocked ? (
                                                <View style={styles.ownedBadge}>
                                                    <Text style={styles.ownedText}>✓ OWNED</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.themePriceRow}>
                                                    <Lock size={11} color="#F87171" />
                                                    <Coins size={11} color="#FFD864" />
                                                    <Text style={styles.themePrice}> {theme.cost}</Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                </ScrollView>

                {/* Reward Ad Modal */}
                <RewardAdModal
                    visible={adConfig.visible}
                    rewardType={adConfig.type}
                    rewardAmount={adConfig.amount}
                    videoSource={adConfig.videoSource}
                    onClose={() => setAdConfig(prev => ({ ...prev, visible: false }))}
                />
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 5, 0, 0.45)' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    },
    backBtn: {
        width: 42, height: 42, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 13,
        borderWidth: 1.5, borderColor: 'rgba(255,216,100,0.3)', alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: {
        fontSize: 22, fontWeight: '900', color: '#F5DEB3', letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
    },
    coinsBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,216,100,0.4)', paddingHorizontal: 10, paddingVertical: 6,
    },
    coinsText: { color: '#FFD864', fontWeight: '900', fontSize: 15 },
    tabRow: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, gap: 8 },
    tabBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
    tabBtnGrad: { paddingVertical: 10, alignItems: 'center', borderRadius: 14 },
    tabText: { color: 'rgba(245,222,179,0.6)', fontWeight: '700', fontSize: 12, letterSpacing: 0.3 },
    tabTextActive: { color: '#FFD864' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
    sectionLabel: {
        color: '#F5DEB3', fontWeight: '800', fontSize: 15, letterSpacing: 0.5, marginBottom: 12, marginTop: 4,
        textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
    },

    // Boosters
    boosterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    boosterCard: { width: '47%', position: 'relative' },
    boosterCardShadow: { position: 'absolute', top: 5, left: 0, right: 0, height: '100%', borderRadius: 18 },
    boosterCardGrad: { borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
    boosterEmoji: { fontSize: 36, marginBottom: 4 },
    boosterCount: {
        position: 'absolute', top: 8, right: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '900', fontSize: 13,
        backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8,
    },
    boosterName: {
        color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5, marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    },
    boosterDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 10, textAlign: 'center', marginBottom: 10 },
    boosterPriceRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
    },
    boosterPrice: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    boosterStockBadge: {
        position: 'absolute', top: 6, left: 8,
        backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    boosterStockText: { color: '#4DFF88', fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },

    // Coins
    freeCoinsRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    freeCoinsCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
    freeCoinsGrad: { padding: 16, alignItems: 'center', gap: 4 },
    freeCoinsIcon: { fontSize: 32 },
    freeCoinsLabel: { color: '#FFF', fontWeight: '800', fontSize: 13 },
    coinPackCard: { marginBottom: 10, borderRadius: 18, position: 'relative' },
    coinPackGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,220,160,0.2)',
    },
    coinPackLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    coinPackEmoji: { fontSize: 32 },
    coinPackAmount: { color: '#F5DEB3', fontWeight: '900', fontSize: 16 },
    coinPackBonus: { color: '#FFD864', fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
    coinPackPriceBtn: { backgroundColor: '#FFD864', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
    coinPackPrice: { color: '#3A1500', fontWeight: '900', fontSize: 15 },
    popularBadge: {
        flexDirection: 'row', alignItems: 'center', position: 'absolute', top: -10, right: 16,
        backgroundColor: '#FFD864', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, zIndex: 10,
    },
    popularText: { color: '#3A1500', fontWeight: '900', fontSize: 9, letterSpacing: 0.5 },

    // Themes
    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    themeCard: {
        width: '47%', position: 'relative', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
        padding: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', overflow: 'hidden',
    },
    themeCardActive: { borderColor: '#FFD864', backgroundColor: 'rgba(200,133,74,0.25)' },
    activeBadge: {
        position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#4DFF88', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, zIndex: 10,
    },
    activeBadgeText: { color: '#003A1A', fontWeight: '900', fontSize: 8, letterSpacing: 0.5 },
    bottlePreview: { width: '100%', height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 },
    themeName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 2 },
    themeNameActive: { color: '#FFD864' },
    themeDesc: { color: 'rgba(245,222,179,0.6)', fontSize: 10, textAlign: 'center', marginBottom: 6 },
    themePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    themePrice: { color: '#FFD864', fontWeight: '800', fontSize: 12 },
    ownedBadge: { backgroundColor: '#4DFF88', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    ownedText: { color: '#003A1A', fontWeight: '900', fontSize: 10, letterSpacing: 0.5 },
});
