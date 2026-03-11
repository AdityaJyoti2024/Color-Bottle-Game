import { Audio } from 'expo-av';

class SoundManager {
    private sounds: { [key: string]: Audio.Sound } = {};

    async init() {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });
    }

    async play(type: 'pour' | 'win' | 'click' | 'error') {
        try {
            // In a real app we'd load local assets like require('../assets/sounds/pour.mp3')
            // For this prototype, we'll try to use reliable public remote URLs 
            // or silent fails if we don't have local assets yet.

            const soundUrls = {
                pour: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7322300095.mp3?filename=water-pouring-6075.mp3',
                win: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3',
                click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8f8faef.mp3?filename=pop-39222.mp3',
                error: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_349dcc8429.mp3?filename=error-126627.mp3',
            };

            if (!soundUrls[type]) return;

            const { sound } = await Audio.Sound.createAsync(
                { uri: soundUrls[type] },
                { shouldPlay: true }
            );

            this.sounds[type] = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }

    async unloadAll() {
        for (const key in this.sounds) {
            await this.sounds[key].unloadAsync();
        }
    }
}

export const soundManager = new SoundManager();
