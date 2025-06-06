import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerNode } from '../../types/composer';
import { useColors } from '../../hooks/useColors';
import { router } from 'expo-router';

export default function ComposerCanvasScreen() {
    const { rootNode } = useComposerStore();
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
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Composer Canvas</Text>

                <FlatList
                    data={flattened}
                    horizontal
                    pagingEnabled
                    keyExtractor={(item) => item.node.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/playground/composer/${item.node.id}`)}
                            style={[styles.card, { backgroundColor: colors.nodeCard, borderColor: colors.nodeBorder }]}
                        >
                            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.node.title}</Text>
                            <Text style={[styles.cardContent, { color: colors.text }]} numberOfLines={4}>
                                {item.node.content}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </View>
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

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: {
        width: width - 60,
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    cardContent: { fontSize: 16 },
});
