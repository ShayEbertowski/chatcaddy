import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeStore {
    mode: 'light' | 'dark';
    initialized: boolean;
    setMode: (mode: 'light' | 'dark') => void;
    hydrate: () => Promise<void>;
    toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    mode: 'light',
    initialized: false,

    setMode: (mode) => {
        set({ mode });
        AsyncStorage.setItem('theme', mode);
    },

    toggle: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        AsyncStorage.setItem('theme', newMode);
    },

    hydrate: async () => {
        const storedMode = await AsyncStorage.getItem('theme');
        set({
            mode: (storedMode as 'light' | 'dark') ?? 'light',
            initialized: true,
        });
    },
}));
