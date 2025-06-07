import { create } from 'zustand';
import { ComposerNode, VariableValue } from '../types/composer';
import { ComposerStoreState } from '../types/composer';
import * as persistence from '../composer/services/ComposerPersistence';
import { createSupabaseClient } from '../../lib/supabaseDataClient';

// ✅ Create your supabase client ONCE when the store loads
const supabase = createSupabaseClient();

export const composerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],

    setRootNode(newRoot: ComposerNode) {
        set({ rootNode: newRoot });
    },

    updateVariable(variableName: string, variableValue: VariableValue) {
        const { rootNode } = get();
        if (!rootNode) return;

        const updatedNode: ComposerNode = {
            ...rootNode,
            variables: {
                ...rootNode.variables,
                [variableName]: variableValue,
            }
        };

        set({ rootNode: updatedNode });
    },

    async loadTree(treeId) {
        const record = await persistence.loadComposerTree(treeId);
        set({
            activeTreeId: record.id,
            rootNode: record.tree_data,
        });
    },

    async saveTree(name) {
        const id = await persistence.saveComposerTree(
            name,
            get().rootNode!,
            get().activeTreeId ?? undefined
        );
        set({ activeTreeId: id });
        return id;
    },

    clearTree() {
        set({ activeTreeId: null, rootNode: null });
    },

    listTrees: async () => {
        const { data, error } = await supabase.from('trees').select('*');
        if (error) {
            console.error('Error fetching trees:', error);
            return [];
        }
        return data ?? [];
    },

    addChild(parentId: any, childNode: any) {
        const { rootNode } = get();
        if (!rootNode) return;

        function insert(node: ComposerNode): ComposerNode {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...(node.children ?? []), childNode],
                };
            }

            return {
                ...node,
                children: node.children?.map(insert) ?? [],
            };
        }

        const updatedRoot = insert(rootNode);
        set({ rootNode: updatedRoot });
    },
}));
