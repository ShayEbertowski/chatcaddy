import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState'; // Adjust your import path
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { EntityType } from '../../../src/types/entity';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const [mode, setMode] = useState<'Browse' | 'New'>('Browse');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<EntityType>('Prompt');

    // Placeholder state: replace with real check against your EntityStore or ComposerStore
    const [hasEntities, setHasEntities] = useState<boolean>(true);

    useEffect(() => {
        // Future: load actual entity list here from your store
        // setHasEntities(yourEntityList.length > 0);
    }, []);

    function handlePromptSelect(prompt: any) {
        console.log('Selected existing prompt:', prompt);
    }

    function handleCreate() {
        console.log('Creating new entity:', { newContent, entityType });
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
                        <PromptSearch onSelect={handlePromptSelect} />
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
