import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';

function findNode(node: ComposerNode, id: string): ComposerNode | null {
    if (node.id === id) return node;

    for (const value of Object.values(node.variables)) {
        if (value.type === 'entity') {
            const found = findNode(value.entity, id);
            if (found) return found;
        }
    }
    return null;
}

export default function PlaygroundNodeScreen() {
    const router = useRouter();
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const { rootNode } = composerStore();
    const colors = useColors();

    if (!rootNode || !nodeId) return <Text>Loading...</Text>;

    const node = findNode(rootNode, nodeId);
    if (!node) return <Text>Node not found.</Text>;

    return (
        <ThemedSafeArea>
            <Text style={{ fontSize: 20, color: colors.text }}>{node.title}</Text>
            <Text style={{ marginBottom: 10, color: colors.text }}>{node.content}</Text>

            {Object.entries(node.variables).map(([varName, val]) => {
                if (val.type === 'entity') {
                    return (
                        <Button
                            key={varName}
                            title={`Open child: ${val.entity.title}`}
                            onPress={() => router.push(`/playground/${val.entity.id}`)}
                        />
                    );
                }
                return (
                    <Text key={varName}>{varName}: {val.value}</Text>
                );
            })}

            <Button title="Back" onPress={() => router.back()} />
        </ThemedSafeArea>
    );
}
