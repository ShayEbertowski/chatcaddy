import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { EventArg, useNavigation, usePreventRemove } from '@react-navigation/native';

import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useRootNavigationState } from 'expo-router';

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
import { usePromptStore } from '../../../src/stores/usePromptsStore';
import { getSmartTitle, loadVariablesIntoStore } from '../../../src/utils/prompt/promptManager';
import { extractEntityText } from '../../../src/utils/prompt/extractEntityText';
import { EntityType, Prompt, Variable } from '../../../src/types/prompt';
import { v4 as uuidv4 } from 'uuid';
import { useSegments } from 'expo-router';
import { useIsCurrentRoute } from '../../../src/utils/router/isCurrentRoute';


export default function Sandbox() {
    const router = useRouter();
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const entityType = useEditorStore((s) => s.entityType);
    const editingEntity = useEditorStore((s) => s.editingEntity);
    const editId = useEditorStore((s) => s.editId);
    const setEntityType = useEditorStore((s) => s.setEntityType);
    const clearEditingEntity = useEditorStore((s) => s.clearEditingEntity);
    const addOrUpdatePrompt = usePromptStore((state) => state.addOrUpdatePrompt);

    const [inputText, setInputText] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [isDirty, setIsDirty] = useState(false);  // <-- Dirty state tracking
    const navigation = useNavigation();


    const segments = useSegments();
    const isFocused = useIsCurrentRoute(['(tabs)', '2-sandbox']);

    // Whenever text changes, mark as dirty
    useEffect(() => {
        if (editingEntity) setIsDirty(true);
    }, [inputText, promptTitle, selectedFolder]);

    useEffect(() => {
        if (editingEntity?.entityType === 'Prompt') {
            const extracted = extractEntityText(editingEntity);
            setInputText(extracted);
            loadVariablesIntoStore(editingEntity.variables);
        } else {
            resetEditor();
        }
    }, [editingEntity]);


    const resetEditor = () => {
        setInputText('');
        setPromptTitle('');
        setResponse('');
        setSelectedFolder('Uncategorized');
        useVariableStore.getState().clearAll();
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

    const preparePromptToSave = ({
        id, inputText, title, folder, type, variables,
    }: {
        id?: string;
        inputText: string;
        title: string;
        folder: string;
        type: EntityType;
        variables: Record<string, Variable>;
    }): Prompt => ({
        id: id ?? uuidv4(),
        content: inputText,
        title: title ?? '',
        folder: folder ?? '',
        entityType: type as 'Prompt',
        variables
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
        setIsDirty(false); // clear dirty after save
    }, [editId, inputText, promptTitle, selectedFolder, entityType]);

    return (
        <ThemedSafeArea>
            <Stack.Screen options={{ title: 'Prompt Sandbox' }} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
                <RichPromptEditor
                    text={inputText}
                    onChangeText={(text) => {
                        setInputText(text);
                        setIsDirty(true);
                    }}
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
