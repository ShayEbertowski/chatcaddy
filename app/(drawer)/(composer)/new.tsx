import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { useColors } from '../../../src/hooks/useColors';
import { composerStore } from '../../../src/core/composer/composerStore';
import { router } from 'expo-router';
import { generateUUID } from '../../../src/utils/uuid/generateUUID';
import { ComposerNode } from '../../../src/core/types/composer';

export default function NewComposerTreeScreen() {
    const colors = useColors();
    const [name, setName] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) return;

        // Create a new root node (empty tree scaffold)
        const newRoot: ComposerNode = {
            id: await generateUUID(),
            entityType: 'Prompt',
            title: name,
            content: '',
            variables: {},
            children: [],
        };

        // Set root node into Zustand store
        composerStore.getState().setRootNode(newRoot);

        // Persist new tree
        const id = await composerStore.getState().saveTree(name);

        // Navigate to authoring screen
        router.push(`/(drawer)/(composer)/${id}`);
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter tree name"
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholderTextColor={colors.border}
                />
                <ThemedButton title="Create Tree" onPress={handleCreate} />
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', gap: 20 },
    input: { borderWidth: 1, padding: 10, borderRadius: 8 },
});
