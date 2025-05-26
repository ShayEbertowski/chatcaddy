// ✅ src/theme/ThemeProvider.tsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    theme: ColorSchemeName;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>('system');
    const [theme, setTheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    );

    useEffect(() => {
        const load = async () => {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                setMode(stored);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            if (mode === 'system') {
                setTheme((prev) =>
                    prev !== colorScheme ? colorScheme : prev
                );
            }
        });
        return () => listener.remove();
    }, [mode]);

    useEffect(() => {
        const next = mode === 'system' ? Appearance.getColorScheme() : mode;
        setTheme((prev) => (prev !== next ? next : prev));
    }, [mode]);

    const updateMode = async (newMode: ThemeMode) => {
        setMode(newMode);
        await AsyncStorage.setItem(STORAGE_KEY, newMode);
    };

    // ✅ Prevent re-renders by memoizing the context value
    const value = useMemo(
        () => ({ theme, mode, setMode: updateMode }),
        [theme, mode]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
};
