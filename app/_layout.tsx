import { Drawer } from 'expo-router/drawer';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, ThemeProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { useColors } from '../src/hooks/useColors';
import { useThemeStore } from '../src/stores/useThemeStore';
import { CustomDrawerContent } from './(drawer)/_layout';

export default function DrawerLayout() {
    const colors = useColors();
    const isDark = colors.isDark;

    useEffect(() => {
        useThemeStore.getState().hydrate();
    }, []);

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
                        <Drawer
                            drawerContent={(props) => <CustomDrawerContent {...props} />}
                            screenOptions={{ headerShown: false }}
                        />
                    </View>
                </ThemeProvider>
            </SafeAreaProvider>
        </PaperProvider>
    );
}
