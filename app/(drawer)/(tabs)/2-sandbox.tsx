import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import SavePromptModal from '../../../src/components/modals/SavePromptModal';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { PromptResult } from '../../../src/components/prompt/PromptResult';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { runPrompt } from '../../../src/utils/prompt/runPrompt';
import { resolveVariableDisplayValue } from '../../../src/utils/variables/variables';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { useEditorStore } from '../../../src/stores/useEditorStore';
import { useEntityStore } from '../../../src/stores/useEntityStore';
import { loadVariablesIntoStore } from '../../../src/utils/prompt/promptManager';
import { extractEntityText } from '../../../src/utils/prompt/extractEntityText';
import { Entity, EntityType } from '../../../src/types/entity';
import { v4 as uuidv4 } from 'uuid';
import { generateSmartTitle } from '../../../src/utils/prompt/generateSmartTitle';

export default function Sandbox() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const router = useRouter();

    const entityType = useEditorStore((s) => s.entityType);
    const editingEntity = useEditorStore((s) => s.editingEntity);
    const rawParams = useLocalSearchParams();
    const editId = Array.isArray(rawParams.editId) ? rawParams.editId[0] : rawParams.editId;
    const setEntityType = useEditorStore((s) => s.setEntityType);
    const clearEditingEntity = useEditorStore((s) => s.clearEditingEntity);

    const [inputText, setInputText] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [confirmHandler, setConfirmHandler] = useState<() => void>(() => () => { });

    useEffect(() => {
        if (!editId) {
            resetEditor();
        }
    }, [editId]);

    useEffect(() => {
        if (editingEntity) {
            const extracted = extractEntityText(editingEntity);
            setInputText(extracted);
            loadVariablesIntoStore(editingEntity.variables);
            setPromptTitle(editingEntity.title || '');
            setSelectedFolder(editingEntity.folder || 'Uncategorized');
            setEntityType(editingEntity.entityType || 'Prompt');
        }
    }, [editingEntity]);

    useEffect(() => {
        setIsDirty(true);
    }, [inputText, promptTitle, selectedFolder, entityType]);

    const resetEditor = () => {
        setInputText('');
        setPromptTitle('');
        setResponse('');
        setSelectedFolder('Uncategorized');
        setEntityType('Prompt');
        useVariableStore.getState().clearAll();
        clearEditingEntity();
        setIsDirty(false);
    };

    const prepareEntityToSave = (): Entity => {
        return {
            id: editId ?? uuidv4(),
            title: promptTitle,
            folder: selectedFolder,
            entityType: entityType,
            variables: useVariableStore.getState().values,
            ...(entityType === 'Prompt' ? { content: inputText } : { content: inputText }),
        };
    };

    const handleSave = async () => {
        try {
            setIsGeneratingTitle(true);
            const smartTitle = await generateSmartTitle(inputText);
            setPromptTitle(smartTitle);

            setConfirmHandler(() => async () => {
                const entityToSave = prepareEntityToSave();
                await useEntityStore.getState().addOrUpdateEntity(entityToSave);
                setShowConfirmSaveModal(false);
                resetEditor();
            });

            setShowConfirmSaveModal(true);
        } catch (error: any) {
            Alert.alert('Error generating smart title', error?.message || 'Unknown error');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');
        const rawValues = useVariableStore.getState().values;
        const filledValues: Record<string, string> = Object.fromEntries(
            Object.entries(rawValues).map(([key, val]) => [key, resolveVariableDisplayValue(val)])
        );
        const result = await runPrompt(inputText, filledValues);
        if ('error' in result) {
            Alert.alert('Error', result.error);
        } else {
            setResponse(result.response);
        }
        setIsLoading(false);
    };

    const saveDisabled = () => {
        if (!inputText.trim()) return true;
        if (!editingEntity) return false;

        const extracted = extractEntityText(editingEntity);
        const entityChanged = (
            inputText !== extracted ||
            promptTitle !== (editingEntity?.title || '') ||
            entityType !== editingEntity?.entityType
        );

        return !entityChanged;
    };

    useEffect(() => {
        if (editId) {
            const entity = useEntityStore.getState().entities.find(e => e.id === editId);
            if (entity) {
                useEditorStore.getState().setEditingEntity(entityType, entity);
            }
        }
    }, [editId]);


    return (
        <ThemedSafeArea>
            <Stack.Screen options={{ title: 'Prompt Sandbox' }} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
                <RichPromptEditor
                    text={inputText}
                    onChangeText={setInputText}
                    entityType={entityType}
                    onChangeEntityType={setEntityType}
                />
                <CollapsibleSection
                    title="response"
                    isOpen={showResponse}
                    onToggle={() => setShowResponse(prev => !prev)}
                >
                    <PromptResult response={response} isLoading={isLoading} onClear={() => setResponse('')} />
                </CollapsibleSection>
            </ScrollView>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, {
                        backgroundColor: saveDisabled() ? colors.disabled : colors.card,
                        borderColor: colors.accent,
                        borderWidth: 1
                    }]}
                    onPress={handleSave}
                    disabled={saveDisabled()}
                >
                    <MaterialIcons name="save-alt" size={18} color={colors.accent} />
                    <Text style={[styles.buttonText, { color: colors.accent }]}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRun}>
                    <MaterialIcons name="play-arrow" size={18} color={colors.onPrimary} />
                    <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Run</Text>
                </TouchableOpacity>
            </View>

            <SavePromptModal
                visible={showConfirmSaveModal}
                title={promptTitle}
                prompt={inputText}
                onChangeTitle={setPromptTitle}
                onCancel={() => setShowConfirmSaveModal(false)}
                onConfirm={confirmHandler}
                selectedFolder={selectedFolder}
                loading={isGeneratingTitle}
            />
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        scroll: { padding: 20, paddingBottom: 100 },
        buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginHorizontal: 12 },
        button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, gap: 6 },
        buttonText: { fontSize: 16, fontWeight: '600' },
    });
