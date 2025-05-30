// stores/usePromptEditorStore.ts
import { create } from 'zustand';
import { Prompt } from '../types/prompt';

type PromptEditorState = {
    editingPrompt: Prompt | null;
    editId: string | null;
    autoRun: boolean;

    setEditingPrompt: (prompt: Prompt, options?: { autoRun?: boolean }) => void;
    clearEditingPrompt: () => void;

    variableInsertTarget: string | null;
    setVariableInsertTarget: (target: string | null) => void;
};

export const usePromptEditorStore = create<PromptEditorState>((set) => ({
    editingPrompt: null,
    editId: null,
    autoRun: false,

    setEditingPrompt: (prompt, options = {}) =>
        set({
            editingPrompt: prompt,
            editId: prompt.id,
            autoRun: options.autoRun ?? false,
        }),

    clearEditingPrompt: () =>
        set({
            editingPrompt: null,
            editId: null,
            autoRun: false,
            variableInsertTarget: null, // reset this too when clearing
        }),

    variableInsertTarget: null,

    setVariableInsertTarget: (target) => set({ variableInsertTarget: target }),
}));
