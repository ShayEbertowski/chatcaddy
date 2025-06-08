// core/composer/composerStore.ts

import { create } from 'zustand';
import { ComposerNode, VariableValue, ComposerTreeRecord } from '../types/composer';
import { createSupabaseClient } from '../../lib/supabaseDataClient';
import { generateUUIDSync } from '../../utils/uuid/generateUUIDSync';

const supabase = createSupabaseClient();

interface ComposerStoreState {
    activeTreeId: string | null;
    rootNode: ComposerNode | null;
    availableTrees: { id: string; name: string }[];

    setRootNode: (newRoot: ComposerNode) => void;
    updateVariable: (variableName: string, variableValue: VariableValue) => void;
    loadTree: (treeId: string) => Promise<void>;
    saveTree: (name: string) => Promise<string>;
    clearTree: () => void;
    listTrees: () => Promise<{ id: string; name: string }[]>;
    addChild: (parentId: string, childNode: ComposerNode) => void;
}

export const composerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],

    setRootNode(newRoot) {
        set({ rootNode: newRoot });
    },

    updateVariable(variableName, variableValue) {
        const { rootNode } = get();
        if (!rootNode) return;

        const updated: ComposerNode = {
            ...rootNode,
            variables: { ...rootNode.variables, [variableName]: variableValue },
        };

        set({ rootNode: updated });
    },

    async loadTree(treeId) {
        const { data, error } = await supabase
            .from('composer_trees')
            .select('*')
            .eq('id', treeId)
            .single();

        if (error || !data) throw new Error(error?.message || 'Tree not found');
        set({
            rootNode: data.tree_data,
            activeTreeId: data.id,
        });
    },

    async saveTree(name) {
        const { rootNode, activeTreeId } = get();
        if (!rootNode) throw new Error('No root node to save.');

        const treeId = activeTreeId ?? generateUUIDSync();

        const { error } = await supabase
            .from('composer_trees')
            .upsert({
                id: treeId,
                name,
                tree_data: rootNode,
            });

        if (error) throw new Error(error.message);

        set({ activeTreeId: treeId });
        return treeId;
    },

    clearTree() {
        set({ rootNode: null, activeTreeId: null });
    },

    async listTrees() {
        const { data, error } = await supabase.from('composer_trees').select('id, name');
        if (error) throw new Error(error.message);
        set({ availableTrees: data });
        return data;
    },

    addChild(parentId, childNode) {
        const { rootNode } = get();
        if (!rootNode) return;

        function addRecursive(node: ComposerNode): ComposerNode {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...node.children, childNode],
                };
            }

            return {
                ...node,
                children: node.children.map(addRecursive),
            };
        }

        const updated = addRecursive(rootNode);
        set({ rootNode: updated });
    },
}));
