// ✅ src/theme/ThemeProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
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
                setTheme(colorScheme);
            }
        });
        return () => listener.remove();
    }, [mode]);

    useEffect(() => {
        setTheme(mode === 'system' ? Appearance.getColorScheme() : mode);
    }, [mode]);

    const updateMode = async (newMode: ThemeMode) => {
        setMode(newMode);
        await AsyncStorage.setItem(STORAGE_KEY, newMode);
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode: updateMode }}>
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
