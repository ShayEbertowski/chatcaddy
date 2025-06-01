import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { useRouter, useLocalSearchParams } from 'expo-router';

import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import SavePromptModal from '../../../src/components/modals/SavePromptModal';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';

import { useColors } from '../../../src/hooks/useColors';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { getSharedStyles } from '../../../src/styles/shared';
import { Prompt, VariableValue } from '../../../src/types/prompt';
import { runPrompt } from '../../../src/utils/prompt/runPrompt';
import { resolveVariableDisplayValue } from '../../../src/utils/variables/variables';
import { usePromptEditorStore } from '../../../src/stores/usePromptEditorStore';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { usePromptStore } from '../../../src/stores/usePromptsStore';
import { getSmartTitle } from '../../../src/utils/prompt/promptManager';

export default function Sandbox() {
    const [inputText, setInputText] = useState('');
    const [response, setResponse] = useState('');
    const [hasRun, setHasRun] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [promptTitle, setPromptTitle] = useState('');
    const [autoSuggestTitle, setAutoSuggestTitle] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const [promptsLoaded, setPromptsLoaded] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

    const router = useRouter();
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const currentVariables = useVariableStore.getState().values;

    const editingPrompt = usePromptEditorStore((s) => s.editingPrompt);
    const target = usePromptEditorStore((s) => s.variableInsertTarget);
    const isEditing = !!editingPrompt?.id;
    const editId = usePromptEditorStore((s) => s.editId);
    const autoRun = usePromptEditorStore((s) => s.autoRun);

    const saveButtonDisabled = inputText.trim() === '';
    const saveButtonIconColor = saveButtonDisabled ? colors.border : colors.accent;
    const saveButtonTextColor = saveButtonDisabled ? colors.border : colors.accent;
    const prompts = usePromptStore((state) => state.prompts);
    const addOrUpdatePrompt = usePromptStore((state) => state.addOrUpdatePrompt);
    const params = useLocalSearchParams();
    const initialEntityType = (params.entityType as 'Prompt' | 'Function' | 'Snippet') ?? 'Prompt';
    const entityType = usePromptEditorStore((s) => s.entityType);
    const setEntityType = usePromptEditorStore((s) => s.setEntityType);

    const isDup = prompts.some(
        (p) => p.content.trim() === inputText.trim() && p.folder === selectedFolder
    );

    useEffect(() => {
        if (target && editingPrompt) {
            useVariableStore.getState().setVariable(target, {
                type: 'prompt',
                promptId: editingPrompt.id,
                promptTitle: editingPrompt.title,
            });
        }
    }, [target, editingPrompt]);



    useEffect(() => {
        if (editingPrompt?.variables) {
            Object.entries(editingPrompt.variables).forEach(([key, value]: [string, VariableValue]) => {
                if (value.type === 'prompt') {
                    useVariableStore.getState().setVariable(key, {
                        type: 'prompt',
                        promptId: value.promptId,
                        promptTitle: value.promptTitle,
                    });
                } else if (value.type === 'string') {
                    useVariableStore.getState().setVariable(key, {
                        type: 'string',
                        value: value.value ?? '',
                    });
                }
            });

        }
    }, [editingPrompt]);

    useEffect(() => {
        if (editingPrompt?.content) {
            setInputText(editingPrompt.content);
            if (autoRun) {
                handleRun();
            }
        }
    }, [editingPrompt, autoRun]);


    useEffect(() => {
        if (autoSuggestTitle) {
            const suggested = inputText.trim().split(/\s+/).slice(0, 5).join(' ');
            setPromptTitle((prev) => {
                const wasAuto = prev === '' || prev === suggested;
                return wasAuto ? suggested : prev;
            });
        }
    }, [inputText, autoSuggestTitle]);

    const handleRun = async () => {
        setHasRun(true);
        setShowResponse(true);
        setIsLoading(true);
        setResponse('');

        const rawValues = useVariableStore.getState().values;

        const filledValues: Record<string, string> = Object.fromEntries(
            Object.entries(rawValues).map(([key, val]) => [key, resolveVariableDisplayValue(val)])
        ); const result = await runPrompt(inputText, filledValues);

        if ('error' in result) {
            Alert.alert('Error', result.error);
        } else {
            setResponse(result.response);
        }

        setIsLoading(false);
    };

    const handleSavePrompt = async () => {
        if (isDup) {
            Alert.alert('Duplicate', 'This prompt already exists.');
            return;
        }

        const title = await getSmartTitle(inputText);
        setPromptTitle(title);
        setShowConfirmSaveModal(true);
    };

    const preparePromptToSave = ({
        id,
        inputText,
        title,
        folder,
        isEdit,
        type,
        variables,
    }: {
        id?: string;
        inputText: string;
        title: string;
        folder: string;
        isEdit: boolean;
        type: 'Prompt' | 'Function' | 'Snippet';
        variables: Record<string, VariableValue>;
    }): Prompt => {
        return {
            id: id ?? (uuid.v4() as string),
            content: inputText,
            title,
            folder,
            type,
            variables,
        };
    };

    const handleConfirmSave = useCallback(async () => {
        setShowConfirmSaveModal(false); // Close modal first

        const currentVariables = useVariableStore.getState().values;  // 👈 move this inside
        console.log('😳😳😳');

        const updatedPrompt = preparePromptToSave({
            id: editId ?? undefined,
            inputText,
            title: promptTitle,
            folder: selectedFolder,
            isEdit: isEditing,
            type: entityType,
            variables: currentVariables,  // 👈 pass it explicitly
        });

        console.log('Updated Prompt:', updatedPrompt);
        console.log('😳😳');

        try {
            await addOrUpdatePrompt(updatedPrompt);
            resetEditor();
        } catch {
            Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} prompt.`);
        }
    }, [editId, inputText, promptTitle, selectedFolder, isEditing, entityType]);


    function resetEditor() {
        setInputText('');
        setPromptTitle('');
        setResponse('');
        setSelectedFolder('Uncategorized');
        setHasSaved(true);
        useVariableStore.getState().clearAll();
    }

    useEffect(() => {
        if (!showConfirmSaveModal) {
            resetEditor();
        }
    }, [showConfirmSaveModal]);


    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
                <RichPromptEditor
                    text={inputText}
                    onChangeText={setInputText}
                    entityType={entityType}
                    onChangeEntityType={setEntityType}
                />

                <CollapsibleSection title="response" isOpen={showResponse} onToggle={() => setShowResponse(!showResponse)}>
                    <View style={sharedStyles.section}>
                        {isLoading ? (
                            <View style={sharedStyles.loadingContainer}>
                                <ActivityIndicator size="small" color="#007aff" />
                                <Text style={sharedStyles.loadingText}>Running...</Text>
                            </View>
                        ) : response === '' ? (
                            <Text style={sharedStyles.placeholderText}>Response will appear here after you run the prompt.</Text>
                        ) : (
                            <>
                                <Text style={sharedStyles.response}>{response}</Text>
                                <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                                    <TouchableOpacity onPress={() => setResponse('')}>
                                        <Text style={sharedStyles.clearButton}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </CollapsibleSection>
            </ScrollView>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            opacity: saveButtonDisabled ? 0.4 : 1,
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.accent,
                        },
                    ]}
                    onPress={handleSavePrompt}
                    disabled={saveButtonDisabled}
                >
                    <MaterialIcons name="save-alt" size={18} color={saveButtonIconColor} />
                    <Text style={[styles.buttonText, { color: saveButtonTextColor }]}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleRun}
                >
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
                onConfirm={handleConfirmSave}
                selectedFolder={selectedFolder}
            />
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: 20, paddingBottom: 100 },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            marginHorizontal: 12,
        },
        button: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            borderRadius: 10,
            gap: 6,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
        },
    });
