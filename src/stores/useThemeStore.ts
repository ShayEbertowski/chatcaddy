import { create } from 'zustand';

type ThemeState = {
    mode: 'light' | 'dark';
    toggle: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'light',
    toggle: () =>
        set((state) => ({
            mode: state.mode === 'light' ? 'dark' : 'light',
        })),
}));
