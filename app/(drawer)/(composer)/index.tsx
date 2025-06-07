import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { router } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { useColors } from '../../../src/hooks/useColors';

export default function ComposerScreen() {
    const colors = useColors();
    const [trees, setTrees] = useState<ComposerNode[]>([]);

    useEffect(() => {
        async function fetchTrees() {
            const trees = await composerStore.getState().listTrees();
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
                        router.push('/core/composer/builder/new');
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
                                router.push(`/core/composer/builder/${item.id}`);
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
