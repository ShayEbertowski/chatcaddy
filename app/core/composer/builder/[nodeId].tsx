import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { generateUUIDSync } from '../../../../src/utils/uuid/generateUUIDSync';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { ComposerNode } from '../../../../src/core/types/composer';

export default function ComposerBuilder() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const colors = useColors();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentNode, setCurrentNode] = useState<ComposerNode | null>(null);

    useEffect(() => {
        if (nodeId === 'new') {
            setTitle('');
            setContent('');
            setCurrentNode(null);
        } else {
            const state = composerStore.getState();
            const root = state.rootNode;
            if (!root) return;

            if (root.id === nodeId) {
                setTitle(root.title);
                setContent(root.content);
                setCurrentNode(root);
            }
        }
    }, [nodeId]);

    const handleSave = async () => {
        if (nodeId === 'new') {
            const id = generateUUIDSync();
            const newNode: ComposerNode = {
                id,
                entityType: 'Prompt',
                title,
                content,
                variables: {},
                children: [],
            };
            composerStore.setState({ rootNode: newNode });
            await composerStore.getState().saveTree(title);
        } else if (currentNode) {
            const updatedNode: ComposerNode = {
                ...currentNode,
                title,
                content,
            };
            composerStore.setState({ rootNode: updatedNode });
            await composerStore.getState().saveTree(title);
        }

        router.replace('/app/composer');
    };

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {nodeId === 'new' ? 'Create New Tree' : 'Edit Tree'}
                </Text>

                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor={colors.border}
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />

                <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Content"
                    placeholderTextColor={colors.border}
                    multiline
                    style={[styles.input, { color: colors.text, borderColor: colors.border, height: 120 }]}
                />

                <ThemedButton title="Save" onPress={handleSave} />
                <ThemedButton title="Cancel" onPress={() => router.back()} />
            </ScrollView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 20 },
});
