import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { useRouter, useLocalSearchParams } from 'expo-router';

import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import SavePromptModal from '../../../src/components/modals/SavePromptModal';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { PromptResult } from '../../../src/components/prompt/PromptResult';

import { useColors } from '../../../src/hooks/useColors';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { getSharedStyles } from '../../../src/styles/shared';
import { Prompt, VariableValue } from '../../../src/types/prompt';
import { runPrompt } from '../../../src/utils/prompt/runPrompt';
import { resolveVariableDisplayValue } from '../../../src/utils/variables/variables';
import { useEditorStore } from '../../../src/stores/useEditorStore';
import { usePromptStore } from '../../../src/stores/usePromptsStore';
import { getSmartTitle } from '../../../src/utils/prompt/promptManager';
import { extractEntityText } from '../../../src/utils/prompt/extractEntityText';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';

export default function Sandbox() {
    const router = useRouter();
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const currentVariables = useVariableStore.getState().values;

    // Unified store
    const entityType = useEditorStore((s) => s.entityType);
    const editingEntity = useEditorStore((s) => s.editingEntity);
    const editId = useEditorStore((s) => s.editId);
    const autoRun = useEditorStore((s) => s.autoRun);
    const setEntityType = useEditorStore((s) => s.setEntityType);

    const prompts = usePromptStore((state) => state.prompts);
    const addOrUpdatePrompt = usePromptStore((state) => state.addOrUpdatePrompt);

    const [inputText, setInputText] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [promptTitle, setPromptTitle] = useState('');
    const [autoSuggestTitle, setAutoSuggestTitle] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

    // Load content when entity changes
    useEffect(() => {
        const extracted = extractEntityText(editingEntity);
        setInputText(extracted);
    }, [editingEntity]);

    // Auto run logic
    useEffect(() => {
        if (autoRun && editingEntity) {
            handleRun();
        }
    }, [autoRun, editingEntity]);

    useEffect(() => {
        if (autoSuggestTitle) {
            const suggested = inputText.trim().split(/\s+/).slice(0, 5).join(' ');
            setPromptTitle((prev) => {
                const wasAuto = prev === '' || prev === suggested;
                return wasAuto ? suggested : prev;
            });
        }
    }, [inputText, autoSuggestTitle]);

    const isDup = prompts.some(
        (p) => p.content.trim() === inputText.trim() && p.folder === selectedFolder
    );

    const handleRun = async () => {
        setHasRun(true);
        setShowResponse(true);
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
        type,
        variables,
    }: {
        id?: string;
        inputText: string;
        title: string;
        folder: string;
        type: 'Prompt' | 'Function' | 'Snippet';
        variables: Record<string, VariableValue>;
    }): Prompt => ({
        id: id ?? (uuid.v4() as string),
        content: inputText,
        title,
        folder,
        type,
        variables,
    });

    const handleConfirmSave = useCallback(async () => {
        setShowConfirmSaveModal(false);
        const updatedPrompt = preparePromptToSave({
            id: editId ?? undefined,
            inputText,
            title: promptTitle,
            folder: selectedFolder,
            type: entityType,
            variables: useVariableStore.getState().values,
        });
        await addOrUpdatePrompt(updatedPrompt);
        resetEditor();
    }, [editId, inputText, promptTitle, selectedFolder, entityType]);

    const resetEditor = () => {
        setInputText('');
        setPromptTitle('');
        setResponse('');
        setSelectedFolder('Uncategorized');
        useVariableStore.getState().clearAll();
    };

    const saveButtonDisabled = inputText.trim() === '';

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
                    <PromptResult response={response} isLoading={isLoading} onClear={() => setResponse('')} />
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
                onConfirm={handleConfirmSave}
                selectedFolder={selectedFolder}
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
