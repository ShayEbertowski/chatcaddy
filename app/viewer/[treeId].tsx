import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { composerStore } from '../../src/core/composer/composerStore';
import { ComposerNode } from '../../src/core/types/composer';
import { useColors } from '../../src/hooks/useColors';
import { ComposerTreeView } from '../../src/components/composer/ComposerTreeView';
import { flattenTree } from '../../src/utils/composer/flattenTree';

const { width, height } = Dimensions.get('window');

export default function SwipeViewer() {
    const colors = useColors();
    const { treeId } = useLocalSearchParams<{ treeId: string }>();
    const { rootNode, loadTree } = composerStore();
    const [loading, setLoading] = useState(true);
    const [flatNodes, setFlatNodes] = useState<ComposerNode[]>([]);

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
        if (rootNode) {
            const flattened = flattenTree(rootNode);
            setFlatNodes(flattened);
        }
    }, [rootNode]);

    if (loading || !rootNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <FlatList
                data={flatNodes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.page, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.content, { color: colors.text }]}>{item.content}</Text>
                        <ComposerTreeView node={item} />
                    </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    page: { width, height, justifyContent: 'center', alignItems: 'center', padding: 32 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    content: { fontSize: 16 },
});
