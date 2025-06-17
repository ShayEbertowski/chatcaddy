// src/stores/useComposerEditingState.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import { useComposerStore } from './useComposerStore';
import type { ComposerNode } from '../types/composer';

/* ------------------------------------------------------------------ */
/*  Main hook                                                         */
/* ------------------------------------------------------------------ */
export function useComposerEditingState(treeId?: string, nodeId?: string) {
  /* -------- Zustand selectors (avoid full-object tracking) --------- */
  const composerTree   = useComposerStore((s) => s.composerTree);
  const loadTree       = useComposerStore((s) => s.loadTree);
  const saveTree       = useComposerStore((s) => s.saveTree);

  /* ------------------- one-time load guard ------------------------- */
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!treeId || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadTree(treeId).catch(console.error);
  }, [treeId]);

  /* ---------------- stable rootNode (memoised) --------------------- */
  const rootNode: ComposerNode | null = useMemo(() => {
    if (!composerTree || composerTree.id !== treeId) return null;
    const raw = composerTree.nodes[composerTree.rootId];
    // assure children array so editor logic is safe
    return raw ? { ...raw, children: (raw as any).children ?? [] } : null;
  }, [composerTree, treeId]);

  /* ---------------- local draft state ------------------------------ */
  const [draftTree, setDraftTree] = useState<ComposerNode | null>(null);
  const [draftPath, setDraftPath] = useState<ComposerNode[]>([]);

  /* ------- build path only when rootNode/nodeId changes ------------ */
  useEffect(() => {
    if (!rootNode || !nodeId) return;

    // Already have correct path → skip
    if (draftPath.length && draftPath[draftPath.length - 1].id === nodeId) return;

    const path = getNodePath(rootNode, nodeId);
    if (path.length) {
      setDraftTree(rootNode);        // memoised rootNode reference
      setDraftPath(path);
    }
  }, [rootNode, nodeId]);

  /* ------------ create brand-new draft tree when no IDs ------------ */
  useEffect(() => {
    if (treeId || nodeId) return;

    const root: ComposerNode = {
      id: generateUUIDSync(),
      title: 'Root',
      content: '',
      entityType: 'Prompt',
      variables: {},
      childIds: [],
      updatedAt: new Date().toISOString(),
    };

    setDraftTree(root);
    setDraftPath([root]);
  }, [treeId, nodeId]);

  /* ------------------ mutators ------------------------------------- */
  function updateNode(patch: Partial<ComposerNode>) {
    if (!draftPath.length) return;
    const current = draftPath[draftPath.length - 1];
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };

    // replace last in path
    setDraftPath([...draftPath.slice(0, -1), updated]);

    // deep-update draftTree if present
    if (draftTree) {
      const recurse = (n: ComposerNode): ComposerNode =>
        n.id === updated.id
          ? updated
          : { ...n, children: n.childIds.map((cid) => recurse(draftTree!.nodes[cid])) };
      setDraftTree(recurse(draftTree));
    }
  }

  function insertChildNode(title: string) {
    if (!draftPath.length) return;
    const parent = draftPath[draftPath.length - 1];

    const child: ComposerNode = {
      id: generateUUIDSync(),
      title,
      content: '',
      entityType: 'Prompt',
      variables: {},
      childIds: [],
      updatedAt: new Date().toISOString(),
    };

    parent.childIds.push(child.id);
    updateNode({});                     // refresh tree/path
    setDraftPath([...draftPath, child]);
  }

  /* ------------------- public API ---------------------------------- */
  return {
    currentNode : draftPath[draftPath.length - 1] ?? null,
    nodePath    : draftPath,
    rootNode    : draftTree ?? rootNode,
    updateNode,
    insertChildNode,
    saveTree,
    loadTree,
  };
}
