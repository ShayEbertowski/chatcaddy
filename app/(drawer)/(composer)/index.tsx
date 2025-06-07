import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { router } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { composerStore } from '../../../src/core/composer/composerStore';
import { useColors } from '../../../src/hooks/useColors';
import { ComposerTreeItem } from '../../../src/core/types/composer';


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

                <FlatList<ComposerTreeItem>
                    data={trees}
                    keyExtractor={(item) => item.treeId}
                    renderItem={({ item }) => (
                        <ThemedButton
                            title={item.title}
                            onPress={() => {
                                composerStore.getState().loadTree(item.treeId);
                                router.push(`/(drawer)/(composer)/${item.treeId}`);
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
