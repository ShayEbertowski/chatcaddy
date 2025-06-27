// stores/useRefreshStore.ts
import { create } from 'zustand';

type RefreshState = {
    promptVersion: number;
    bumpPromptVersion: () => void;
};

export const useRefreshStore = create<RefreshState>((set) => ({
    promptVersion: 0,
    bumpPromptVersion: () => set((s) => ({ promptVersion: s.promptVersion + 1 })),
}));

