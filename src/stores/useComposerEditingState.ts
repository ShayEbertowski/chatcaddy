import { useEffect, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';

import {
    useComposerStore,
    ComposerNode,
} from './useComposerStore';

interface UseComposerEditingStateOptions {
    initialPathIds?: string[];
}

/**
 * Very thin wrapper around Zustand – no draft state.
 */
export function useComposerEditingState(
    treeId?: string,
    nodeId?: string,
    options: UseComposerEditingStateOptions = {}
) {
    const { initialPathIds } = options;

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
            hasLoaded.current = true;
            return;
        }

        hasLoaded.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId, nodeId]);

    /* ---------- Derive path (breadcrumb) ---------- */
    const nodePath = useMemo(() => {
        if (!composerTree || !nodeId) return [];
        const root = composerTree.nodes[composerTree.rootId];
        return root ? getNodePath(root, nodeId, composerTree.nodes) : [];
    }, [composerTree, nodeId]);

    /* ---------- Update helpers ---------- */
    function updateNode(patch: Partial<ComposerNode>) {
        if (!nodeId) return;
        updateNodeRaw(nodeId, patch);
    }

    /** Create child then navigate once it's ready */
    function insertChildNode(title: string, parentOverrideId?: string): string | undefined {
        const targetParentId = parentOverrideId || nodeId;
        if (!targetParentId || !treeId || !composerTree) return;

        const parent = composerTree.nodes[targetParentId];
        if (!parent) return;

        const existingId = parent.childIds.find((childId) => {
            const child = composerTree.nodes[childId];
            return child?.title?.trim() === title.trim();
        });

        if (existingId) {
            requestAnimationFrame(() => {
                router.replace(`/(drawer)/(composer)/${treeId}/${existingId}`);
            });
            return existingId;
        }

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

        useComposerStore.setState((prev) => {
            const parentNode = prev.composerTree?.nodes?.[targetParentId];
            if (!parentNode) return prev;

            const updatedParentVariables = {
                ...(parentNode.variables ?? {}),
                [title]: {
                    type: 'prompt',
                    promptId: childId,
                    promptTitle: title,
                },
            };

            return {
                composerTree: {
                    ...prev.composerTree!,
                    nodes: {
                        ...prev.composerTree!.nodes,
                        [childId]: child,
                        [targetParentId]: {
                            ...parentNode,
                            childIds: [...(parentNode.childIds ?? []), childId],
                            variables: updatedParentVariables,
                        },
                    },
                },
            };
        });

        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
            const nodeExists = useComposerStore.getState().composerTree?.nodes?.[childId];
            if (nodeExists || attempts >= maxAttempts) {
                clearInterval(interval);
                if (nodeExists) {
                    requestAnimationFrame(() => {
                        router.replace(`/(drawer)/(composer)/${treeId}/${childId}`);
                    });
                } else {
                    console.warn(`❌ Node ${childId} not found in store after waiting.`);
                }
            }
            attempts++;
        }, 50);

        return childId;
    }


    return {
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    };
}
