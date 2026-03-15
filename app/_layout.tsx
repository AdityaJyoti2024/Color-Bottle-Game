import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { GameProvider, useGame } from '../context/GameContext';
import { adsManager } from '../utils/AdsManager';
import { CountryPickerModal } from '../components/CountryPickerModal';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { progress, setCountry, isLoaded } = useGame();
  
  if (!isLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="levels" />
        <Stack.Screen name="game" />
        <Stack.Screen name="daily" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="themes" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="help" />
        <Stack.Screen name="notifications" />
      </Stack>

      <CountryPickerModal 
        visible={isLoaded && progress.country === undefined}
        onSelect={(country) => setCountry(country)}
      />
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Ads
        await adsManager.initializeAds();

        // Pre-load critical massive graphic assets before revealing UI globally
        await Asset.loadAsync([
          require('../assets/orange-wall-bg.jpg')
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
