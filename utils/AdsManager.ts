import { Platform, Alert } from 'react-native';

/**
 * Unity Ads Configuration
 */
const CONFIG = {
    testMode: __DEV__, // Automatically use test mode in development
    platforms: {
        android: {
            gameId: '6064050',
            rewardedUnit: 'Rewarded_Android',
            interstitialUnit: 'Interstitial_Android',
        },
        ios: {
            gameId: '6064051',
            rewardedUnit: 'Rewarded_iOS',
            interstitialUnit: 'Interstitial_iOS',
        },
    },
};

type RewardType = 'skip' | 'extraBottle' | 'doubleReward' | 'mystery';

class AdsManager {
    private initialized = false;
    private adCount = 0; // For frequency control (interstitial every 3 levels)

    /**
     * Get platform-specific configuration
     */
    private getPlatformConfig() {
        return Platform.OS === 'ios' ? CONFIG.platforms.ios : CONFIG.platforms.android;
    }

    /**
     * Initialize Unity Ads
     */
    public async initializeAds() {
        if (this.initialized) return;

        const { gameId } = this.getPlatformConfig();

        console.log(`[AdsManager] Initializing Unity Ads for ${Platform.OS} with Game ID: ${gameId}`);
        
        try {
            // Note: Replace this with the actual Unity Ads library initialization when available
            // Example: await UnityAds.initialize(gameId, CONFIG.testMode);
            
            console.log('[AdsManager] Unity Ads Initialized Successfully');
            this.initialized = true;
        } catch (error) {
            console.error('[AdsManager] Initialization failed:', error);
        }
    }

    /**
     * Show a rewarded ad
     * @param rewardType The type of reward being requested
     * @param onComplete Callback function when the ad is finished and player should be rewarded
     */
    public async showRewardedAd(rewardType: RewardType, onComplete: () => void) {
        console.log(`[AdsManager] Requesting Rewarded Ad for: ${rewardType}`);

        const { rewardedUnit } = this.getPlatformConfig();

        // Check if ad is ready (Mocked for now)
        const isReady = true; 

        if (isReady) {
            // Simulate Ad Flow
            Alert.alert(
                "Watch Video",
                "Watch a short video to get your reward!",
                [
                    { 
                        text: "Cancel", 
                        style: "cancel",
                        onPress: () => console.log('[AdsManager] User cancelled ad')
                    },
                    { 
                        text: "Watch Ad", 
                        onPress: async () => {
                            console.log(`[AdsManager] Showing Rewarded Ad: ${rewardedUnit}`);
                            
                            // Mocking ad viewing time
                            setTimeout(() => {
                                console.log('[AdsManager] Ad completed. Distributing reward.');
                                onComplete();
                            }, 1000);
                        }
                    }
                ]
            );
        } else {
            console.warn('[AdsManager] Rewarded Ad not ready');
            Alert.alert("Ad Not Ready", "Please try again in a few moments.");
        }
    }

    /**
     * Show an interstitial ad (e.g., after level completion)
     */
    public async showInterstitialAd() {
        this.adCount++;
        
        // Show every 3 levels
        if (this.adCount % 3 !== 0) {
            console.log(`[AdsManager] Skipping interstitial. Level count: ${this.adCount} (Next ad at 3)`);
            return;
        }

        console.log('[AdsManager] Showing Interstitial Ad');
        const { interstitialUnit } = this.getPlatformConfig();

        // Simulate Ad (Mocked for now)
        console.log(`[AdsManager] Triggering Interstitial: ${interstitialUnit}`);
        
        // Here you would call: await UnityAds.showInterstitial(interstitialUnit);
    }
}

export const adsManager = new AdsManager();
