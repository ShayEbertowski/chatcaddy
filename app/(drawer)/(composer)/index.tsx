import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { router } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { useColors } from '../../../src/hooks/useColors';

// This is your Supabase record
export interface ComposerTreeRecord {
    id: string;
    name: string;
    tree_data: ComposerNode;
}

// This is what your store & UI will work with
export type ComposerTreeItem = ComposerNode & { treeId: string };


export default function ComposerScreen() {
    const colors = useColors();
    const [trees, setTrees] = useState<ComposerTreeItem[]>([]);

    useEffect(() => {
        async function fetchTrees() {
            const trees: ComposerTreeItem[] = await composerStore.getState().listTrees();
            setTrees(trees);
        }
        fetchTrees();
    }, []);


    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Logicraft Composer</Text>

                <ThemedButton
                    title="Create New Tree"
                    onPress={() => {
                        router.push('/(drawer)/(composer)/new')
                    }}
                />

                <FlatList<ComposerNode>
                    data={trees}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ThemedButton
                            title={item.title}
                            onPress={() => {
                                composerStore.getState().loadTree(item.id);
                                router.push(`/composer/${item.id}`);
                            }}
                        />
                    )}
                />

            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
