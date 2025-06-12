import { useEffect, useState } from 'react';
import { composerStore } from '../core/composer/composerStore';
import { ComposerNode } from '../core/types/composer';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import { router } from 'expo-router';

export function useComposerEditingState(treeId?: string, nodeId?: string) {
    const [draftTree, setDraftTree] = useState<ComposerNode | null>(null);
    const [draftPath, setDraftPath] = useState<ComposerNode[]>([]);

    const rootNode = composerStore((s) => s.rootNode);
    const loadTree = composerStore((s) => s.loadTree);
    const saveTree = composerStore((s) => s.saveTree);

    const currentNode = draftPath[draftPath.length - 1] ?? null;

    useEffect(() => {
        (async () => {
            if (treeId && nodeId) {
                if (!rootNode) {
                    await loadTree(treeId);
                }

                const freshRoot = composerStore.getState().rootNode;
                if (freshRoot) {
                    const path = getNodePath(freshRoot, nodeId);
                    if (path.length > 0) {
                        setDraftPath(path);
                    }
                }
            } else {
                // Draft-only mode — create root node in memory
                const newTree: ComposerNode = {
                    id: generateUUIDSync(),
                    title: 'Root',
                    content: '',
                    entityType: 'Prompt',
                    variables: {},
                    children: [],
                };
                setDraftTree(newTree);
                setDraftPath([newTree]);
            }
        })();
    }, [treeId, nodeId]);

    function updateNode(updates: Partial<ComposerNode>) {
        if (!currentNode) return;

        const updated = { ...currentNode, ...updates };
        const newPath = [...draftPath.slice(0, -1), updated];
        setDraftPath(newPath);

        if (draftTree) {
            const updateRecursive = (node: ComposerNode): ComposerNode =>
                node.id === updated.id
                    ? updated
                    : { ...node, children: node.children.map(updateRecursive) };

            setDraftTree(updateRecursive(draftTree));
        }
    }

    function insertChildNode(title: string) {
        if (!currentNode) return;

        const newChild: ComposerNode = {
            id: generateUUIDSync(),
            title,
            content: '',
            entityType: 'Prompt',
            variables: {},
            children: [],
        };

        const updatedCurrent = {
            ...currentNode,
            children: [...currentNode.children, newChild],
        };

        const newPath = [...draftPath.slice(0, -1), updatedCurrent, newChild];
        setDraftPath(newPath);

        if (draftTree) {
            const updateRecursive = (node: ComposerNode): ComposerNode =>
                node.id === updatedCurrent.id
                    ? updatedCurrent
                    : { ...node, children: node.children.map(updateRecursive) };

            setDraftTree(updateRecursive(draftTree));
        }

        setTimeout(() => {
            router.push(`/(drawer)/(composer)/${treeId ?? 'DRAFT'}/${newChild.id}`);
        }, 50);
    }

    return {
        currentNode,
        nodePath: draftPath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree, // ✅ added so ComposerNodeScreen works
        rootNode: draftTree ?? rootNode,
    };
}
