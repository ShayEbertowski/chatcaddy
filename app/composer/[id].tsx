import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComposerNodeView } from '../../src/components/composer/ComposerNodeView';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { useComposerStore } from '../../src/stores/useComposerStore';
import { ComposerNode } from '../../src/types/composer';

export default function ComposerNodeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { root } = useComposerStore();

    const findNode = (node: ComposerNode): ComposerNode | undefined => {
        if (node.id === id) return node;
        return node.children?.map(findNode).find((n) => n);
    };

    const node = id ? findNode(root) : root;
    if (!node) return <ThemedSafeArea><Text>Node not found</Text></ThemedSafeArea>;

    return (
        <ThemedSafeArea>
            <ComposerNodeView node={node} />
        </ThemedSafeArea>
    );
}
