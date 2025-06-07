import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useColors } from '../../hooks/useColors';
import { composerStore } from './composerStore';
import { router } from 'expo-router';
import type { ComposerNode } from '../types/composer';

export default function ComposerDashboard() {
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
                    title="Test Hard Push"
                    onPress={() => {
                        router.push('/core/composer/builder/test123');
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
