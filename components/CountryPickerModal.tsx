import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface CountryPickerModalProps {
    visible: boolean;
    onSelect: (country: string) => void;
}

export function CountryPickerModal({ visible, onSelect }: CountryPickerModalProps) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(100));

    useEffect(() => {
        if (visible) {
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
        }
    }, [visible]);

    const handleSelect = (country: string) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => onSelect(country));
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                
                <Animated.View 
                    style={[
                        styles.content, 
                        { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Globe size={32} color="#FFD864" style={styles.icon} />
                        <Text style={styles.title}>Where are you playing from?</Text>
                        <Text style={styles.subtitle}>Help us customize your gaming experience</Text>
                    </View>

                    <View style={styles.options}>
                        <Pressable 
                            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                            onPress={() => handleSelect('India')}
                        >
                            <LinearGradient
                                colors={['#4A6CF7', '#3B82F6']}
                                style={styles.optionGrad}
                            >
                                <MapPin size={24} color="#FFF" />
                                <Text style={styles.optionText}>India 🇮🇳</Text>
                            </LinearGradient>
                        </Pressable>

                        <Pressable 
                            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                            onPress={() => handleSelect('International')}
                        >
                            <LinearGradient
                                colors={['#8B4F1E', '#7A3F10']}
                                style={styles.optionGrad}
                            >
                                <Globe size={24} color="#FFF" />
                                <Text style={styles.optionText}>International 🌎</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    content: {
        width: width * 0.9,
        backgroundColor: '#8B4F1E',
        borderRadius: 32,
        padding: 32,
        borderWidth: 2,
        borderColor: 'rgba(255,220,160,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFD864',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#F5DEB3',
        textAlign: 'center',
        opacity: 0.8,
    },
    options: {
        gap: 16,
    },
    option: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
    },
    optionGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    optionPressed: {
        transform: [{ scale: 0.98 }],
    },
    optionText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
