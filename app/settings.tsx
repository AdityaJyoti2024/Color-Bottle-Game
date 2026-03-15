import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, ImageBackground, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, Bell, CircleHelp, ShieldAlert, FileText, ChevronRight, Palette, Star, Mail, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { CountryPickerModal } from '../components/CountryPickerModal';

export default function SettingsScreen() {
    const router = useRouter();
    const { progress, setCountry } = useGame();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const toggleSound = () => setSoundEnabled(prev => !prev);
    const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.error("Don't know how to open URI: " + url);
            }
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    const handlePrivacyPolicy = () => {
        openLink('https://github.com/AdityaJyoti2002/Privacy-Policy/blob/main/Privacy.md');
    };

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            {/* Dark wood overlay */}
            <View style={styles.darkOverlay} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                    <ArrowLeft size={22} color="#FFD864" strokeWidth={2.5} />
                </Pressable>
                <Text style={styles.headerTitle}>⚙️  SETTINGS</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Preferences */}
                <Text style={styles.sectionHeader}>Preferences</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#E0E7FF' }]}>
                                <Volume2 size={20} color="#4F46E5" />
                            </View>
                            <Text style={styles.rowText}>Sound Effects</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: '#4A6CF7' }}
                            thumbColor="#FFFFFF"
                            onValueChange={toggleSound}
                            value={soundEnabled}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
                                <Bell size={20} color="#D97706" />
                            </View>
                            <Text style={styles.rowText}>Daily Notifications</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: '#4A6CF7' }}
                            thumbColor="#FFFFFF"
                            onValueChange={toggleNotifications}
                            value={notificationsEnabled}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#DCFCE7' }]}>
                                <Globe size={20} color="#16A34A" />
                            </View>
                            <View>
                                <Text style={styles.rowText}>Ad Region</Text>
                                <Text style={styles.rowSubtext}>{progress.country || 'Not Set'}</Text>
                            </View>
                        </View>
                        <Pressable 
                            style={styles.changeBtn}
                            onPress={() => setShowCountryPicker(true)}
                        >
                            <Text style={styles.changeBtnText}>Change</Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <Pressable 
                        style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
                        onPress={() => openLink('https://forms.gle/zaJhbCH693y38nFy9')}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
                                <Star size={20} color="#D97706" />
                            </View>
                            <Text style={styles.rowText}>⭐ Give Feedback</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>
                </View>

                {/* Support & Links */}
                <Text style={styles.sectionHeader}>Support</Text>
                <View style={styles.card}>
                    <View style={styles.supportHeader}>
                        <Mail size={20} color="#FFD864" style={{ marginRight: 10 }} />
                        <Text style={styles.supportTitle}>📩 Contact Support</Text>
                    </View>
                    <View style={styles.supportBody}>
                        <Text style={styles.supportText}>Still need help?</Text>
                        <Text style={styles.supportSubtext}>You can contact us anytime.</Text>
                        <Pressable 
                            onPress={() => openLink('mailto:adityajyotisri24@gmail.com')}
                            style={styles.emailContainer}
                        >
                            <Text style={styles.emailText}>Email: adityajyotisri24@gmail.com</Text>
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    <Pressable 
                        style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
                        onPress={handlePrivacyPolicy}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
                                <ShieldAlert size={20} color="#EF4444" />
                            </View>
                            <Text style={styles.rowText}>Privacy Policy</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>
                </View>

                {/* Footer text */}
                <Text style={styles.versionText}>Color Bottle Game v1.0.0</Text>

            </ScrollView>

            <CountryPickerModal 
                visible={showCountryPicker}
                onSelect={(country) => {
                    setCountry(country);
                    setShowCountryPicker(false);
                }}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 5, 0, 0.52)',
    },
    container: {
        flex: 1,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: 'rgba(255,216,100,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonPressed: {
        transform: [{ scale: 0.9 }],
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#F5DEB3',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    spacer: {
        width: 44,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFD864',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
        marginLeft: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    card: {
        backgroundColor: 'rgba(139, 79, 30, 0.85)',
        borderRadius: 22,
        padding: 8,
        marginBottom: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255,220,160,0.25)',
        shadowColor: '#1A0500',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    navRowPressed: {
        backgroundColor: 'rgba(255,220,160,0.1)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    rowText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F5DEB3',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,220,160,0.15)',
        marginHorizontal: 16,
    },
    versionText: {
        textAlign: 'center',
        color: 'rgba(245,222,179,0.5)',
        fontSize: 13,
        marginTop: 16,
    },
    supportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    supportTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFD864',
    },
    supportBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    supportText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F5DEB3',
        marginBottom: 4,
    },
    supportSubtext: {
        fontSize: 13,
        color: '#F5DEB3',
        opacity: 0.7,
        marginBottom: 12,
    },
    emailContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,216,100,0.2)',
    },
    emailText: {
        color: '#FFD864',
        fontSize: 14,
        fontWeight: '600',
    },
    rowSubtext: {
        fontSize: 12,
        color: '#F5DEB3',
        opacity: 0.6,
        marginTop: 2,
    },
    changeBtn: {
        backgroundColor: 'rgba(255,216,100,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,216,100,0.3)',
    },
    changeBtnText: {
        color: '#FFD864',
        fontSize: 12,
        fontWeight: '700',
    },
});
