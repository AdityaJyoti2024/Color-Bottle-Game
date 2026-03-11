import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BellRing, Gift, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsScreen() {
    const router = useRouter();

    const notifications = [
        {
            id: 1,
            title: 'Welcome to Color Bottle!',
            message: 'Thanks for playing. Enjoy solving the puzzles!',
            time: '2h ago',
            icon: <Gift size={24} color="#FFF" />,
            colors: ['#4A6CF7', '#B84DFF']
        },
        {
            id: 2,
            title: 'New Daily Puzzle',
            message: 'Your new daily challenge is ready. Earn 50 bonus coins!',
            time: '5h ago',
            icon: <BellRing size={24} color="#FFF" />,
            colors: ['#FF914D', '#FFD84D']
        },
        {
            id: 3,
            title: 'Level 10 Master',
            message: 'Congratulations on beating level 10! Keep it up.',
            time: '1d ago',
            icon: <Trophy size={24} color="#FFF" />,
            colors: ['#10B981', '#4DFF88']
        }
    ];

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
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {notifications.map((notif) => (
                    <View key={notif.id} style={styles.notificationCard}>
                        <LinearGradient
                            colors={notif.colors as [string, string]}
                            style={styles.iconContainer}
                        >
                            {notif.icon}
                        </LinearGradient>
                        <View style={styles.textContent}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>{notif.title}</Text>
                                <Text style={styles.time}>{notif.time}</Text>
                            </View>
                            <Text style={styles.message}>{notif.message}</Text>
                        </View>
                    </View>
                ))}
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
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    message: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
});
