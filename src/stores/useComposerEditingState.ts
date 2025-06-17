// src/stores/useComposerEditingState.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';
import { getNodePath } from '../utils/composer/pathUtils';
import { useComposerStore, ComposerNode, ComposerTree } from './useComposerStore';

type InflatedComposerNode = ComposerNode & {
    children: InflatedComposerNode[];
};


/* ------------------------------------------------------------------
   Main hook
------------------------------------------------------------------ */
export function useComposerEditingState(treeId?: string, nodeId?: string) {
    const composerTree = useComposerStore((s) => s.composerTree);
    const loadTree = useComposerStore((s) => s.loadTree);
    const saveTree = useComposerStore((s) => s.saveTree);

    const hasLoaded = useRef(false);
    useEffect(() => {
        if (!treeId || hasLoaded.current) return;
        hasLoaded.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    const inflate = (n: ComposerNode, map: Record<string, ComposerNode>): InflatedComposerNode => ({
        ...n,
        children: n.childIds.map((id) => inflate(map[id], map)),
    });

    const rootNode: InflatedComposerNode | null = useMemo(() => {
        if (!composerTree || composerTree.id !== treeId) return null;
        const raw = composerTree.nodes[composerTree.rootId];
        return raw ? inflate(raw, composerTree.nodes) : null;
    }, [composerTree, treeId]);

    const [draftTree, setDraftTree] = useState<InflatedComposerNode | null>(null);
    const [draftPath, setDraftPath] = useState<InflatedComposerNode[]>([]);

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

        const root: InflatedComposerNode = {
            id: generateUUIDSync(),
            title: 'Root',
            content: '',
            entityType: 'Prompt',
            variables: {},
            childIds: [],
            updatedAt: new Date().toISOString(),
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
            const recurse = (n: InflatedComposerNode): InflatedComposerNode =>
                n.id === updated.id
                    ? updated
                    : { ...n, children: n.children.map(recurse) };

            setDraftTree(recurse(draftTree));
        }
    }

    function insertChildNode(title: string) {
        if (!draftPath.length) return;
        const parent = draftPath[draftPath.length - 1];

        const child: InflatedComposerNode = {
            id: generateUUIDSync(),
            title,
            content: '',
            entityType: 'Prompt',
            variables: {},
            childIds: [],
            updatedAt: new Date().toISOString(),
            children: [],
        };

        const updatedParent = {
            ...parent,
            childIds: [...parent.childIds, child.id],
            children: [...parent.children, child],
        };

        const newPath = [...draftPath.slice(0, -1), updatedParent, child];
        setDraftPath(newPath);

        if (draftTree) {
            const recurse = (n: InflatedComposerNode): InflatedComposerNode =>
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
