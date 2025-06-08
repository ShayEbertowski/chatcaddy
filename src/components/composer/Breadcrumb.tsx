import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ComposerNode } from '../../core/types/composer';
import { router } from 'expo-router';
import { getNodePath } from '../../utils/composer/pathUtils';

interface Props {
    treeId: string;
    rootNode: ComposerNode;
    currentNodeId: string;
}

export function Breadcrumb({ treeId, rootNode, currentNodeId }: Props) {
    const colors = useColors();

    const path = getNodePath(rootNode, currentNodeId);

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
