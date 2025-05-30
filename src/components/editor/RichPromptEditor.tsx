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
import { PromptPart, VariableValue } from '../../types/prompt';
import { createStringValue, isStringValue, resolveVariableDisplayValue } from '../../utils/variables/variables';

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
    const [originalVariableName, setOriginalVariableName] = useState('');
    const [showVariables, setShowVariables] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const { values, setVariable, getVariable, removeVariable } = useVariableStore.getState();
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);



    const parsedPrompt = useMemo(() => {
        const parts = text.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{\s*(.*?)\s*}}$/);
            if (match) {
                const raw = match[1];
                const [key, ...rest] = raw.split('=');
                const defaultValue = rest.join('=').trim();
                return {
                    type: 'variable',
                    value: key.trim(),
                    defaultValue: defaultValue || undefined,
                };
            }
            return { type: 'text', value: part };
        });
    }, [text]);

    const usedVars = useMemo(() => {
        return Array.from(
            new Set(
                parsedPrompt
                    .filter(part => part.type === 'variable')
                    .map(part => part.value.split('=')[0].trim())
            )
        );
    }, [parsedPrompt]);

    useEffect(() => {
        parsedPrompt.forEach(part => {
            if (part.type === 'variable' && part.defaultValue !== undefined) {
                const key = part.value.split('=')[0].trim();
                if (!getVariable(key)) {
                    setVariable(key, createStringValue(part.defaultValue));
                }
            }
        });
    }, [parsedPrompt]);

    const handleEditVariable = (name: string) => {
        setIsEditingVariable(true);
        setOriginalVariableName(name);
        setTempVariableName(name);

        const val = getVariable(name);
        if (isStringValue(val)) {
            setTempVariableValue(val.value);
        } else {
            setTempVariableValue('');
        }

        setShowInsertModal(true);
    };


    const renderPart = (part: PromptPart, i: number) => {
        if (part.type === 'text') return null;
        const raw = part.value;
        const [name, defaultValue] = raw.split('=');
        const { type, value } = getEntityForEdit(name);
        const displayValue = value || defaultValue || '';

        return (
            <TouchableOpacity
                key={i}
                onPress={() => {
                    setTempVariableName(name);
                    setTempVariableValue(displayValue);
                    setEditMode(type);
                    setIsEditingVariable(true);
                    setShowInsertModal(true);
                }}
                style={sharedStyles.chip}
            >
                <Text style={sharedStyles.chipText}>{name}</Text>
            </TouchableOpacity>
        );
    };

    const insertNamedVariable = () => {
        const insert = `{{${tempVariableName}}}`;

        if (isEditingVariable) {
            const updatedText = text.replace(
                new RegExp(`{{${originalVariableName}}}`, 'g'),
                insert
            );
            onChangeText(updatedText);
        } else {
            const before = text.slice(0, selection.start);
            const after = text.slice(selection.end);
            const newText = before + insert + after;
            const cursor = before.length + insert.length;
            onChangeText(newText);
            setSelection({ start: cursor, end: cursor });
        }

        setVariable(tempVariableName, createStringValue(tempVariableValue));
        setShowInsertModal(false);
        setIsEditingVariable(false);
        setTempVariableName('');
        setTempVariableValue('');
    };

    const previewChunks = useMemo(() => {
        const parts = text.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{(.*?)}}$/);
            if (match) {
                const raw = match[1];
                const [key] = raw.split('=');
                return { type: 'variable' as const, value: key.trim() };
            }
            return { type: 'text' as const, value: part };
        });
    }, [text]);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => setShowInsertModal(true)}
                    style={styles.addButton}
                >
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
                style={styles.input}
                placeholder="Try anything here..."
                placeholderTextColor={colors.secondaryText}
            />

            <CollapsibleSection
                title="variables"
                isOpen={showVariables}
                onToggle={() => setShowVariables(!showVariables)}
            >
                <View style={styles.chipContainer}>
                    {usedVars.length === 0 ? (
                        <Text style={{ color: colors.secondaryText, fontStyle: 'italic', paddingVertical: 6 }}>
                            No variables yet. Add one above.
                        </Text>
                    ) : (
                        usedVars.map((varName, i) =>
                            renderPart({ type: 'variable', value: varName }, i)
                        )
                    )}
                </View>
            </CollapsibleSection>

            <View style={sharedStyles.divider} />

            <CollapsibleSection
                title="preview"
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
                                        ? resolveVariableDisplayValue(getVariable(chunk.value))
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
                onInsert={(mode, name, value) => {
                    if (mode === 'Function') {
                        const store = useFunctionStore.getState();
                        if (isEditingVariable) store.deleteFunction(name);
                        store.setFunction(name, value);
                    } else if (mode === 'Snippet') {
                        const store = useSnippetStore.getState();
                        if (isEditingVariable) store.removeSnippet(name);
                        store.setSnippet(name, value);
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
                }}
            />
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        section: {
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginBottom: 12,
        },
        container: {
            padding: 4,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: 8,
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
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10,
        },

        previewContainer: {
            marginTop: 16,
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

    });

