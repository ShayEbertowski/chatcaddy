import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import React, { useEffect } from 'react';
import { useThemeStore } from '../src/stores/useThemeStore';
import LoadingScreen from '../src/screens/LoadingScreen';
import { useColors } from '../src/hooks/useColors';

export default function RootLayout() {
    useEffect(() => {
        useAuthStore.getState().loadSession();
    }, []);

    const initialized = useThemeStore((s) => s.initialized);
    const colors = useColors();
    const isDark = colors.isDark;

    useEffect(() => {
        useThemeStore.getState().hydrate();
    }, []);

    if (!initialized) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                    <StatusBar
                        barStyle={isDark ? 'light-content' : 'dark-content'}
                        animated
                    />
                    <Stack screenOptions={{ headerShown: false }} />
                </View>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
