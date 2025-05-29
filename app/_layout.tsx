import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider'; // adjust path

export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack />
        </ThemeProvider>
    );
}
