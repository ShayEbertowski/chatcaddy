import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useLocalSearchParams, router } from 'expo-router';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';
import { useColors } from '../../hooks/useColors';

export default function BuilderNodeScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const { rootNode } = composerStore();
    const colors = useColors();

    if (!rootNode || !nodeId) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>Node not found.</Text>
            </ThemedSafeArea>
        );
    }

    const currentNode = findNodeById(rootNode, nodeId);

    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>Node not found in tree.</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>{currentNode.title}</Text>
                <Text style={[styles.content, { color: colors.text }]}>{currentNode.content}</Text>

                <View style={styles.childrenContainer}>
                    <Text style={[styles.subheading, { color: colors.text }]}>Children:</Text>
                    {Object.entries(currentNode.variables).map(([varName, varValue]) => {
                        if (varValue.type === 'entity') {
                            return (
                                <TouchableOpacity
                                    key={varValue.entity.id}
                                    style={[styles.childButton, { backgroundColor: colors.card }]}
                                    onPress={() => router.push(`/playground/builder/${varValue.entity.id}`)}
                                >
                                    <Text style={[styles.childButtonText, { color: colors.text }]}>
                                        {varValue.entity.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                        return null;
                    })}
                </View>

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </View>
        </ThemedSafeArea>
    );
}

function findNodeById(node: ComposerNode, targetId: string): ComposerNode | null {
    if (node.id === targetId) return node;

    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            const result = findNodeById(val.entity, targetId);
            if (result) return result;
        }
    }
    return null;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    content: { fontSize: 16, marginBottom: 20 },
    childrenContainer: { marginTop: 20 },
    subheading: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    childButton: { padding: 10, marginVertical: 5, borderRadius: 6 },
    childButtonText: { fontSize: 16 },
});
