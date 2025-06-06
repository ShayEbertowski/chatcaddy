import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { useColors } from '../../../src/hooks/useColors';
import { router } from 'expo-router';
import { composerStore } from '../../../src/core/composer/composerStore';

export default function ComposerDashboard() {
    const { rootNode } = composerStore();
    const colors = useColors();

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Logicraft Composer</Text>

                <ThemedButton title="Create New Tree" onPress={() => router.push('/core/composer/builder/new')} />

                {rootNode && (
                    <>
                        <ThemedButton title="Edit Tree" onPress={() => router.push(`/core/composer/builder/${rootNode.id}`)} />
                        <ThemedButton title="Preview Flattened Output" onPress={() => router.push('/core/composer/preview')} />
                    </>
                )}
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
