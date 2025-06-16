import { useEffect, useState } from 'react';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import { router } from 'expo-router';
import { ComposerNode } from '../types/composer';
import { useComposerStore } from './useComposerStore';

export function useComposerEditingState(treeId?: string, nodeId?: string) {
    const [draftTree, setDraftTree] = useState<ComposerNode | null>(null);
    const [draftPath, setDraftPath] = useState<ComposerNode[]>([]);

    const rootNode = useComposerStore((s) => s.rootNode);
    const loadTree = useComposerStore((s) => s.loadTree);
    const saveTree = useComposerStore((s) => s.saveTree);

    const currentNode = draftPath[draftPath.length - 1] ?? null;

    // ✅ Load on mount if not loaded
    useEffect(() => {
        (async () => {
            if (treeId && nodeId && !rootNode) {
                await loadTree(treeId);
            }
        })();
    }, [treeId, nodeId]);

    // ✅ Update draftTree and draftPath when rootNode changes
    useEffect(() => {
        if (rootNode && nodeId) {
            const path = getNodePath(rootNode, nodeId);
            if (path.length > 0) {
                setDraftTree(rootNode);
                setDraftPath(path);
            }
        }
    }, [rootNode, nodeId]);

    // ✅ Handle draft-only mode (no treeId)
    useEffect(() => {
        if (!treeId && !nodeId) {
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
        loadTree,
        rootNode: draftTree ?? rootNode,
    };
}
