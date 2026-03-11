import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleHelp, Droplet, Clock, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpScreen() {
    const router = useRouter();

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            <LinearGradient
                colors={['rgba(74, 108, 247, 0.1)', 'rgba(74, 108, 247, 0.05)', '#F5F7FF']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                    <ArrowLeft size={24} color="#4A6CF7" />
                </Pressable>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.illustrationContainer}>
                    <CircleHelp size={64} color="#4A6CF7" />
                </View>

                <Text style={styles.sectionTitle}>How to Play</Text>

                <View style={styles.card}>
                    <View style={styles.instructionRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                            <Droplet size={24} color="#4F46E5" />
                        </View>
                        <View style={styles.instructionText}>
                            <Text style={styles.instructionTitle}>Sort the Colors</Text>
                            <Text style={styles.instructionDesc}>Tap a bottle to select it, then tap another bottle to pour water. You can only pour water if the destination bottle is empty or has the exact same color on top.</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.instructionRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                            <Clock size={24} color="#EF4444" />
                        </View>
                        <View style={styles.instructionText}>
                            <Text style={styles.instructionTitle}>Watch the Timer</Text>
                            <Text style={styles.instructionDesc}>Standard & Daily challenges have time limits. Running out of time means you have to restart or spend coins to continue!</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.instructionRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                            <Search size={24} color="#D97706" />
                        </View>
                        <View style={styles.instructionText}>
                            <Text style={styles.instructionTitle}>Use Hints</Text>
                            <Text style={styles.instructionDesc}>Stuck? Tap the Hint button (lightbulb icon) to automatically reveal your next best move.</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Frequently Asked Questions</Text>

                <View style={styles.card}>
                    <Text style={styles.faqQ}>How do I get more coins?</Text>
                    <Text style={styles.faqA}>You earn coins by winning new levels and completing your Daily Puzzle challenge!</Text>

                    <View style={styles.divider} />

                    <Text style={styles.faqQ}>How do I change my Avatar or Username?</Text>
                    <Text style={styles.faqA}>Tap on your Profile from the Home or Settings menu, then hit the "Edit" pencil icon near your photo.</Text>

                    <View style={styles.divider} />

                    <Text style={styles.faqQ}>Is there a limit on Undos?</Text>
                    <Text style={styles.faqA}>No, you can undo as many consecutive moves as you desire without spending coins.</Text>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 12,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    spacer: {
        width: 48,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        marginLeft: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    instructionRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    instructionText: {
        flex: 1,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    instructionDesc: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    faqQ: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    faqA: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
});
