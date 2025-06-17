import { useEffect, useMemo, useRef, useState } from 'react';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import { useComposerStore } from './useComposerStore';
import type { ComposerNode } from '../types/composer';

/* ------------------------------------------------------------------ */
/*  Main hook                                                         */
/* ------------------------------------------------------------------ */
export function useComposerEditingState(treeId?: string, nodeId?: string) {
    const composerTree = useComposerStore((s) => s.composerTree);
    const loadTree = useComposerStore((s) => s.loadTree);
    const saveTree = useComposerStore((s) => s.saveTree);

    const hasLoadedRef = useRef(false);
    useEffect(() => {
        if (!treeId || hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    // safely coerce raw node into fully typed ComposerNode
    const rootNode: ComposerNode | null = useMemo(() => {
        if (!composerTree || composerTree.id !== treeId) return null;

        const raw = composerTree.nodes[composerTree.rootId];
        if (!raw) return null;

        return {
            ...raw,
            variables: raw.variables as Record<string, any>, // optional: define Variable type properly
            children: (raw as any).children ?? [], // temp fallback if using flat store
        };
    }, [composerTree, treeId]);

    const [draftTree, setDraftTree] = useState<ComposerNode | null>(null);
    const [draftPath, setDraftPath] = useState<ComposerNode[]>([]);

    useEffect(() => {
        if (!rootNode || !nodeId) return;
        if (draftPath.length && draftPath[draftPath.length - 1].id === nodeId) return;

        const path = getNodePath(rootNode, nodeId);
        if (path.length) {
            setDraftTree(rootNode);
            setDraftPath(path);
        }
    }, [rootNode, nodeId]);

    useEffect(() => {
        if (treeId || nodeId) return;

        const root: ComposerNode = {
            id: generateUUIDSync(),
            title: 'Root',
            content: '',
            entityType: 'Prompt',
            variables: {},
            children: [],
        };

        setDraftTree(root);
        setDraftPath([root]);
    }, [treeId, nodeId]);

    function updateNode(patch: Partial<ComposerNode>) {
        if (!draftPath.length) return;
        const current = draftPath[draftPath.length - 1];
        const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };

        setDraftPath([...draftPath.slice(0, -1), updated]);

        if (draftTree) {
            const recurse = (n: ComposerNode): ComposerNode =>
                n.id === updated.id
                    ? updated
                    : { ...n, children: n.children.map(recurse) };

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
            children: [],
        };

        const updatedParent = {
            ...parent,
            children: [...parent.children, child],
        };

        const newPath = [...draftPath.slice(0, -1), updatedParent, child];
        setDraftPath(newPath);

        if (draftTree) {
            const recurse = (n: ComposerNode): ComposerNode =>
                n.id === parent.id
                    ? updatedParent
                    : { ...n, children: n.children.map(recurse) };

            setDraftTree(recurse(draftTree));
        }
    }

    return {
        currentNode: draftPath[draftPath.length - 1] ?? null,
        nodePath: draftPath,
        rootNode: draftTree ?? rootNode,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    };
}
