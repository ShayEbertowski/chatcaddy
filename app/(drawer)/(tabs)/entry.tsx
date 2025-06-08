import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { Entity, EntityType } from '../../../src/types/entity';
import { router } from 'expo-router';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const [mode, setMode] = useState<'Browse' | 'New'>('Browse');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<EntityType>('Prompt');
    const [hasEntities, setHasEntities] = useState<boolean>(true); // Placeholder for now

    useEffect(() => {
        // Future: load actual entity list here from your store
        // setHasEntities(yourEntityList.length > 0);
    }, []);

    const handleSelectNode = async (prompt: Entity) => {
        const newTreeId = generateUUIDSync();

        const rootNode: ComposerNode = {
            id: newTreeId,
            entityType: 'Prompt',
            title: prompt.title,
            content: '', // Or optionally pull prompt.content if you want
            variables: {},
            children: [],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: prompt.title,
            rootNode,
            rootPromptId: prompt.id,  // optional field for reference
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${newTreeId}`);
    };

    const handleCreate = () => {
        // TODO: still need this for richprompt section
    }

    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                {/* Toggle Row */}
                <View style={sharedStyles.toggleRow}>
                    <TouchableOpacity
                        style={[
                            sharedStyles.toggleButton,
                            mode === 'Browse' && sharedStyles.toggleButtonSelected,
                        ]}
                        onPress={() => setMode('Browse')}
                    >
                        <Text
                            style={[
                                sharedStyles.toggleButtonText,
                                mode === 'Browse' && sharedStyles.toggleButtonTextSelected,
                            ]}
                        >
                            Browse
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            sharedStyles.toggleButton,
                            mode === 'New' && sharedStyles.toggleButtonSelected,
                        ]}
                        onPress={() => setMode('New')}
                    >
                        <Text
                            style={[
                                sharedStyles.toggleButtonText,
                                mode === 'New' && sharedStyles.toggleButtonTextSelected,
                            ]}
                        >
                            New
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                {mode === 'Browse' ? (
                    hasEntities ? (
                        <PromptSearch onSelect={handleSelectNode} />
                    ) : (
                        <EmptyState
                            title="No Prompts Yet"
                            subtitle="You haven't created any prompts. Start your first one below."
                            buttonLabel="Create First Prompt"
                            onButtonPress={() => setMode('New')}
                        />
                    )
                ) : (
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View style={{ marginTop: 16 }}>
                            <RichPromptEditor
                                text={newContent}
                                onChangeText={setNewContent}
                                entityType={entityType}
                                onChangeEntityType={setEntityType}
                            />
                        </View>

                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.primary,
                                padding: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginTop: 16,
                            }}
                            onPress={handleCreate}
                        >
                            <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ThemedSafeArea>
    );
}
