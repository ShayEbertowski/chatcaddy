import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ComposerNodeView } from '../../../../src/components/composer/ComposerNodeView';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../../src/core/types/composer';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { Breadcrumb } from '../../../../src/components/composer/Breadcrumb';

export default function ComposerNodeScreen() {
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
    const { rootNode } = composerStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!treeId) return;
        setLoading(true);

        composerStore.getState().loadTree(treeId)
            .catch((err) => console.error('Error loading tree:', err))
            .finally(() => setLoading(false));
    }, [treeId]);

    const findNode = (node: ComposerNode): ComposerNode | undefined => {
        if (node.id === nodeId) return node;
        return node.children?.map(findNode).find((n) => n);
    };

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

    const currentNode = nodeId ? findNode(rootNode) : rootNode;

    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <Text>Node not found</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <Breadcrumb treeId={treeId} rootNode={rootNode} currentNodeId={nodeId} />

            <ComposerNodeView node={currentNode} />

            {/** Simple breadcrumb button: navigate up to parent */}
            <ThemedButton
                title="Back to Root"
                onPress={() => router.push(`/(drawer)/(composer)/${treeId}/${rootNode.id}`)}
            />
        </ThemedSafeArea>
    );
}
