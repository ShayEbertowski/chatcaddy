import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { composerStore } from '../../core/composer/composerStore';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { expandComposerTree, ExpandedNode } from '../../core/utils/expandComposerTree';
import { compileExpandedNodesToPrompt } from '../../core/utils/compileExpandedNodesToPrompt';

export default function FlattenPreviewScreen() {
    const { rootNode } = composerStore();
    const colors = useColors();

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>No composer tree loaded.</Text>
            </ThemedSafeArea>
        );
    }

    const expanded = expandComposerTree(rootNode);
    const compiledPrompt = compileExpandedNodesToPrompt(expanded);

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Flatten Preview</Text>

                {expanded.map((node, index) => (
                    <View key={node.id} style={styles.nodeContainer}>
                        <Text style={[styles.nodeTitle, { color: colors.text }]}>
                            [{index + 1}] {node.title}
                        </Text>
                        <Text style={[styles.nodeContent, { color: colors.text }]}>
                            {node.resolvedContent}
                        </Text>
                    </View>
                ))}

                <View style={styles.finalContainer}>
                    <Text style={[styles.finalTitle, { color: colors.text }]}>Final Compiled Prompt:</Text>
                    <Text style={[styles.finalContent, { color: colors.text }]}>{compiledPrompt}</Text>
                </View>

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </ScrollView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    nodeContainer: { marginBottom: 20 },
    nodeTitle: { fontSize: 18, fontWeight: 'bold' },
    nodeContent: { fontSize: 16, marginTop: 5 },
    finalContainer: { marginTop: 30 },
    finalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    finalContent: { fontSize: 16, fontStyle: 'italic' },
});
