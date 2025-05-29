import { Stack } from 'expo-router';
import { ThemeProvider, useThemeMode } from '../src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ThemedStatusBar />
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
