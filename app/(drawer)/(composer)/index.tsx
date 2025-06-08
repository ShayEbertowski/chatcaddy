import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import ToggleRow from '../../../src/components/shared/ToggleRow';
import SearchInput from '../../../src/components/shared/SearchInput';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import { useColors } from '../../../src/hooks/useColors';
import { EntityType } from '../../../src/types/entity';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const styles = getStyles(colors);

    const [mode, setMode] = useState<'Browse' | 'New'>('Browse');
    const [newContent, setNewContent] = useState('');
    const [entityType, setEntityType] = useState<EntityType>('Prompt');
    const [searchText, setSearchText] = useState('');

    const handleModeChange = (val: string) => setMode(val as 'Browse' | 'New');


    function handleCreate() {
        console.log('Creating new entity:', { newContent, entityType });
        // TODO: hook into your persistence layer here
    }

    function handlePromptSelect(prompt: any) {
        console.log('Selected existing prompt:', prompt);
    }

    return (
        <ThemedSafeArea disableTopInset>
            <View style={styles.container}>


                <ToggleRow
                    options={[{ label: 'Browse', value: 'Browse' }, { label: 'New', value: 'New' }]}
                    value={mode}
                    onChange={handleModeChange}
                />


                {mode === 'Browse' ? (
                    <>
                        <SearchInput value={searchText} onChange={setSearchText} placeholder="Search for a prompt..." />
                        {/* 
              TODO: Hook up actual search results and empty state display here.
              For now you're just wiring the input.
            */}
                    </>
                ) : (
                    <>
                        <RichPromptEditor
                            text={newContent}
                            onChangeText={setNewContent}
                            entityType={entityType}
                            onChangeEntityType={setEntityType}
                        />

                        <View style={styles.saveButtonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </ThemedSafeArea>
    );
}

import { TouchableOpacity, Text } from 'react-native';

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
        },
        saveButtonContainer: {
            marginTop: 24,
        },
        saveButton: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 10,
            alignItems: 'center',
        },
        saveButtonText: {
            color: colors.onPrimary,
            fontWeight: '600',
            fontSize: 16,
        },
    });
