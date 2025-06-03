import { create } from 'zustand';
import { Prompt } from '../types/prompt';
import { PromptFunction } from '../types/functions';

// Entity is either a Prompt or a PromptFunction
type Entity = Prompt | PromptFunction;
type EntityType = 'Prompt' | 'Function' | 'Snippet';

type EditorState = {
    entityType: EntityType;
    editingEntity: Entity | null;
    editId: string | null;
    setEditId: (id: string | null) => void;
    autoRun: boolean;

    setEditingEntity: (entityType: EntityType, entity: Entity, options?: { autoRun?: boolean }) => void;
    clearEditingEntity: () => void;
    resetEditor: () => void;
    setEntityType: (type: EntityType) => void; // <-- 🚨 THIS LINE 🚨
};

export const useEditorStore = create<EditorState>((set) => ({
    entityType: 'Prompt',
    editingEntity: null,
    editId: null,
    setEditId: (id) => set({ editId: id }),
    autoRun: false,

    setEditingEntity: (entityType, entity, options = {}) =>
        set({
            entityType,
            editingEntity: entity,
            editId: (entity as any).id, // we trust entity has an id

            autoRun: options.autoRun ?? false,
        }),

    clearEditingEntity: () =>
        set({
            entityType: 'Prompt',
            editingEntity: null,
            editId: null,
            autoRun: false,
        }),

    resetEditor: () =>
        set({
            entityType: 'Prompt',
            editingEntity: null,
            editId: null,
            autoRun: false,
        }),

    setEntityType: (type) => set({ entityType: type }), // <-- 🚨 HERE TOO
}));
