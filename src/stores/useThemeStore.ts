import { create } from 'zustand';

type ThemeState = {
    mode: 'light' | 'dark';
    toggle: () => void;
};


export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'light',
    toggle: () => set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        return { mode: newMode };
    }),

}));
