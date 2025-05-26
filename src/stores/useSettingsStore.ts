import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsState = {
    confirmPromptDelete: boolean;
    setConfirmPromptDelete: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            confirmPromptDelete: true,
            setConfirmPromptDelete: (value) => set({ confirmPromptDelete: value }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
