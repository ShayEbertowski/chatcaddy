import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { flattenTree } from '../../utils/flattenTree';
import { useComposerStore } from '../../stores/useComposerStore';
import { ThemedText } from '../../components/ui/ThemedText';

export default function SwipeTreeView() {
    const { rootNode } = useComposerStore();

    if (!rootNode) {
        return <ThemedText>Loading tree...</ThemedText>;
    }

    const flattened = flattenTree(rootNode);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {flattened.map((node) => (
                <View key={node.id} style={styles.node}>
                    <ThemedText style={{ fontWeight: 'bold' }}>{node.title}</ThemedText>
                    <ThemedText>{node.content}</ThemedText>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    node: {
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
    },
});
