import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SwipeNodeView } from './SwipeNodeView';
import { Text } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';

function findNodeRecursive(node: ComposerNode, id: string): ComposerNode | null {
    if (node.id === id) return node;
    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            const found = findNodeRecursive(val.entity, id);
            if (found) return found;
        }
    }
    return null;
}

export default function SwipeComposerScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId?: string }>();
    const { rootNode } = composerStore();

    if (!rootNode) return <Text>Loading...</Text>;

    const currentNode = nodeId ? findNodeRecursive(rootNode, nodeId) : rootNode;
    if (!currentNode) return <Text>Node not found.</Text>;

    return (
        <ThemedSafeArea>
            <SwipeNodeView node={currentNode} />
        </ThemedSafeArea>
    );
}
