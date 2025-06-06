import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';

export default function ComposerTreeExplorer() {
    const { rootNode } = composerStore();
    const colors = useColors();

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>No composer tree loaded.</Text>
            </ThemedSafeArea>
        );
    }

    const flattened = flattenWithDepth(rootNode);

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Composer Tree Explorer</Text>

                {flattened.map(({ node, depth }) => (
                    <TouchableOpacity
                        key={node.id}
                        style={[styles.nodeRow, { paddingLeft: depth * 20, backgroundColor: colors.nodeCard }]}
                        onPress={() => router.push(`/playground/composer/${node.id}`)}
                    >
                        <Text style={[styles.nodeText, { color: colors.text }]}>
                            {depth === 0 ? '🔷' : '↳'} {node.title}
                        </Text>
                    </TouchableOpacity>
                ))}

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </ScrollView>
        </ThemedSafeArea>
    );
}

function flattenWithDepth(root: ComposerNode): { node: ComposerNode; depth: number }[] {
    const result: { node: ComposerNode; depth: number }[] = [];

    function traverse(node: ComposerNode, depth: number) {
        result.push({ node, depth });
        for (const key in node.variables) {
            const val = node.variables[key];
            if (val.type === 'entity') {
                traverse(val.entity, depth + 1);
            }
        }
    }

    traverse(root, 0);
    return result;
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    nodeRow: { marginVertical: 8, padding: 10, borderRadius: 8 },
    nodeText: { fontSize: 16 },
});
