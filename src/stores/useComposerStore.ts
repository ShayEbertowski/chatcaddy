// stores/useComposerStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { supabase } from '../lib/supabaseClient';

//
// ─── TYPES ────────────────────────────────────────────────────────────────────
//

export type NodeKind = 'Prompt' | 'Function' | 'Snippet';

export interface ComposerNode {
    id: string;
    title: string;
    content: string;
    entityType: NodeKind;
    variables: Record<string, unknown>;
    childIds: string[];           // explicitly reference children
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
// ─── STORE ───────────────────────────────────────────────────────────────────
//

export const useComposerStore = create<ComposerStoreState>()(
    devtools(
        subscribeWithSelector((set, get) => ({
            activeTreeId: null,
            composerTree: null,
            availableTrees: [],

            // ── Load entire tree ───────────────────────────────
            async loadTree(id) {
                console.log("📥 loadTree called with:", id);
                const { data, error } = await supabase
                    .from('composer_trees')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (error) throw new Error(error.message);
                if (!data) return;

                set({
                    activeTreeId: data.id,
                    composerTree: data as unknown as ComposerTree,
                });
            },

            // ── Save composer_tree + indexed_entity ────────────
            async saveTree() {
                const { composerTree, activeTreeId } = get();
                if (!composerTree) throw new Error('Nothing to save');

                const now = new Date().toISOString();
                const treeToSave: ComposerTree = {
                    ...composerTree,
                    id: activeTreeId ?? composerTree.id ?? uuid(),
                    updatedAt: now,
                };

                // 1️⃣ Upsert full tree
                const { error: treeErr } = await supabase
                    .from('composer_trees')
                    .upsert({
                        id: treeToSave.id,
                        name: treeToSave.name,
                        root_id: treeToSave.rootId,
                        nodes: treeToSave.nodes,
                        updated_at: now,
                    });

                if (treeErr) throw new Error(treeErr.message);

                // 2️⃣ Upsert index entry for root node
                const root = treeToSave.nodes[treeToSave.rootId];
                const { error: idxErr } = await supabase
                    .from('indexed_entities')
                    .upsert({
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

            // ── Create brand-new empty tree ────────────────────
            async createEmptyTree() {
                const id = uuid();
                const rootId = uuid();

                const root: ComposerNode = {
                    id: rootId,
                    title: '',
                    content: '',
                    entityType: 'Prompt',
                    variables: {},
                    childIds: [],
                    updatedAt: new Date().toISOString(),
                };

                const freshTree: ComposerTree = {
                    id,
                    name: 'Untitled',
                    rootId,
                    nodes: { [rootId]: root },
                    updatedAt: root.updatedAt,
                };

                await supabase.from('composer_trees').insert({
                    id,
                    name: freshTree.name,
                    root_id: rootId,
                    nodes: freshTree.nodes,
                    updated_at: freshTree.updatedAt,
                });

                set({ activeTreeId: id, composerTree: freshTree });

                return { treeId: id, rootId }; // ✅ return both!
            },


            // ── Fetch list of trees for sidebar/search ─────────
            async listTrees() {
                const { data, error } = await supabase
                    .from('composer_trees')
                    .select('id, name')
                    .order('updated_at', { ascending: false });

                if (error) throw new Error(error.message);
                set({ availableTrees: data ?? [] });
            },

            // ── Update a single node (merge patch) ─────────────
            updateNode(id, patch) {
                set((s) => {
                    if (!s.composerTree) return s;
                    const node = { ...s.composerTree.nodes[id], ...patch, updatedAt: new Date().toISOString() };
                    return {
                        composerTree: {
                            ...s.composerTree,
                            nodes: { ...s.composerTree.nodes, [id]: node },
                            updatedAt: node.updatedAt,
                        },
                    };
                });
            },

            // ── Add child node to parent ───────────────────────
            addChild(parentId, child) {
                set((s) => {
                    if (!s.composerTree) return s;
                    const parent = s.composerTree.nodes[parentId];
                    const updatedParent = { ...parent, childIds: [...parent.childIds, child.id], updatedAt: new Date().toISOString() };
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

            // ── Clear everything (used on logout) ──────────────
            clearTree() {
                set({ activeTreeId: null, composerTree: null });
            },
        }))
    )
);
