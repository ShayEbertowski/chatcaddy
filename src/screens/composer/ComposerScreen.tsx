import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerTreeView } from '../../components/composer/ComposerTreeView';
import { ComposerNode } from '../../types/composer';
import { InsertEntityModal } from '../../components/composer/modals/InsertEntityModal';
import { router } from 'expo-router';
import RichPromptEditor from '../../components/editor/RichPromptEditor';
import PromptSearch from '../../components/prompt/PromptSearch';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { generateUUID } from '../../utils/uuid/generateUUID';

export default function ComposerScreen() {
    const colors = useColors();
    const styles = getStyles(colors);
    const { rootNode, setRootNode } = useComposerStore();

    const [showInsertModal, setShowInsertModal] = useState(false);

    const [mode, setMode] = useState<'Search' | 'Create'>('Search');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<'Prompt' | 'Function' | 'Snippet'>('Prompt');

    const handleRootInsert = (newNode: ComposerNode) => {
        setRootNode(newNode);
    };

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

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        contentContainer: { padding: 16 },
        emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
