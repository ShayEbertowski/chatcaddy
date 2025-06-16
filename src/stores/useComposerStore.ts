import { create } from 'zustand';
import { Variable } from '../types/prompt';
import { ComposerNode } from '../types/composer';
import { supabase } from '../lib/supabaseClient';
import { fromEditorVariables } from '../types/variable';
import { ComposerStoreState } from '../types/stores';
import { v4 as uuidv4 } from 'uuid';

export const useComposerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],

    setRootNode(newRoot) {
        set({ rootNode: newRoot });
    },

    setComposerTree({
        id,
        name,
        rootNode,
    }: { id: string; name: string; rootNode: ComposerNode }) {
        set({
            activeTreeId: id,
            rootNode,
            availableTrees: [
                { id, name },
            ],
        });
    },


    updateVariable(variableName, variableValue) {
        const { rootNode } = get();
        if (!rootNode) return;

        const updatedVars: Record<string, Variable> = {
            ...(fromEditorVariables(rootNode.variables as any)),
            [variableName]: variableValue,
        };

        const updated: ComposerNode = {
            ...rootNode,
            variables: updatedVars,
        };

        set({ rootNode: updated });
    },

    async loadTree(treeId) {
        if (!treeId || typeof treeId !== 'string') {
            console.error('🚫 Invalid treeId passed to loadTree:', treeId);
            return;
        }

        const { data, error } = await supabase
            .from('composer_trees')
            .select('*')
            .eq('id', treeId)
            .maybeSingle();

        if (error) {
            console.error('❌ Supabase error while loading tree:', error);
            throw new Error(error.message);
        }

        if (!data) {
            console.warn('⚠️ No tree found with ID:', treeId);
            return;
        }

        console.log('✅ Successfully loaded tree');
        set({
            rootNode: data.tree_data,
            activeTreeId: data.id,
        });
    },

    async saveTree(name) {
        const { rootNode, activeTreeId } = get();
        if (!rootNode) throw new Error('No root node to save.');

        const treeId = activeTreeId ?? generateUUIDSync();

        // 🛡 Ensure a non-empty title
        const safeTitle = rootNode.title?.trim() || name?.trim() || 'Untitled';

        const { error: treeError } = await supabase
            .from('composer_trees')
            .upsert({
                id: treeId,
                name: safeTitle, // 👍 also use the fallback for display name
                tree_data: rootNode,
            });

        if (treeError) throw new Error(treeError.message);

        const { error: indexError } = await supabase
            .from('indexed_entities')
            .upsert({
                id: rootNode.id,
                tree_id: treeId,
                title: safeTitle,
                entity_type: rootNode.entityType,
                updated_at: new Date().toISOString(),
            });

        if (indexError) throw new Error(indexError.message);

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

    createTree(tree) {
        const { id, name, rootNode } = tree;

        set({
            activeTreeId: id,
            rootNode,
            availableTrees: [...get().availableTrees, { id, name }],
        });
    },

    async createEmptyTree() {
        const id = uuidv4();
        const newTree = {
            id,
            name: 'Untitled',
            tree_data: {
                id,
                title: '',
                content: '',
                entityType: 'Prompt',
                variables: {},
                children: [],
            },
        };

        const { error } = await supabase.from('composer_trees').insert(newTree);
        if (error) throw new Error(error.message);

        return id;
    }
}));

function createSupabaseClient() {
    throw new Error('Function not implemented.');
}

function generateUUIDSync(): string | null {
    throw new Error('Function not implemented.');
}
