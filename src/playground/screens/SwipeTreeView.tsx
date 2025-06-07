import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';
import { useColors } from '../../hooks/useColors';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';

export default function SwipeTreeView() {
    const { rootNode } = composerStore();
    const colors = useColors();

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>No composer tree loaded.</Text>
            </ThemedSafeArea>
        );
    }

    const flattened = flattenComposerTree(rootNode);

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Swipe Mode</Text>

                <FlatList
                    horizontal
                    pagingEnabled
                    data={flattened}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.cardContent, { color: colors.text }]}>{item.content}</Text>
                        </View>
                    )}
                />

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </View>
        </ThemedSafeArea>
    );
}

function flattenComposerTree(root: ComposerNode): ComposerNode[] {
    const result: ComposerNode[] = [];

    function traverse(node: ComposerNode) {
        result.push(node);
        for (const key in node.variables) {
            const val = node.variables[key];
            if (val.type === 'entity') {
                traverse(val.entity);
            }
        }
    }

    traverse(root);
    return result;
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { width: width - 40, padding: 20, borderRadius: 10, marginHorizontal: 10 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    cardContent: { fontSize: 16 },
});
