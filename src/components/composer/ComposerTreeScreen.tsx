// app/composer/[treeId]/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { useComposerStore } from '../../../src/core/composer/useComposerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { useColors } from '../../../src/hooks/useColors';

export default function ComposerTreeScreen() {
    const colors = useColors();
    const { treeId } = useLocalSearchParams<{ treeId: string }>();
    const { rootNode, setRootNode, loadTree } = useComposerStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTree() {
            await loadTree(treeId);
            setLoading(false);
        }
        fetchTree();
    }, [treeId]);

    if (loading || !rootNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    const handleChildPress = (childId: string) => {
        // Later we’ll route into child nodes, but for now just log it
        console.log('Tapped child:', childId);
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {rootNode.title}
                </Text>

                <Text style={[styles.content, { color: colors.text }]}>
                    {rootNode.content}
                </Text>

                <Text style={[styles.subtitle, { color: colors.text }]}>Children:</Text>

                {rootNode.children?.length ? (
                    <FlatList
                        data={rootNode.children}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleChildPress(item.id)} style={styles.childButton}>
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
    container: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    content: {
        fontSize: 16,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    childButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333',
        marginBottom: 8,
    },
});
