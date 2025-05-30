import { create } from 'zustand';
import { PromptFunction } from '../types/functions';

type FunctionEditorState = {
    editingFunction: PromptFunction | null;
    editId: string | null;

    setEditingFunction: (func: PromptFunction) => void;
    clearEditingFunction: () => void;
    resetEditor: () => void;
};

export const useFunctionEditorStore = create<FunctionEditorState>((set) => ({
    editingFunction: null,
    editId: null,

    setEditingFunction: (func) =>
        set({
            editingFunction: func,
            editId: func.id,
        }),

    clearEditingFunction: () =>
        set({
            editingFunction: null,
            editId: null,
        }),

    resetEditor: () =>
        set({
            editingFunction: null,
            editId: null,
        }),
}));
