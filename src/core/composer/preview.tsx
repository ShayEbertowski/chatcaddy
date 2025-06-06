import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { useColors } from '../../../src/hooks/useColors';
import { composerStore } from '../../../src/core/composer/composerStore';
import { expandComposerTree } from '../../../src/core/composer/utils/expandComposerTree';
import { compileExpandedNodesToPrompt } from '../../../src/core/composer/utils/compileExpandedNodesToPrompt';
import { router } from 'expo-router';

export default function ComposerPreview() {
    const { rootNode } = composerStore.getState();
    const colors = useColors();

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>No Composer tree loaded.</Text>
            </ThemedSafeArea>
        );
    }

    const expanded = expandComposerTree(rootNode);
    const compiled = compileExpandedNodesToPrompt(expanded);

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Compiled Prompt Output</Text>
                <Text style={[styles.prompt, { color: colors.text }]}>{compiled}</Text>
                <ThemedButton title="Back" onPress={() => router.back()} />
            </ScrollView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    prompt: { fontSize: 16 },
});
