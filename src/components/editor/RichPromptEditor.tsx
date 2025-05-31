import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';

import InsertModal from '../modals/InsertModal';
import CollapsibleSection from '../shared/CollapsibleSection';
import { useVariableStore } from '../../stores/useVariableStore';
import { useFunctionStore } from '../../stores/useFunctionStore';
import { useSnippetStore } from '../../stores/useSnippetStore';
import { getEntityForEdit } from '../../utils/prompt/generateEntityForEdit';
import { getSharedStyles, placeholderText } from '../../styles/shared';
import { useColors } from '../../hooks/useColors';
import { createStringValue, resolveVariableDisplayValue } from '../../utils/variables/variables';
import { parsePromptParts } from '../../utils/prompt/promptManager';

type Props = {
    text: string;
    onChangeText: (newText: string) => void;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    onChangeEntityType: (newType: 'Prompt' | 'Function' | 'Snippet') => void;
};

export default function RichPromptEditor({ text, onChangeText, entityType, onChangeEntityType }: Props) {
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [isEditingVariable, setIsEditingVariable] = useState(false);
    const [editMode, setEditMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');
    const [tempVariableName, setTempVariableName] = useState('');
    const [tempVariableValue, setTempVariableValue] = useState('');

    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);
    const { values, setVariable, getVariable, removeVariable } = useVariableStore.getState();
    const addFunction = useFunctionStore((state) => state.addFunction);
    const { setSnippet, removeSnippet } = useSnippetStore();
    const [showVariables, setShowVariables] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const parts = useMemo(() => parsePromptParts(text), [text]);

    const previewChunks = useMemo(() => {
        return parsePromptParts(text);
    }, [text]);

    const usedVars = useMemo(() => {
        return Array.from(new Set(parts.filter(p => p.type === 'variable').map(p => p.name)));
    }, [parts]);

    useEffect(() => {
        parts.forEach(part => {
            if (part.type === 'variable') {
                const key = part.name;
                if (!getVariable(key)) {
                    setVariable(key, createStringValue(""));
                }
            }
        });
    }, [parts]);

    const handleInsert = async (mode: 'Function' | 'Snippet' | 'Variable', name: string, value: string) => {
        if (mode === 'Function') {
            if (isEditingVariable) {
                await useFunctionStore.getState().deleteFunction(name);
            }
            await addFunction(name, value);
        } else if (mode === 'Snippet') {
            if (isEditingVariable) removeSnippet(name);
            setSnippet(name, value);
        } else {
            if (isEditingVariable) removeVariable(name);
            setVariable(name, createStringValue(value));
        }

        if (!isEditingVariable) {
            const before = text.slice(0, selection.start);
            const after = text.slice(selection.end);
            const insert = `{{${name}}}`;
            const newText = before + insert + after;
            onChangeText(newText);
            setSelection({ start: before.length + insert.length, end: before.length + insert.length });
        }

        setIsEditingVariable(false);
        setTempVariableName('');
        setTempVariableValue('');
        setShowInsertModal(false);
    };

    const handleChipPress = (name: string) => {
        const { type, value } = getEntityForEdit(name);
        setTempVariableName(name);
        setTempVariableValue(value ?? '');
        setEditMode(type);
        setIsEditingVariable(true);
        setShowInsertModal(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setShowInsertModal(true)} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Insert</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
                {['Prompt', 'Function', 'Snippet'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => onChangeEntityType(type as typeof entityType)}
                        style={[
                            styles.typeButton,
                            entityType === type && styles.typeButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                entityType === type && styles.typeButtonTextActive,
                            ]}
                        >
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                value={text}
                onChangeText={onChangeText}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                    setSelection(e.nativeEvent.selection)
                }
                selection={selection}
                multiline
                style={[styles.input, {borderColor: colors.borderThin}]}
                placeholder="Try anything here..."
                placeholderTextColor={colors.secondaryText}
            />

            <CollapsibleSection
                title="Variables"
                isOpen={showVariables}
                onToggle={() => setShowVariables(!showVariables)}

            >
                <View style={styles.chipContainer}>
                    {usedVars.length === 0 ? (
                        <Text style={{ color: colors.secondaryText, fontStyle: 'italic', paddingVertical: 6 }}>
                            No variables yet. Add one above.
                        </Text>
                    ) : (
                        usedVars.map((varName, i) => (
                            <TouchableOpacity key={i} onPress={() => handleChipPress(varName)} style={sharedStyles.chip}>
                                <Text style={sharedStyles.chipText}>{varName}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </CollapsibleSection>

            <View style={sharedStyles.divider} />


            <CollapsibleSection
                title="Preview"
                isOpen={showPreview}
                onToggle={() => setShowPreview(!showPreview)}
            >
                <View style={styles.section}>
                    {text.trim() === '' ? (
                        <Text style={placeholderText}>
                            Preview will appear here as you type your prompt.
                        </Text>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Text style={sharedStyles.previewVariable}>
                                {previewChunks.map((chunk, i) => {
                                    return chunk.type === 'variable'
                                        ? resolveVariableDisplayValue(getVariable(chunk.name))
                                        : chunk.value;
                                }).join('')}
                            </Text>
                        </View>
                    )}
                </View>
            </CollapsibleSection>

            <View style={sharedStyles.divider} />


            <InsertModal
                visible={showInsertModal}
                mode={editMode}
                isEdit={isEditingVariable}
                initialName={tempVariableName}
                initialValue={tempVariableValue}
                onClose={() => {
                    setShowInsertModal(false);
                    setIsEditingVariable(false);
                    setTempVariableName('');
                    setTempVariableValue('');
                }}
                onInsert={handleInsert}
            />
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { padding: 4 },

        headerRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: 8,
        },

        addButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
        },

        addButtonText: {
            color: colors.onPrimary,
            fontWeight: '600',
        },

        typeSelector: {
            flexDirection: 'row',
            marginBottom: 12,
            gap: 8,
        },

        typeButton: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: colors.card,
        },

        typeButtonActive: {
            backgroundColor: colors.primary,
        },

        typeButtonText: {
            fontSize: 14,
            color: colors.text,
        },

        typeButtonTextActive: {
            color: colors.onPrimary,
            fontWeight: '600',
        },

        input: {
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            borderRadius: 6,
            minHeight: 60,
            color: colors.text,
            backgroundColor: colors.inputBackground,
        },

        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10,
        },

        section: {
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginBottom: 12,
        },

        previewContainer: {
            paddingVertical: 12,
            paddingHorizontal: 8,
        },
    });
