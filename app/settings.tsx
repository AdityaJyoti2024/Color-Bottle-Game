import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, Bell, CircleHelp, ShieldAlert, FileText, ChevronRight, Palette } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
    const router = useRouter();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleSound = () => setSoundEnabled(prev => !prev);
    const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

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
                <Text style={styles.headerTitle}>Settings</Text>
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

                    <Pressable
                        style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
                        onPress={() => router.push('/themes')}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#FCE7F3' }]}>
                                <Palette size={20} color="#EC4899" />
                            </View>
                            <Text style={styles.rowText}>Bottle Themes & Shop</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>
                </View>

                {/* Support & Links */}
                <Text style={styles.sectionHeader}>Support</Text>
                <View style={styles.card}>
                    <Pressable
                        style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
                        onPress={() => router.push('/notifications')}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#DBEAFE' }]}>
                                <Bell size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.rowText}>Notification Center</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>

                    <View style={styles.divider} />

                    <Pressable
                        style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
                        onPress={() => router.push('/help')}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#D1FAE5' }]}>
                                <CircleHelp size={20} color="#10B981" />
                            </View>
                            <Text style={styles.rowText}>Help & How to Play</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>

                    <View style={styles.divider} />

                    <Pressable style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#F3F4F6' }]}>
                                <FileText size={20} color="#4B5563" />
                            </View>
                            <Text style={styles.rowText}>Terms of Service</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </Pressable>

                    <View style={styles.divider} />

                    <Pressable style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}>
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
        marginBottom: 24,
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
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 8,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
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
        backgroundColor: '#F9FAFB',
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
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
    versionText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 16,
    },
});
