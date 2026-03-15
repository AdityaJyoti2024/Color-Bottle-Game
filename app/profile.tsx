import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Modal, TextInput, ImageBackground, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Star as StarIcon, Trophy, Coins, Settings, Bell, CircleHelp, Edit3, X, Mail, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { progress, updateProgress } = useGame();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(progress.username);
    const [editAvatar, setEditAvatar] = useState(progress.avatar);

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

    const AVATARS = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐸', '🐵', '🦄', '🦇', '🦉'];

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

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
                <Text style={styles.headerTitle}>👤  PROFILE</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* User Card */}
                <Animated.View style={[styles.userCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Pressable style={styles.editButtonOuter} onPress={() => setIsEditing(true)}>
                        <Edit3 size={20} color="#4A6CF7" />
                    </Pressable>

                    <LinearGradient
                        colors={['#4A6CF7', '#B84DFF']}
                        style={styles.avatarGradient}
                    >
                        {progress.avatar && progress.avatar.length <= 2 ? (
                            <Text style={{ fontSize: 44 }}>{progress.avatar}</Text>
                        ) : (
                            <User size={48} color="#FFF" />
                        )}
                    </LinearGradient>
                    <Text style={styles.userName}>{progress.username}</Text>
                    <Text style={styles.userSubtitle}>Puzzle Master</Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {/* Stars */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
                            <StarIcon size={24} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Text style={styles.statValue}>{progress.stars || 0}</Text>
                        <Text style={styles.statLabel}>Total Stars</Text>
                    </View>

                    {/* Coins */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconBg, { backgroundColor: '#FEE2E2' }]}>
                            <Coins size={24} color="#EF4444" />
                        </View>
                        <Text style={styles.statValue}>{progress.coins}</Text>
                        <Text style={styles.statLabel}>Coins</Text>
                    </View>

                    {/* Levels */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconBg, { backgroundColor: '#E0E7FF' }]}>
                            <Trophy size={24} color="#4F46E5" />
                        </View>
                        <Text style={styles.statValue}>{progress.completedLevels.length}</Text>
                        <Text style={styles.statLabel}>Levels Won</Text>
                    </View>
                </Animated.View>

                {/* Menu Options */}
                <Animated.View style={[styles.menuSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.sectionTitle}>Options</Text>

                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                        onPress={() => openLink('https://forms.gle/zaJhbCH693y38nFy9')}
                    >
                        <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
                            <Star size={20} color="#D97706" />
                        </View>
                        <Text style={styles.menuText}>⭐ Give Feedback</Text>
                        <ArrowLeft size={16} color="#9CA3AF" style={styles.arrowRotated} />
                    </Pressable>

                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, styles.menuItemLast, pressed && styles.menuItemPressed]}
                        onPress={() => openLink('mailto:adityajyotisri24@gmail.com')}
                    >
                        <View style={[styles.menuIconBg, { backgroundColor: '#DBEAFE' }]}>
                            <Mail size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.menuText}>📩 Contact Support</Text>
                        <ArrowLeft size={16} color="#9CA3AF" style={styles.arrowRotated} />
                    </Pressable>
                </Animated.View>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditing} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <Pressable onPress={() => setIsEditing(false)} style={styles.closeButton}>
                                <X size={24} color="#6B7280" />
                            </Pressable>
                        </View>

                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.textInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Enter username"
                            placeholderTextColor="#9CA3AF"
                            maxLength={15}
                        />

                        <Text style={styles.inputLabel}>Choose Avatar</Text>
                        <View style={styles.avatarGrid}>
                            {AVATARS.map((avatar, idx) => (
                                <Pressable
                                    key={idx}
                                    style={[styles.avatarOption, editAvatar === avatar && styles.avatarOptionSelected]}
                                    onPress={() => setEditAvatar(avatar)}
                                >
                                    <Text style={styles.avatarEmoji}>{avatar}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable
                            style={styles.saveButton}
                            onPress={() => {
                                updateProgress({ username: editName || 'Player', avatar: editAvatar });
                                setIsEditing(false);
                            }}
                        >
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 5, 0, 0.55)',
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
        marginBottom: 16,
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    userCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(139, 79, 30, 0.85)',
        padding: 28,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,220,160,0.25)',
        shadowColor: '#1A0500',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
    },
    avatarGradient: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    userName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#F5DEB3',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    userSubtitle: {
        fontSize: 13,
        color: '#FFD864',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(139, 79, 30, 0.8)',
        padding: 14,
        borderRadius: 18,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1.5,
        borderColor: 'rgba(255,220,160,0.2)',
        shadowColor: '#1A0500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFD864',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#F5DEB3',
        fontWeight: '600',
        opacity: 0.8,
    },
    menuSection: {
        backgroundColor: 'rgba(139, 79, 30, 0.85)',
        borderRadius: 22,
        padding: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,220,160,0.2)',
        shadowColor: '#1A0500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: '#FFD864',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,220,160,0.12)',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemPressed: {
        backgroundColor: 'rgba(255,220,160,0.1)',
        borderRadius: 12,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        color: '#F5DEB3',
        fontWeight: '600',
    },
    arrowRotated: {
        transform: [{ rotate: '180deg' }],
    },
    editButtonOuter: {
        position: 'absolute',
        top: 14,
        right: 14,
        backgroundColor: 'rgba(255,220,160,0.2)',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,220,160,0.3)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#111827',
        marginBottom: 24,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    avatarOption: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarOptionSelected: {
        borderColor: '#4A6CF7',
        backgroundColor: '#E0E7FF',
    },
    avatarEmoji: {
        fontSize: 28,
    },
    saveButton: {
        backgroundColor: '#4A6CF7',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
