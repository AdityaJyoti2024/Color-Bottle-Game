import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Bottle } from '../components/Bottle';

export default function SplashScreen() {
    const router = useRouter();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Dot bounce animations
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Main Screen Fade-In
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800, // Smooth luxurious fade
            useNativeDriver: true,
        }).start();

        // Staggered Bouncing dots
        const createBounce = (anim: Animated.Value, delay: number) => {
            return Animated.sequence([
                Animated.delay(delay),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: -10,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.delay(400) // Pause at bottom before bouncing again
                    ])
                )
            ]);
        };

        createBounce(dot1Anim, 0).start();
        createBounce(dot2Anim, 150).start();
        createBounce(dot3Anim, 300).start();

        // Redirect to Home after 2.5 seconds (gives time to enjoy the animation)
        const timeout = setTimeout(() => {
            router.replace('/home');
        }, 2500);

        return () => clearTimeout(timeout);
    }, [fadeAnim, dot1Anim, dot2Anim, dot3Anim, router]);

    // Constructing a fake bottle specifically for the splash screen
    const splashBottle = {
        id: 0,
        colors: [
            // Using the requested colors matching the dots 
            // (Bottom to Top)
            'orange',
            'green',
            'blue'
        ],
        maxCapacity: 3
    } as any;

    return (
        <ImageBackground source={require('../assets/orange-wall-bg.jpg')} style={styles.container} resizeMode="cover">
            {/* Dark Vignette Overlay forcing focus to the center elements */}
            <View style={styles.vignetteOverlay} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

                {/* Physical Game Bottle using true rendering component */}
                <View style={styles.bottleContainer}>
                    <Bottle
                        bottle={splashBottle}
                        isSelected={false}
                        onClick={() => { }}
                        previewThemeId="glass" // Use the standard beautiful clean glass for the intro
                        scaleOverride={1.2} // Slightly larger for extreme clarity
                    />
                </View>

                {/* Main Brand Title */}
                <Text style={styles.titleText}>Bottle Puzzle</Text>

                {/* Loading Indicator Dots matched to the Bottle fluids */}
                <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.dot, { backgroundColor: '#3B82F6', transform: [{ translateY: dot1Anim }] }]} />
                    <Animated.View style={[styles.dot, { backgroundColor: '#10B981', transform: [{ translateY: dot2Anim }] }]} />
                    <Animated.View style={[styles.dot, { backgroundColor: '#F59E0B', transform: [{ translateY: dot3Anim }] }]} />
                </View>

            </Animated.View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vignetteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Darkens the background slightly so the bright bottle pops
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 24,
        zIndex: 10,
    },
    bottleContainer: {
        marginBottom: 30,
        height: 250, // Fixed height provides a stable base for the title to sit exactly beneath
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 42,
        fontWeight: '900', // Bold rounded visual weight
        color: '#5C4033', // Deep wood/brown text color 
        letterSpacing: 1,
        textShadowColor: 'rgba(255,255,255,0.4)', // Slight white outline shadow to un-muddy the brown from the background 
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        marginBottom: 60,
    },
    loadingContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    }
});
