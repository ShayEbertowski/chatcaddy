import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { supabase } from '../lib/supabaseClient';
import { IndexedEntity } from '../types/entity';
import { forkTreeFrom } from '../utils/composer/forkTreeFrom';
import { router } from 'expo-router';

/* ─── TYPES ─────────────────────────────────────────── */
export type NodeKind = 'Prompt' | 'Function' | 'Snippet';

export interface ComposerNode {
    id: string;
    title: string;
    content: string;
    entityType: NodeKind;
    variables: Record<string, unknown>;
    childIds: string[];
    updatedAt: string;
}

export interface ComposerTree {
    id: string;
    name: string;
    rootId: string;
    nodes: Record<string, ComposerNode>;
    updatedAt: string;
}

export interface ComposerStoreState {
    activeTreeId: string | null;
    composerTree: ComposerTree | null;
    availableTrees: { id: string; name: string }[];
    loadedTreeIds: Set<string>; // ✅ NEW

    promptVersion: number;
    bumpPromptVersion: () => void;

    loadTree: (treeId: string) => Promise<void>;
    saveTree: () => Promise<string>;

    clearTree: () => void;
    listTrees: () => Promise<void>;
    createEmptyTree: () => Promise<{ treeId: string; rootId: string }>;

    forkTreeFromEntity: (e: IndexedEntity) => Promise<{ treeId: string; rootId: string }>;
    forkTreeFromTreeId: (id: string) => Promise<{ treeId: string; rootId: string }>;

    updateNode: (id: string, patch: Partial<ComposerNode>) => void;
    addChild: (parentId: string, child: ComposerNode) => void;
    insertChildNode: (parentId: string, name: string, initialContent?: string) => Promise<void>;
}

/* ─── STORE ─────────────────────────────────────────── */
export const useComposerStore = create<ComposerStoreState>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            activeTreeId: null,
            composerTree: null,
            availableTrees: [],
            loadedTreeIds: new Set(), // ✅ NEW
            promptVersion: 0,

            bumpPromptVersion: () => set((s) => ({ promptVersion: s.promptVersion + 1 })),

            async loadTree(treeId) {
                const { data, error } = await supabase
                    .from('composer_trees')
                    .select('*')
                    .eq('id', treeId)
                    .maybeSingle();

                if (error) throw error;
                if (!data) throw new Error('Tree not found');

                const { id, name, root_id, nodes, updated_at } = data;
                if (!root_id || !nodes[root_id]) throw new Error('Bad tree blob');

                set((state) => ({
                    activeTreeId: id,
                    composerTree: {
                        id,
                        name,
                        rootId: root_id,
                        nodes,
                        updatedAt: updated_at,
                    },
                    loadedTreeIds: new Set([...state.loadedTreeIds, id]), // ✅ NEW
                }));
            },

            async saveTree() {
                const { composerTree } = get();
                if (!composerTree) throw new Error('Nothing to save');

                const now = new Date().toISOString();
                const treeId = composerTree.id || uuid();
                const nodes = composerTree.nodes;
                const rootId = composerTree.rootId;
                const treeName = nodes[rootId].title?.trim() || 'Untitled';

                const { error: treeErr } = await supabase.from('composer_trees').upsert({
                    id: treeId,
                    name: treeName,
                    root_id: rootId,
                    nodes,
                    updated_at: now,
                });
                if (treeErr) throw treeErr;

                const rootNode = nodes[rootId];
                await supabase.from('indexed_entities').upsert({
                    id: rootId,
                    tree_id: treeId,
                    is_root: true,
                    title: rootNode.title || 'Untitled',
                    entity_type: rootNode.entityType,
                    content: rootNode.content,
                    updated_at: now,
                });

                set({
                    activeTreeId: treeId,
                    composerTree: { ...composerTree, id: treeId, updatedAt: now },
                });

                get().bumpPromptVersion();
                return treeId;
            },

            async listTrees() {
                const { data, error } = await supabase
                    .from('indexed_entities')
                    .select('tree_id,title')
                    .eq('is_root', true)
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                set({
                    availableTrees: data?.map((d) => ({ id: d.tree_id, name: d.title })) ?? [],
                });
            },

            async createEmptyTree() {
                const id = uuid();
                const rootId = uuid();
                const now = new Date().toISOString();

                const root: ComposerNode = {
                    id: rootId,
                    title: '',
                    content: '',
                    entityType: 'Prompt',
                    variables: {},
                    childIds: [],
                    updatedAt: now,
                };

                const freshTree: ComposerTree = {
                    id,
                    name: 'Untitled',
                    rootId,
                    nodes: { [rootId]: root },
                    updatedAt: now,
                };

                await supabase.from('composer_trees').insert({
                    id,
                    name: freshTree.name,
                    root_id: rootId,
                    nodes: freshTree.nodes,
                    updated_at: now,
                });

                await supabase.from('indexed_entities').insert({
                    id: rootId,
                    tree_id: id,
                    is_root: true,
                    title: '',
                    entity_type: 'Prompt',
                    content: '',
                    updated_at: now,
                });

                set((state) => ({
                    activeTreeId: id,
                    composerTree: freshTree,
                    loadedTreeIds: new Set([...state.loadedTreeIds, id]), // ✅ NEW
                }));

                get().bumpPromptVersion();
                return { treeId: id, rootId };
            },

            updateNode(id, patch) {
                const tree = get().composerTree;
                if (!tree) return;

                const node = tree.nodes[id];
                if (!node) return;

                const updatedNode: ComposerNode = {
                    ...node,
                    ...patch,
                    updatedAt: new Date().toISOString(),
                };

                set({
                    composerTree: {
                        ...tree,
                        nodes: {
                            ...tree.nodes,
                            [id]: updatedNode,
                        },
                    },
                });
            },

            addChild(parentId, child) {
                const tree = get().composerTree;
                if (!tree) return;

                const parent = tree.nodes[parentId];
                if (!parent) return;

                set({
                    composerTree: {
                        ...tree,
                        nodes: {
                            ...tree.nodes,
                            [child.id]: child,
                            [parentId]: {
                                ...parent,
                                childIds: [...parent.childIds, child.id],
                            },
                        },
                    },
                });
            },

            async insertChildNode(parentId, name, initialContent = '') {
                const tree = get().composerTree;
                if (!tree) throw new Error('No active tree');

                const childId = uuid();
                const now = new Date().toISOString();

                const newNode: ComposerNode = {
                    id: childId,
                    title: name,
                    content: initialContent,
                    entityType: 'Prompt',
                    variables: {},
                    childIds: [],
                    updatedAt: now,
                };

                get().addChild(parentId, newNode);

                try {
                    const { error } = await supabase.from('indexed_entities').upsert({
                        id: childId,
                        tree_id: tree.id,
                        is_root: false,
                        title: name,
                        entity_type: 'Prompt',
                        content: initialContent,
                        updated_at: now,
                    });

                    if (error) {
                        console.error('⚠️ Failed to upsert child node:', error);
                    }
                } catch (err) {
                    console.error('⚠️ Unexpected error during child node upsert:', err);
                }

                get().bumpPromptVersion();
                router.push(`/(drawer)/(composer)/${tree.id}/${childId}`);
            },

            forkTreeFromEntity: async (e) => {
                const { treeId, rootId } = await forkTreeFrom(e.tree_id);
                await get().loadTree(treeId);

                const tree = get().composerTree;
                console.log('🌳 Forked tree:', {
                    treeId,
                    rootId,
                    hasRoot: !!tree?.nodes?.[rootId],
                    nodeKeys: Object.keys(tree?.nodes ?? {}),
                });

                setTimeout(() => {
                    router.push(`/(drawer)/(composer)/${treeId}/${rootId}`);
                }, 0);

                get().bumpPromptVersion();
                return { treeId, rootId };
            },

            forkTreeFromTreeId: async (id) => {
                const { treeId, rootId } = await forkTreeFrom(id);
                await get().loadTree(treeId);
                get().bumpPromptVersion();
                return { treeId, rootId };
            },

            clearTree() {
                set({ activeTreeId: null, composerTree: null });
            },
        }))
    )
);
