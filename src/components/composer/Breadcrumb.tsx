import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ComposerNode } from '../../core/types/composer';
import { router } from 'expo-router';

interface Props {
    treeId: string;
    rootNode: ComposerNode;
    currentNodeId: string;
}

export function Breadcrumb({ treeId, rootNode, currentNodeId }: Props) {
    const colors = useColors();

    // Walk the tree to find full path to current node
    const buildPath = (node: ComposerNode, path: ComposerNode[] = []): ComposerNode[] | null => {
        if (node.id === currentNodeId) return [...path, node];
        for (const child of node.children ?? []) {
            const result = buildPath(child, [...path, node]);
            if (result) return result;
        }
        return null;
    };

    const path = buildPath(rootNode) ?? [rootNode]; // fallback to root if unknown

    return (
        <View style={styles.container}>
            {path.map((node, index) => (
                <TouchableOpacity
                    key={node.id}
                    onPress={() => router.push(`/(drawer)/(composer)/${treeId}/${node.id}`)}
                    style={styles.item}
                >
                    <Text style={[styles.text, { color: colors.text }]}>
                        {node.title || 'Untitled'}
                        {index < path.length - 1 && ' / '}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    item: { flexDirection: 'row' },
    text: { fontSize: 16 },
});
