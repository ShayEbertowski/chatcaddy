import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerNode } from '../../types/composer';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedButton } from '../../components/ui/ThemedButton';

function findNode(node: ComposerNode, id: string): ComposerNode | null {
    if (node.id === id) return node;
    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            const found = findNode(val.entity, id);
            if (found) return found;
        }
    }
    return null;
}

export default function BuilderNodeScreen() {
    const router = useRouter();
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const { rootNode } = useComposerStore();

    if (!rootNode || !nodeId) return <ThemedText>Loading...</ThemedText>;

    const node = findNode(rootNode, nodeId);
    if (!node) return <ThemedText>Node not found.</ThemedText>;

    return (
        <ThemedSafeArea>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>{node.title}</ThemedText>
            <ThemedText>{node.content}</ThemedText>

            {Object.entries(node.variables).map(([varName, val]) => {
                if (val.type === 'entity') {
                    return (
                        <ThemedButton
                            key={varName}
                            title={`Open child: ${val.entity.title}`}
                            onPress={() => router.push(`/playground/builder/${val.entity.id}`)}
                        />
                    );
                }
                return (
                    <ThemedText key={varName}>{varName}: {val.value}</ThemedText>
                );
            })}

            <ThemedButton title="Back" onPress={() => router.back()} colorKey="softError" />
        </ThemedSafeArea>
    );
}
