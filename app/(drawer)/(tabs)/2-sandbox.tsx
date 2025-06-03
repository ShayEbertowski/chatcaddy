import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { useRouter } from 'expo-router';

import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import SavePromptModal from '../../../src/components/modals/SavePromptModal';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { PromptResult } from '../../../src/components/prompt/PromptResult';
import { useColors } from '../../../src/hooks/useColors';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { getSharedStyles } from '../../../src/styles/shared';
import { Prompt, Variable } from '../../../src/types/prompt';
import { runPrompt } from '../../../src/utils/prompt/runPrompt';
import { resolveVariableDisplayValue } from '../../../src/utils/variables/variables';
import { useEditorStore } from '../../../src/stores/useEditorStore';
import { usePromptStore } from '../../../src/stores/usePromptsStore';
import { getSmartTitle, loadVariablesIntoStore } from '../../../src/utils/prompt/promptManager';
import { extractEntityText } from '../../../src/utils/prompt/extractEntityText';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';

export default function Sandbox() {
    const router = useRouter();
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const entityType = useEditorStore((s) => s.entityType);
    const editingEntity = useEditorStore((s) => s.editingEntity);
    const editId = useEditorStore((s) => s.editId);
    const autoRun = useEditorStore((s) => s.autoRun);
    const setEntityType = useEditorStore((s) => s.setEntityType);

    const prompts = usePromptStore((state) => state.prompts);
    const addOrUpdatePrompt = usePromptStore((state) => state.addOrUpdatePrompt);
    const variableStore = useVariableStore();

    const [inputText, setInputText] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [promptTitle, setPromptTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
    const [showResponse, setShowResponse] = useState(true);


    useEffect(() => {
        const extracted = extractEntityText(editingEntity);
        setInputText(extracted);

        if (editingEntity && 'variables' in editingEntity && editingEntity.variables) {
            loadVariablesIntoStore(editingEntity.variables);
        }
    }, [editingEntity]);

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
        variables: Record<string, Variable>;
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

    return (
        <ThemedSafeArea>
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
                    style={[styles.button, { backgroundColor: colors.card, borderColor: colors.accent, borderWidth: 1 }]}
                    onPress={handleConfirmSave}
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
