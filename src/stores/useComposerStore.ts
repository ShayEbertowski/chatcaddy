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

  loadTree: (treeId: string) => Promise<void>;
  saveTree: () => Promise<string>;
  clearTree: () => void;
  listTrees: () => Promise<void>;
  createEmptyTree: () => Promise<{ treeId: string; rootId: string }>;
  forkTreeFromEntity: (
    entity: IndexedEntity
  ) => Promise<{ treeId: string; rootId: string }>;
  forkTreeFromTreeId: (
    sourceTreeId: string
  ) => Promise<{ treeId: string; rootId: string }>;

  updateNode: (id: string, patch: Partial<ComposerNode>) => void;
  addChild: (parentId: string, child: ComposerNode) => void;
  insertChildNode: (parentId: string, name: string) => void;
}

/* ─── STORE ─────────────────────────────────────────── */
export const useComposerStore = create<ComposerStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      activeTreeId: null,
      composerTree: null,
      availableTrees: [],

      /* ── Load full tree (from composer_trees) ───────── */
      async loadTree(treeId) {
        const { data, error } = await supabase
          .from('composer_trees')
          .select('*')
          .eq('id', treeId)
          .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('Tree not found');

        const nodes = data.nodes ?? {};
        const rootId = data.root_id;

        if (!rootId || !nodes[rootId]) {
          throw new Error('Invalid tree: missing root');
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

      /* ── Save tree + upsert every node ──────────────── */
      async saveTree() {
        const { composerTree, activeTreeId } = get();
        if (!composerTree) throw new Error('Nothing to save');

        const now = new Date().toISOString();
        const treeToSave: ComposerTree = {
          ...composerTree,
          id: activeTreeId ?? composerTree.id ?? uuid(),
          updatedAt: now,
        };

        /* Upsert composer_trees (full blob) */
        const { error: treeErr } = await supabase.from('composer_trees').upsert({
          id: treeToSave.id,
          name: treeToSave.name || 'Untitled',
          root_id: treeToSave.rootId,
          nodes: treeToSave.nodes,
          updated_at: now,
        });
        if (treeErr) throw treeErr;

        /* 🔧 NEW: upsert EVERY node to indexed_entities */
        const nodeList = Object.values(treeToSave.nodes);
        const nodeResults = await Promise.all(
          nodeList.map((node) =>
            supabase.from('indexed_entities').upsert({
              id: node.id,
              tree_id: treeToSave.id,
              title: node.title || 'Untitled',
              entity_type: node.entityType,
              content: node.content,
              updated_at: node.updatedAt || now,
            })
          )
        );
        const nodeError = nodeResults.find((r) => r.error)?.error;
        if (nodeError) throw nodeError;

        set({ activeTreeId: treeToSave.id, composerTree: treeToSave });
        return treeToSave.id;
      },

      /* ── Create empty tree (root only) ──────────────── */
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

      /* ── Misc helpers (list, update, etc.) ──────────── */
      async listTrees() {
        const { data, error } = await supabase
          .from('composer_trees')
          .select('id, name')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        set({ availableTrees: data ?? [] });
      },

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

      insertChildNode(parentId, name) {
        const now = new Date().toISOString();
        const childId = uuid();
        const newNode: ComposerNode = {
          id: childId,
          title: name,
          content: '',
          entityType: 'Prompt',
          variables: {},
          childIds: [],
          updatedAt: now,
        };

        get().addChild(parentId, newNode);

        /* 🔧 ALWAYS navigate, even if already on that node */
        const treeId = get().composerTree?.id;
        if (treeId) {
          router.push(`/(drawer)/(composer)/${treeId}/${childId}`);
        }
      },

      clearTree() {
        set({ activeTreeId: null, composerTree: null });
      },

      /* ── Fork helpers unchanged ─────────────────────── */
      forkTreeFromEntity: async (entity) => {
        const id = uuid();
        const rootId = uuid();
        const now = new Date().toISOString();

        const root: ComposerNode = {
          id: rootId,
          title: entity.title?.trim() || 'Untitled',
          content: entity.content?.trim(),
          entityType: (entity.entityType as NodeKind) ?? 'Prompt',
          variables: {},
          childIds: [],
          updatedAt: now,
        };

        const forkedTree: ComposerTree = {
          id,
          name: root.title,
          rootId,
          nodes: { [rootId]: root },
          updatedAt: now,
        };

        await supabase.from('composer_trees').insert({
          id,
          name: forkedTree.name,
          root_id: rootId,
          nodes: forkedTree.nodes,
          updated_at: now,
        });

        set({ activeTreeId: id, composerTree: forkedTree });
        return { treeId: id, rootId };
      },

      forkTreeFromTreeId: async (sourceTreeId) => {
        const { treeId, rootId } = await forkTreeFrom(sourceTreeId);
        await get().loadTree(treeId);
        return { treeId, rootId };
      },
    }))
  )
);
