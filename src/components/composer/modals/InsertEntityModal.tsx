// app/insert-entity/index.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColors } from '../../../hooks/useColors';
import { ComposerNode } from '../../../types/composer';
import { generateUUID } from '../../../utils/uuid/generateUUID';
import RichPromptEditor from '../../editor/RichPromptEditor';
import PromptSearch from '../../prompt/PromptSearch';
import { ThemedSafeArea } from '../../shared/ThemedSafeArea';
import { ThemedButton } from '../../ui/ThemedButton';

interface Props {
    visible: boolean;
    onClose: () => void;
    onInsert: (newEntity: ComposerNode) => void;
}

export function InsertEntityModal({ visible, onClose, onInsert }: Props) {
    const router = useRouter();
    const colors = useColors();

    const [mode, setMode] = useState<'Search' | 'Create'>('Search');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<'Prompt' | 'Function' | 'Snippet'>('Prompt');

    const handleSelectExisting = (selected: ComposerNode) => {
        // TODO: emit selected back to composer
        router.back();
    };

    const handleCreateNew = async () => {
        const newNode: ComposerNode = {
            id: await generateUUID(),
            entityType,
            title: newTitle,
            content: newContent,
            variables: {},
        };
        // TODO: emit created node back to composer
        router.back();
    };

    return (
        <ThemedSafeArea>

            <View style={styles.toggleRow}>
                <ThemedButton
                    title="Select Existing"
                    onPress={() => setMode('Search')}
                />
                <ThemedButton
                    title="Create New"
                    onPress={() => setMode('Create')}
                />
            </View>

            {mode === 'Search' ? (
                <PromptSearch onSelect={handleSelectExisting} />
            ) : (
                <>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter title"
                        value={newTitle}
                        onChangeText={setNewTitle}
                    />

                    <RichPromptEditor
                        text={newContent}
                        onChangeText={setNewContent}
                        entityType={entityType}
                        onChangeEntityType={setEntityType}
                    />

                    <ThemedButton title="Create & Insert" onPress={handleCreateNew} style={{ marginTop: 20 }} />
                </>
            )}

            <ThemedButton title="Cancel" onPress={() => router.back()} colorKey="softError" style={{ marginTop: 12 }} />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    textInput: {
        marginBottom: 10,
        borderWidth: 1,
        padding: 8,
    },
});
