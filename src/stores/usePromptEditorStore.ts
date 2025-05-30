import { create } from 'zustand';
import { Prompt } from '../types/prompt';

// ✅ Add EntityType type
type EntityType = 'Prompt' | 'Function' | 'Snippet';

type PromptEditorState = {
    editingPrompt: Prompt | null;
    editId: string | null;
    autoRun: boolean;
    entityType: EntityType;  // ✅ NEW

    setEditingPrompt: (prompt: Prompt, options?: { autoRun?: boolean; entityType?: EntityType }) => void;
    clearEditingPrompt: () => void;

    variableInsertTarget: string | null;
    setVariableInsertTarget: (target: string | null) => void;

    resetEditor: () => void;
    setEntityType: (type: EntityType) => void;  // ✅ NEW
};

export const usePromptEditorStore = create<PromptEditorState>((set) => ({
    editingPrompt: null,
    editId: null,
    autoRun: false,
    entityType: 'Prompt',  // ✅ Default to 'Prompt'

    setEditingPrompt: (prompt, options = {}) =>
        set({
            editingPrompt: prompt,
            editId: prompt.id,
            autoRun: options.autoRun ?? false,
            entityType: options.entityType ?? 'Prompt',
        }),

    clearEditingPrompt: () =>
        set({
            editingPrompt: null,
            editId: null,
            autoRun: false,
            entityType: 'Prompt',
            variableInsertTarget: null,
        }),

    variableInsertTarget: null,

    setVariableInsertTarget: (target) => set({ variableInsertTarget: target }),

    resetEditor: () =>
        set({
            editingPrompt: null,
            editId: null,
            autoRun: false,
            entityType: 'Prompt',
            variableInsertTarget: null,
        }),

    setEntityType: (type) => set({ entityType: type }),
}));
