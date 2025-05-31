import { Stack } from 'expo-router';
import { ThemeProvider, useThemeMode } from '../src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/useAuthStore';
import React, { useEffect } from 'react';
import { useThemeStore } from '../src/stores/useThemeStore';
import LoadingScreen from '../src/screens/LoadingScreen';

function ThemedStatusBar() {
    const { mode } = useThemeMode();
    return (
        <StatusBar
            style={mode === 'dark' ? 'light' : 'dark'}
            backgroundColor="transparent"
            translucent
        />
    );
}

export default function RootLayout() {
    useEffect(() => {
        useAuthStore.getState().loadSession();
    }, []);

    const initialized = useThemeStore((s) => s.initialized);

    useEffect(() => {
        useThemeStore.getState().hydrate();
    }, []);

    if (!initialized) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ThemedStatusBar />
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
