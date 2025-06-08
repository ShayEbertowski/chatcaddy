import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { EntityType } from '../../../src/types/entity';


export default function ComposerIndexScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const [mode, setMode] = useState<'Search' | 'Create'>('Search');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<EntityType>('Prompt');

    function handlePromptSelect(prompt: any) {
        console.log('Selected existing prompt:', prompt);
        // future: navigate into composer tree here
    }

    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                <View style={sharedStyles.toggleRow}>
                    <TouchableOpacity
                        style={[
                            sharedStyles.toggleButton,
                            mode === 'Search' && sharedStyles.toggleButtonSelected,
                        ]}
                        onPress={() => setMode('Search')}
                    >
                        <Text
                            style={[
                                sharedStyles.toggleButtonText,
                                mode === 'Search' && sharedStyles.toggleButtonTextSelected,
                            ]}
                        >
                            Search
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            sharedStyles.toggleButton,
                            mode === 'Create' && sharedStyles.toggleButtonSelected,
                        ]}
                        onPress={() => setMode('Create')}
                    >
                        <Text
                            style={[
                                sharedStyles.toggleButtonText,
                                mode === 'Create' && sharedStyles.toggleButtonTextSelected,
                            ]}
                        >
                            Create
                        </Text>
                    </TouchableOpacity>
                </View>

                {mode === 'Search' ? (
                    <PromptSearch onSelect={handlePromptSelect} />
                ) : (
                    <RichPromptEditor
                        text={newContent}
                        onChangeText={setNewContent}
                        entityType={entityType}
                        onChangeEntityType={setEntityType}
                    />
                )}
            </View>
        </ThemedSafeArea>
    );
}
