// src/stores/useComposerEditingState.ts
import { useEffect, useMemo, useRef } from 'react';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import {
    useComposerStore,
    ComposerNode,
    ComposerTree,
} from './useComposerStore';

/**
 * A *thin* wrapper around useComposerStore that exposes exactly
 * what ComposerNodeScreen needs, without maintaining a separate
 * “draft” state that can drift out of sync.
 */
export function useComposerEditingState(treeId?: string, nodeId?: string) {
    /* ---------- Store Selectors ---------- */
    const composerTree = useComposerStore((s) => s.composerTree);
    const loadTree = useComposerStore((s) => s.loadTree);
    const saveTree = useComposerStore((s) => s.saveTree);
    const updateNodeInStore = useComposerStore((s) => s.updateNode);
    const addChild = useComposerStore((s) => s.addChild);

    /* ---------- Load tree once on mount ---------- */
    const hasLoaded = useRef(false);
    useEffect(() => {
        if (!treeId || hasLoaded.current) return;
        hasLoaded.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    /* ---------- Derive current node & path ---------- */
    const currentNode = useMemo<ComposerNode | null>(() => {
        if (!composerTree || !nodeId) return null;
        return composerTree.nodes[nodeId] ?? null;
    }, [composerTree, nodeId]);

    const nodePath = useMemo(() => {
        if (!composerTree || !nodeId) return [];
        const root = composerTree.nodes[composerTree.rootId];
        if (!root) return [];
        return getNodePath(root as any, nodeId);
    }, [composerTree, nodeId]);

    const rootNode = composerTree
        ? composerTree.nodes[composerTree.rootId] ?? null
        : null;

    /* ---------- Update helpers ---------- */
    function updateNode(patch: Partial<ComposerNode>) {
        if (!currentNode) return;
        updateNodeInStore(currentNode.id, patch);
    }

    /** Insert a new child under the current node */
    function insertChildNode(title: string) {
        if (!currentNode) return;

        const childId = generateUUIDSync();
        const child: ComposerNode = {
            id: childId,
            title,
            content: '',
            entityType: 'Prompt',
            variables: {},
            childIds: [],
            updatedAt: new Date().toISOString(),
        };

        addChild(currentNode.id, child);
    }

    return {
        rootNode,
        currentNode,
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    };
}
