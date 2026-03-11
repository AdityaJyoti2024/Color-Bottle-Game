import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Modal, TextInput, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Star as StarIcon, Trophy, Coins, Settings, Bell, CircleHelp, Edit3, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { progress, updateProgress } = useGame();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(progress.username);
    const [editAvatar, setEditAvatar] = useState(progress.avatar);

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
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                    <ArrowLeft size={24} color="#4A6CF7" />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
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

                {/* Settings Menu Options */}
                <Animated.View style={[styles.menuSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                        <View style={[styles.menuIconBg, { backgroundColor: '#F3F4F6' }]}>
                            <Settings size={20} color="#4B5563" />
                        </View>
                        <Text style={styles.menuText}>App Settings</Text>
                        <ArrowLeft size={16} color="#9CA3AF" style={styles.arrowRotated} />
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                        <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
                            <Bell size={20} color="#D97706" />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <ArrowLeft size={16} color="#9CA3AF" style={styles.arrowRotated} />
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.menuItem, styles.menuItemLast, pressed && styles.menuItemPressed]}>
                        <View style={[styles.menuIconBg, { backgroundColor: '#DBEAFE' }]}>
                            <CircleHelp size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.menuText}>Help & Support</Text>
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
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
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
        color: '#4A6CF7',
    },
    spacer: {
        width: 48,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    userCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 32,
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    avatarGradient: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    menuSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemPressed: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    arrowRotated: {
        transform: [{ rotate: '180deg' }],
    },
    editButtonOuter: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 20,
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
