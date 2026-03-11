import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Lock, Coins } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { Bottle } from '../components/Bottle';

export default function ThemesScreen() {
    const router = useRouter();
    const { progress, setActiveTheme, unlockTheme } = useGame();

    const themes = [
        { id: 'glass', name: 'Classic Glass', cost: 0, desc: 'Clean, elegant test-tube glass.' },
        { id: 'ghost', name: 'Ghost White', cost: 20, desc: 'Ethereal pure white.' },
        { id: 'shadow', name: 'Shadow Black', cost: 40, desc: 'Pitch black void.' },
        { id: 'ruby', name: 'Ruby Red', cost: 60, desc: 'Deep crimson jewel tones.' },
        { id: 'sapphire', name: 'Sapphire Blue', cost: 80, desc: 'Rich ocean blue cuts.' },
        { id: 'emerald', name: 'Emerald Green', cost: 100, desc: 'Vibrant forest jewel.' },
        { id: 'amethyst', name: 'Amethyst', cost: 150, desc: 'Royal purple mystique.' },
        { id: 'bronze', name: 'Bronze Age', cost: 200, desc: 'Antique copper and bronze.' },
        { id: 'silver', name: 'Silver Bullet', cost: 250, desc: 'Polished chrome and silver.' },
        { id: 'dark', name: 'Obsidian Dark', cost: 300, desc: 'Smoked glass with matte finishes.' },
        { id: 'gold', name: 'Gold Rush', cost: 450, desc: 'Pure 24k gold reflective shine.' },
        { id: 'poison', name: 'Poison Dart', cost: 500, desc: 'Toxic green with dark undertones.' },
        { id: 'lava', name: 'Lava Flow', cost: 600, desc: 'Molten rock and magma glow.' },
        { id: 'crystal', name: 'Crystal Clear', cost: 800, desc: 'Diamond clear prismatic cuts.' },
        { id: 'neon', name: 'Cyber Neon', cost: 1000, desc: 'Vibrant neon outlines and dark matter.' }
    ];

    const mockBottle = {
        id: 999,
        colors: ['red', 'blue', 'green', 'yellow'],
        maxCapacity: 4
    } as any;

    const handleThemeSelect = (theme: typeof themes[0]) => {
        if (progress.activeTheme === theme.id) return;

        const isUnlocked = theme.cost === 0 || progress.unlockedThemes.includes(theme.id);

        if (isUnlocked) {
            setActiveTheme(theme.id);
        } else {
            if (progress.coins >= theme.cost) {
                Alert.alert(
                    "Unlock Theme",
                    `Do you want to unlock ${theme.name} for ${theme.cost} coins?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Unlock", onPress: () => unlockTheme(theme.id, theme.cost) }
                    ]
                );
            } else {
                Alert.alert("Not enough coins", `You need ${theme.cost} coins to unlock this theme. Keep playing levels to earn more!`);
            }
        }
    };

    return (
        <ImageBackground
            source={require('../assets/orange-wall-bg.jpg')}
            style={styles.container}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFF" />
                </Pressable>
                <Text style={styles.title}>Bottle Themes</Text>
                <View style={styles.coinBadge}>
                    <Coins size={18} color="#FFD84D" />
                    <Text style={styles.coinText}>{progress.coins}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {themes.map((theme) => {
                        // Restore legit unlocking constraints checking if user bought them
                        const isUnlocked = theme.cost === 0 || progress.unlockedThemes.includes(theme.id);
                        const isActive = progress.activeTheme === theme.id;

                        // Temporarily bypass ActiveTheme rendering just for preview purposes dynamically
                        const forceMockPreview = progress.activeTheme;

                        return (
                            <Pressable
                                key={theme.id}
                                style={[
                                    styles.themeCard,
                                    isActive && styles.themeCardActive,
                                    !isUnlocked && styles.themeCardLocked
                                ]}
                                onPress={() => handleThemeSelect(theme)}
                            >
                                <View style={styles.previewContainer}>
                                    <View style={styles.mockBottleWrapper}>
                                        <Bottle
                                            bottle={mockBottle}
                                            isSelected={false}
                                            onClick={() => { }}
                                            // Explicit override to block global active colors
                                            previewThemeId={theme.id}
                                            scaleOverride={0.7} // Scaled suitably for the new 160px height container
                                        />
                                    </View>
                                </View>

                                <View style={styles.infoContainer}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.themeName} numberOfLines={1} adjustsFontSizeToFit>{theme.name}</Text>
                                        {isActive && <Check size={16} color="#4DFF88" style={{ marginLeft: 4 }} />}
                                    </View>
                                    <Text style={styles.themeDesc}>{theme.desc}</Text>

                                    {!isUnlocked && (
                                        <View style={styles.costBadge}>
                                            <Lock size={14} color="#F87171" style={{ marginRight: 4 }} />
                                            <Coins size={14} color="#FFD84D" />
                                            <Text style={styles.costText}>{theme.cost}</Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    coinText: {
        color: '#FFD84D',
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    themeCard: {
        width: '48%', // Allow exactly 2 cards per row side by side
        flexDirection: 'column', // Stack Bottle on top of info text
        backgroundColor: 'rgba(0,0,0,0.6)', // Deepened contrast against the new wood background!
        borderRadius: 20,
        padding: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
    },
    themeCardActive: {
        borderColor: '#4A6CF7',
        backgroundColor: 'rgba(74, 108, 247, 0.1)',
    },
    themeCardLocked: {
        opacity: 0.8,
    },
    previewContainer: {
        width: '100%',
        height: 160,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    mockBottleWrapper: {
        transform: [{ scale: 1 }],
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    themeName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    themeDesc: {
        color: '#D1D5DB', // Brightened from 9CA3AF
        fontSize: 12,
        lineHeight: 16,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    costText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 2,
        fontSize: 12,
    },
});
