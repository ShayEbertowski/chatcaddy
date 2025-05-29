// app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack
                screenOptions={{
                    headerShown: false, // ✅ This removes the "(drawer)" top-level header
                }}
            />
        </ThemeProvider>
    );
}
