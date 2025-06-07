import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useColors } from '../../hooks/useColors';
import { composerStore } from './composerStore';
import { expandComposerTree } from './utils/expandComposerTree';
import { compileExpandedNodesToPrompt } from './utils/compileExpandedNodesToPrompt';
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
