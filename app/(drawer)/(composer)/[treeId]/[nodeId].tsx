import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../../../src/hooks/useColors';
import { ComposerTreeView } from '../../../../src/components/composer/ComposerTreeView';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../../src/core/types/composer';

export default function ComposerNodeScreen() {
    const colors = useColors();
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
    const { rootNode, loadTree } = composerStore();
    const [loading, setLoading] = useState(true);
    const [currentNode, setCurrentNode] = useState<ComposerNode | null>(null);

    useEffect(() => {
        async function fetch() {
            if (!rootNode) {
                await loadTree(treeId);
            }
            setLoading(false);
        }
        fetch();
    }, [treeId]);

    useEffect(() => {
        if (!rootNode) return;

        const foundNode = findNode(rootNode, nodeId);
        setCurrentNode(foundNode);
    }, [rootNode, nodeId]);

    function findNode(node: ComposerNode, searchId: string): ComposerNode | null {
        if (node.id === searchId) return node;
        for (const child of node.children) {
            const found = findNode(child, searchId);
            if (found) return found;
        }
        return null;
    }

    if (loading || !currentNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <ComposerTreeView node={currentNode} />

                <Text style={[styles.subtitle, { color: colors.text }]}>Children:</Text>

                {currentNode.children?.length ? (
                    <FlatList
                        data={currentNode.children}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.childButton}
                                onPress={() => router.push(`/composer/${treeId}/${item.id}`)}
                            >
                                <Text style={{ color: colors.text }}>{item.title || '(Untitled)'}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={{ color: colors.text }}>No children yet.</Text>
                )}
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    childButton: { padding: 12, borderRadius: 8, backgroundColor: '#333', marginBottom: 8 },
});
