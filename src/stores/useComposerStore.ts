// stores/useComposerStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { supabase } from '../lib/supabaseClient';

//
// ─── TYPES ────────────────────────────────────────────────────────────────
//
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

    loadTree: (treeId: string) => Promise<void>;
    saveTree: () => Promise<string>;
    clearTree: () => void;
    listTrees: () => Promise<void>;
    createEmptyTree: () => Promise<{ treeId: string; rootId: string }>;

    updateNode: (id: string, patch: Partial<ComposerNode>) => void;
    addChild: (parentId: string, child: ComposerNode) => void;
}

//
// ─── STORE ────────────────────────────────────────────────────────────────
//
export const useComposerStore = create<ComposerStoreState>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            activeTreeId: null,
            composerTree: null,
            availableTrees: [],

            // ── Load full tree ───────────────────────────────────
            async loadTree(treeId) {
                const { data, error } = await supabase
                    .from('composer_trees')
                    .select('*')
                    .eq('id', treeId)
                    .maybeSingle();

                if (error) throw new Error(error.message);
                if (!data) throw new Error('Tree not found');

                // 🔀 Try to pull from new schema first
                let nodes = data.nodes ?? {};
                let rootId = data.root_id ?? null;

                // 🔙 If missing, try legacy schema
                if ((!rootId || Object.keys(nodes).length === 0) && data.tree_data) {
                    try {
                        const legacy = typeof data.tree_data === 'string'
                            ? JSON.parse(data.tree_data)
                            : data.tree_data;

                        nodes = legacy.nodes ?? nodes;
                        rootId = legacy.rootId ?? rootId;
                    } catch (err) {
                        console.warn('⚠️ Failed to parse legacy tree_data JSON:', err);
                    }
                }

                // 🛡️ Final safety check
                if (!rootId || !nodes[rootId]) {
                    throw new Error(
                        `Invalid tree structure: missing root_id or root node.\n` +
                        `Available node IDs: ${Object.keys(nodes).join(', ') || '(none)'}\n` +
                        `Raw rootId: ${rootId}`
                    );
                }

                set({
                    activeTreeId: data.id,
                    composerTree: {
                        id: data.id,
                        name: data.name,
                        rootId,
                        nodes,
                        updatedAt: data.updated_at,
                    },
                });
            },



            // ── Save tree + index root ───────────────────────────
            async saveTree() {
                const { composerTree, activeTreeId } = get();
                if (!composerTree) throw new Error('Nothing to save');

                const now = new Date().toISOString();
                const treeToSave: ComposerTree = {
                    ...composerTree,
                    id: activeTreeId ?? composerTree.id ?? uuid(),
                    updatedAt: now,
                };

                // 🛡️ Validate / auto-fix rootId ↔ nodes mismatch
                let root = treeToSave.nodes[treeToSave.rootId];
                if (!root) {
                    const fallbackId = Object.keys(treeToSave.nodes)[0];
                    if (!fallbackId) throw new Error('No nodes found in tree to save');
                    console.warn('⚠️ rootId invalid — falling back to:', fallbackId);
                    treeToSave.rootId = fallbackId;
                    root = treeToSave.nodes[fallbackId];
                }

                // 📝 Auto-title the tree from root node
                treeToSave.name = root.title?.trim() || 'Untitled';

                // 1️⃣ Upsert composer_trees
                const { error: treeErr } = await supabase.from('composer_trees').upsert({
                    id: treeToSave.id,
                    name: treeToSave.name,
                    root_id: treeToSave.rootId,
                    nodes: treeToSave.nodes,
                    updated_at: now,
                });
                if (treeErr) throw new Error(treeErr.message);

                // 2️⃣ Upsert indexed_entities for the root
                const { error: idxErr } = await supabase.from('indexed_entities').upsert({
                    id: root.id,
                    tree_id: treeToSave.id,
                    title: root.title || 'Untitled',
                    entity_type: root.entityType,
                    content_preview: root.content.slice(0, 160),
                    updated_at: now,
                });
                if (idxErr) throw new Error(idxErr.message);

                set({ activeTreeId: treeToSave.id, composerTree: treeToSave });
                return treeToSave.id;
            },

            // ── Create empty tree ────────────────────────────────
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

                set({ activeTreeId: id, composerTree: freshTree });
                return { treeId: id, rootId };
            },

            // ── List trees ───────────────────────────────────────
            async listTrees() {
                const { data, error } = await supabase
                    .from('composer_trees')
                    .select('id, name')
                    .order('updated_at', { ascending: false });

                if (error) throw new Error(error.message);
                set({ availableTrees: data ?? [] });
            },

            // ── Update node ──────────────────────────────────────
            updateNode(id, patch) {
                set((s) => {
                    if (!s.composerTree) return s;
                    const node = {
                        ...s.composerTree.nodes[id],
                        ...patch,
                        updatedAt: new Date().toISOString(),
                    };
                    return {
                        composerTree: {
                            ...s.composerTree,
                            nodes: { ...s.composerTree.nodes, [id]: node },
                            updatedAt: node.updatedAt,
                        },
                    };
                });
            },

            // ── Add child ────────────────────────────────────────
            addChild(parentId, child) {
                set((s) => {
                    if (!s.composerTree) return s;
                    const parent = s.composerTree.nodes[parentId];
                    const updatedParent = {
                        ...parent,
                        childIds: [...parent.childIds, child.id],
                        updatedAt: new Date().toISOString(),
                    };
                    return {
                        composerTree: {
                            ...s.composerTree,
                            nodes: {
                                ...s.composerTree.nodes,
                                [parentId]: updatedParent,
                                [child.id]: child,
                            },
                            updatedAt: updatedParent.updatedAt,
                        },
                    };
                });
            },

            // ── Clear (logout) ───────────────────────────────────
            clearTree() {
                set({ activeTreeId: null, composerTree: null });
            },
        }))
    )
);
