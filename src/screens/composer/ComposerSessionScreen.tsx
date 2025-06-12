import React, { useState } from 'react';
import { View } from 'react-native';
import { ComposerNode } from '../../core/types/composer';
import { ComposerEditorView } from '../../components/composer/ComposerEditorView';

const initialNode: ComposerNode = {
    id: 'root',
    entityType: 'Prompt',
    title: 'New Prompt',
    content: '',
    variables: {},
    children: [],
};

export default function ComposerSessionScreen() {
    const [draftTree, setDraftTree] = useState<ComposerNode>(initialNode);
    const [focusedNodeId, setFocusedNodeId] = useState<string>('root');

    // 🔍 Find current node and path
    function findNodePath(
        node: ComposerNode,
        targetId: string,
        path: ComposerNode[] = []
    ): ComposerNode[] | null {
        if (node.id === targetId) return [...path, node];
        for (const child of node.children) {
            const result = findNodePath(child, targetId, [...path, node]);
            if (result) return result;
        }
        return null;
    }

    const nodePath = findNodePath(draftTree, focusedNodeId) ?? [draftTree];
    const currentNode = nodePath[nodePath.length - 1];

    return (
        <View style={{ flex: 1 }}>
            <ComposerEditorView
                treeId="draft"
                currentNode={currentNode}
                nodePath={nodePath}
                onChangeNode={(updates: Partial<ComposerNode>) => {
                    const updateTree = (node: ComposerNode): ComposerNode => {
                        if (node.id === focusedNodeId) return { ...node, ...updates };
                        return { ...node, children: node.children.map(updateTree) };
                    };
                    setDraftTree(updateTree);
                }}
                onChipPress={(chipText: string) => {
                    const newNode: ComposerNode = {
                        id: `${Date.now()}`,
                        entityType: 'Prompt',
                        title: chipText,
                        content: '',
                        variables: {},
                        children: [],
                    };

                    const addChild = (node: ComposerNode): ComposerNode => {
                        if (node.id === focusedNodeId) {
                            return { ...node, children: [...node.children, newNode] };
                        }
                        return { ...node, children: node.children.map(addChild) };
                    };

                    setDraftTree(addChild);
                    setFocusedNodeId(newNode.id);
                }}
                readOnly={false}
            />
        </View>
    );
}
