// src/stores/useComposerEditingState.ts
import { useEffect, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';

import {
    useComposerStore,
    ComposerNode,
} from './useComposerStore';

/**
 * Very thin wrapper around Zustand – no draft state.
 */
export function useComposerEditingState(treeId?: string, nodeId?: string) {
    /* ---------- Store helpers ---------- */
    const composerTree = useComposerStore((s) => s.composerTree);
    const loadTree = useComposerStore((s) => s.loadTree);
    const saveTree = useComposerStore((s) => s.saveTree);
    const updateNodeRaw = useComposerStore((s) => s.updateNode);
    const addChild = useComposerStore((s) => s.addChild);

    const hasLoaded = useRef(false);

    /* ---------- Load tree (only if needed) ---------- */
    useEffect(() => {
        if (!treeId || hasLoaded.current) return;

        const cached = useComposerStore.getState().composerTree;
        const cacheOK =
            cached?.id === treeId &&
            (!nodeId || !!cached.nodes[nodeId]);

        if (cacheOK) {
            hasLoaded.current = true;              // already hydrated
            return;
        }

        hasLoaded.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId, nodeId]);

    /* ---------- Derive path (breadcrumb) ---------- */
    const nodePath = useMemo(() => {
        if (!composerTree || !nodeId) return [];
        const root = composerTree.nodes[composerTree.rootId];
        return root ? getNodePath(root as any, nodeId) : [];
    }, [composerTree, nodeId]);

    /* ---------- Update helpers ---------- */
    function updateNode(patch: Partial<ComposerNode>) {
        if (!nodeId) return;
        updateNodeRaw(nodeId, patch);
    }

    /** Create child then navigate */
    function insertChildNode(title: string) {
        if (!nodeId || !treeId || !composerTree) return;

        const parent = composerTree.nodes[nodeId];
        if (!parent) return;

        // Check if child with matching title already exists
        const existingId = parent.childIds.find((childId) => {
            const child = composerTree.nodes[childId];
            return child?.title?.trim() === title.trim();
        });

        if (existingId) {
            router.push(`/(drawer)/(composer)/${treeId}/${existingId}`);
            return;
        }

        // Otherwise, create a new one
        const childId = generateUUIDSync();
        const now = new Date().toISOString();

        const child: ComposerNode = {
            id: childId,
            title,
            content: '',
            entityType: 'Prompt',
            variables: {},
            childIds: [],
            updatedAt: now,
        };

        addChild(nodeId, child); // adds and links it in store
        router.push(`/(drawer)/(composer)/${treeId}/${childId}`);
    }


    return {
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    };
}
