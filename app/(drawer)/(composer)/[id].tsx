import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComposerNodeView } from '../../../src/components/composer/ComposerNodeView';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';

export default function ComposerNodeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { rootNode } = composerStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        composerStore.getState().loadTree(id)
            .catch((err) => console.error('Error loading tree:', err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <ThemedSafeArea>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            </ThemedSafeArea>
        );
    }

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text>No root node loaded</Text>
            </ThemedSafeArea>
        );
    }

    const findNode = (node: ComposerNode): ComposerNode | undefined => {
        if (node.id === id) return node;
        return node.children?.map(findNode).find((n) => n);
    };

    const node = id ? findNode(rootNode) : rootNode;

    if (!node) {
        return (
            <ThemedSafeArea>
                <Text>Node not found</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <ComposerNodeView node={node} />
        </ThemedSafeArea>
    );
}
