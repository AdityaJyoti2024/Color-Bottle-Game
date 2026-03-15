import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Dimensions,
    Animated,
    ActivityIndicator,
    SafeAreaView,
    Image,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { X, CheckCircle2, ChevronRight, Gift, Sparkles, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useGame } from '../context/GameContext';
import { ExternalLink, ShoppingCart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const END_CARD_IMAGES = [
    require('../assets/1.png'),
    require('../assets/2.png'),
    require('../assets/3.png'),
];

interface RewardAdModalProps {
    visible: boolean;
    onClose: () => void;
    rewardType: 'coins' | 'hint' | 'skip' | 'extraBottle';
    rewardAmount: number;
    videoSource: any; // local require or uri
}

export function RewardAdModal({ visible, onClose, rewardType, rewardAmount, videoSource }: RewardAdModalProps) {
    const { addCoins, addBoosters, progress: progressData } = useGame();

    const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
    const [phase, setPhase] = useState<'video' | 'end-card' | 'celebration'>('video');
    const [showCloseBtn, setShowCloseBtn] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isClaimed, setIsClaimed] = useState(false);
    const [randomImage] = useState(() => {
        if (progressData.country === 'International') return require('../assets/ads_1.webp');
        return END_CARD_IMAGES[Math.floor(Math.random() * END_CARD_IMAGES.length)];
    });
    const isInternational = progressData.country === 'International';

    const closeBtnOpacity = useRef(new Animated.Value(0)).current;
    const celebrationScale = useRef(new Animated.Value(0)).current;
    const celebrationRotate = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const endCardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset states
            setPhase('video');
            setShowCloseBtn(false);
            setProgress(0);
            setIsClaimed(false);
            closeBtnOpacity.setValue(0);
            celebrationScale.setValue(0);
            endCardOpacity.setValue(0);

            if (isInternational) {
                setPhase('end-card'); // Skip video for international finance ads
            }
        }
    }, [visible, isInternational]);

    useEffect(() => {
        if (phase === 'end-card') {
            // Fade in end card
            Animated.timing(endCardOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Show close button after 5 seconds of end card
            const timer = setTimeout(() => {
                setShowCloseBtn(true);
                Animated.timing(closeBtnOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'celebration') {
            Animated.parallel([
                Animated.spring(celebrationScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(floatAnim, { toValue: -15, duration: 1500, useNativeDriver: true }),
                        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
                    ])
                ),
                Animated.loop(
                    Animated.timing(celebrationRotate, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    })
                )
            ]).start();
        }
    }, [phase]);

    const handlePlaybackUpdate = (status: AVPlaybackStatus) => {
        setStatus(status);
        if (status.isLoaded) {
            const p = status.positionMillis / (status.durationMillis || 1);
            setProgress(p);
            if (status.didJustFinish) {
                setPhase('end-card');
            }
        }
    };

    const handleExternalLink = async () => {
        const url = 'https://aditya2002a.gumroad.com/l/PrinciplesofFinance';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    };

    const handleClaim = async () => {
        if (isClaimed) return;

        setIsClaimed(true);
        await handleExternalLink();

        // Add reward to game
        if (rewardType === 'coins') {
            addCoins(rewardAmount);
        } else {
            const boosterKey = rewardType === 'hint' ? 'hints' :
                rewardType === 'skip' ? 'skips' : 'extraBottles';
            addBoosters(boosterKey, rewardAmount);
        }

        // Move to celebration
        setPhase('celebration');
    };

    const spin = celebrationRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getRewardIcon = () => {
        switch (rewardType) {
            case 'coins': return '🪙';
            case 'hint': return '💡';
            case 'skip': return '⏭️';
            case 'extraBottle': return '🍾';
            default: return '🎁';
        }
    };

    const getRewardName = () => {
        switch (rewardType) {
            case 'coins': return 'Coins';
            case 'hint': return 'Hints';
            case 'skip': return 'Skip Level';
            case 'extraBottle': return 'Extra Bottle';
            default: return 'Reward';
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={['#000000', '#1A1A1A']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Always show Logo at top */}
                <View style={styles.logoHeader} pointerEvents="none">
                    <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
                </View>

                {phase === 'video' && (
                    <View style={styles.videoContent}>
                        <Video
                            source={videoSource}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={visible}
                            style={styles.video}
                            onPlaybackStatusUpdate={handlePlaybackUpdate}
                        />

                        {/* Top Overlay */}
                        <View style={styles.topOverlayVideo}>
                            <View style={styles.rewardLabelContainer}>
                                <Text style={styles.rewardLabelText}>Reward Ad – Watch to Unlock</Text>
                            </View>
                            {/* NO CLOSE BUTTON IN VIDEO PHASE */}
                        </View>

                        {/* Bottom Overlay */}
                        <View style={styles.bottomOverlay}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <View style={styles.statusContainer}>
                                <ActivityIndicator size="small" color="#FFD864" style={{ marginRight: 8 }} />
                                <Text style={styles.statusText}>Complete Watching to Continue</Text>
                            </View>
                        </View>
                    </View>
                )}

                {phase === 'end-card' && (
                    <Animated.View style={[styles.endCardContent, { opacity: endCardOpacity }]}>
                        <Image source={randomImage} style={styles.endCardImage} resizeMode="contain" />

                        {/* Close button - ONLY IN END-CARD PHASE after 5s */}
                        <View style={styles.topOverlayEndCard}>
                            <View style={{ flex: 1 }} />
                            {showCloseBtn && (
                                <Animated.View style={{ opacity: closeBtnOpacity }}>
                                    <Pressable onPress={onClose} style={styles.closeBtn}>
                                        <X size={24} color="#FFF" />
                                    </Pressable>
                                </Animated.View>
                            )}
                        </View>

                        {/* Download CTA Overlay */}
                        <View style={styles.endCardCallToAction}>
                            {isInternational ? (
                                <View style={styles.financeButtonsRow}>
                                    <Pressable
                                        onPress={handleClaim}
                                        style={({ pressed }) => [
                                            styles.financeBtn,
                                            { backgroundColor: '#4A6CF7' },
                                            pressed && { transform: [{ scale: 0.95 }] }
                                        ]}
                                    >
                                        <Download size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.financeBtnText}>DOWNLOAD</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleClaim}
                                        style={({ pressed }) => [
                                            styles.financeBtn,
                                            { backgroundColor: '#10B981' },
                                            pressed && { transform: [{ scale: 0.95 }] }
                                        ]}
                                    >
                                        <ExternalLink size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.financeBtnText}>VISIT NOW</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={handleClaim}
                                    style={({ pressed }) => [
                                        styles.downloadBtn,
                                        pressed && { transform: [{ scale: 0.95 }] }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['#FFD864', '#FFB800']}
                                        style={styles.downloadBtnGrad}
                                    >
                                        <Download size={22} color="#000" style={{ marginRight: 8 }} />
                                        <Text style={styles.downloadBtnText}>DOWNLOAD NOW</Text>
                                    </LinearGradient>
                                </Pressable>
                            )}
                        </View>
                    </Animated.View>
                )}

                {phase === 'celebration' && (
                    <Animated.View style={[styles.celebrationContent, { transform: [{ scale: celebrationScale }] }]}>
                        <View style={styles.glowContainer}>
                            <Animated.View style={[styles.glow, { transform: [{ rotate: spin }] }]}>
                                <LinearGradient
                                    colors={['rgba(255, 216, 100, 0)', 'rgba(255, 216, 100, 0.4)', 'rgba(255, 216, 100, 0)']}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated.View>
                        </View>

                        <Animated.View style={[styles.rewardIconContainer, { transform: [{ translateY: floatAnim }] }]}>
                            <Text style={styles.rewardEmoji}>{getRewardIcon()}</Text>
                            <View style={styles.rewardValueBadge}>
                                <Text style={styles.rewardValueText}>+{rewardAmount}</Text>
                            </View>
                        </Animated.View>

                        <Text style={styles.celebrationTitle}>CONGRATULATIONS!</Text>
                        <Text style={styles.celebrationSubtitle}>You've unlocked {rewardAmount} {getRewardName()}</Text>

                        <Pressable onPress={onClose} style={styles.doneBtn}>
                            <Text style={styles.doneBtnText}>CONTINUE</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    logoHeader: {
        position: 'absolute',
        top: 50,
        width: '100%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    logoImage: {
        width: 150,
        height: 50,
    },
    videoContent: {
        flex: 1,
    },
    video: {
        width: width,
        height: height,
        position: 'absolute',
    },
    topOverlayVideo: {
        position: 'absolute',
        top: 120, // below logo
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 10,
    },
    topOverlayEndCard: {
        position: 'absolute',
        top: 50, // level with logo but logo is center
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        flexDirection: 'row',
        zIndex: 101,
    },
    rewardLabelContainer: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#FFD864',
    },
    rewardLabelText: {
        color: '#FFD864',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD864',
        borderRadius: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    endCardContent: {
        flex: 1,
    },
    endCardImage: {
        width: width,
        height: height,
    },
    endCardCallToAction: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    downloadBtn: {
        width: '100%',
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        elevation: 15,
        shadowColor: '#FF9F00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    downloadBtnGrad: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadBtnText: {
        color: '#000',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1,
    },
    financeButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    financeBtn: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    financeBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    celebrationContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    glowContainer: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    glow: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    rewardIconContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    rewardEmoji: {
        fontSize: 110,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 5 },
        textShadowRadius: 15,
    },
    rewardValueBadge: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        backgroundColor: '#FFD864',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: '#000',
    },
    rewardValueText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 20,
    },
    celebrationTitle: {
        color: '#FFD864',
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    celebrationSubtitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.9,
    },
    doneBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFD864',
    },
    doneBtnText: {
        color: '#FFD864',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
});

