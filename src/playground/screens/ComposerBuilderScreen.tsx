// app/playground/builder/[nodeId].tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode } from '../../core/types/composer';


export default function ComposerBuilderScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const { rootNode } = composerStore();

    if (!rootNode || !nodeId) {
        return (
            <ThemedSafeArea>
                <Text>Node not found.</Text>
            </ThemedSafeArea>
        );
    }

    const currentNode = findNodeById(rootNode, nodeId);

    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <Text>Node not found in tree.</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={styles.title}>{currentNode.title}</Text>
                <Text style={styles.content}>{currentNode.content}</Text>

                <View style={styles.childrenContainer}>
                    <Text style={styles.subheading}>Children:</Text>
                    {Object.entries(currentNode.variables).map(([varName, varValue]) => {
                        if (varValue.type === 'entity') {
                            return (
                                <TouchableOpacity
                                    key={varValue.entity.id}
                                    style={styles.childButton}
                                    onPress={() =>
                                        router.push(`/playground/builder/${varValue.entity.id}`)
                                    }
                                >
                                    <Text style={styles.childButtonText}>{varValue.entity.title}</Text>
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
    childButton: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#eee',
        borderRadius: 6,
    },
    childButtonText: { fontSize: 16 },
});
