import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerNode } from '../../types/composer';
import { router } from 'expo-router';
import RichPromptEditor from '../../components/editor/RichPromptEditor';
import PromptSearch from '../../components/prompt/PromptSearch';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { getSharedStyles } from '../../styles/shared';
import { generateSeededTree } from '../../utils/dev/devTreeSeeder';

export default function ComposerScreen() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

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
        handleRootInsert(selected);
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
        handleRootInsert(newNode);
        router.back();
    };

    // Add this useEffect to seed on first load if empty
    useEffect(() => {
        if (!rootNode) {
            (async () => {
                const tree = await generateSeededTree(3); // Or however deep you want to start with
                setRootNode(tree);
            })();
        }
    }, [rootNode]);

    return (
        <ThemedSafeArea>

            <View style={sharedStyles.toggleRow}>
                <TouchableOpacity
                    style={[
                        sharedStyles.toggleButton,
                        mode === 'Search' && sharedStyles.toggleButtonSelected,
                    ]}
                    onPress={() => setMode('Search')}
                >
                    <Text style={[
                        sharedStyles.toggleButtonText,
                        mode === 'Search' && sharedStyles.toggleButtonTextSelected,
                    ]}>
                        Select Existing
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        sharedStyles.toggleButton,
                        mode === 'Create' && sharedStyles.toggleButtonSelected,
                    ]}
                    onPress={() => setMode('Create')}
                >
                    <Text style={[
                        sharedStyles.toggleButtonText,
                        mode === 'Create' && sharedStyles.toggleButtonTextSelected,
                    ]}>
                        Create New
                    </Text>
                </TouchableOpacity>
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
