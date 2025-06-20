import '../shim';
import 'react-native-get-random-values';

import { Slot } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import React, { useEffect } from 'react';
import { useThemeStore } from '../src/stores/useThemeStore';
import LoadingScreen from '../src/screens/LoadingScreen';
import { useColors } from '../src/hooks/useColors';
import { useEntityStore } from '../src/stores/useEntityStore';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export default function RootLayout() {
    useEffect(() => {
        useAuthStore.getState().loadSession();
        useEntityStore.getState().loadEntities();
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

    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

    const paperTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: colors.primary,
            secondary: colors.accent,
            background: colors.background,
            surface: colors.surface || baseTheme.colors.surface,
            text: colors.text || baseTheme.colors.onSurface,
            onBackground: colors.text || baseTheme.colors.onBackground,
            onSurface: colors.text || baseTheme.colors.onSurface,
        },
    };

    return (
        <PaperProvider theme={paperTheme}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <View style={{ flex: 1, backgroundColor: colors.background }}>
                        <StatusBar
                            barStyle={isDark ? 'light-content' : 'dark-content'}
                            animated
                        />
                        <Slot />
                    </View>
                </ThemeProvider>
            </SafeAreaProvider>
        </PaperProvider>
    );
}
