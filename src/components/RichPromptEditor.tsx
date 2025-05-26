import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';
import VariableModal from './modals/VariableModal'; // adjust path as needed
import { useVariableStore } from '../stores/useVariableStore';
import CollapsibleSection from './CollapsibleSection';
import { getVariableIcon } from '../utils/getVariableIcon';
import { useColors } from '../hooks/useColors';
import { getSharedStyles, placeholderText } from '../styles/shared';
import InsertModal from './modals/InsertModal';
import { useFunctionStore } from '../stores/useFunctionStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import { getEntityForEdit } from '../utils/generateEntityForEdit';
import { PromptPart } from '../types/components';



type Props = {
    text: string;
    onChangeText: (newText: string) => void;
};

export default function RichPromptEditor({
    text,
    onChangeText
}: Props) {
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    // Modal state
    const [showVariableModal, setShowVariableModal] = useState(false);
    const [tempVariableName, setTempVariableName] = useState('');
    const [tempVariableValue, setTempVariableValue] = useState('');
    const [isEditingVariable, setIsEditingVariable] = useState(false);
    const [originalVariableName, setOriginalVariableName] = useState('');
    const [showVariables, setShowVariables] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const filledValues = useVariableStore((state) => state.values);
    const setVariable = useVariableStore((state) => state.setVariable);

    const [showInsertModal, setShowInsertModal] = useState(false);
    const [showFunctionPicker, setShowFunctionPicker] = useState(false);

    const [editMode, setEditMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');


    const styles = getStyles(colors);

    const handleEditVariable = (name: string) => {
        setIsEditingVariable(true);
        setOriginalVariableName(name);
        setTempVariableName(name);
        setTempVariableValue(useVariableStore.getState().getVariable(name) ?? '');
        setShowVariableModal(true);
    };

    const parsePrompt = (input: string): PromptPart[] => {
        const parts = input.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{\s*(.*?)\s*}}$/);
            if (match) {
                const raw = match[1].trim(); // " color = red "
                const [key, ...rest] = raw.split('=');
                const defaultValue = rest.join('=').trim(); // handles = in the default too

                return {
                    type: 'variable',
                    value: key.trim(),
                    defaultValue: defaultValue || undefined,
                };
            }
            return { type: 'text', value: part };
        });
    };



    const usedVars = Array.from(
        new Set(
            parsePrompt(text)
                .filter((part) => part.type === 'variable')
                .map((part) => part.type === 'variable' ? part.value.split('=')[0].trim() : '')
        )
    );

    useEffect(() => {
        const parts = parsePrompt(text);
        parts.forEach((part) => {
            if (part.type === 'variable' && part.defaultValue !== undefined) {
                const key = part.value.split('=')[0].trim();
                const existing = useVariableStore.getState().getVariable(key);
                if (!existing) {
                    setVariable(key, part.defaultValue);
                }
            }
        });
    }, [text]);

    const preview = text.replace(/{{(.*?)}}/g, (_, raw) => {
        const [name] = raw.split('=');
        const value = useVariableStore.getState().getVariable(name.trim());
        return value?.trim() ? value : '?';
    });




    const parsePreviewChunks = (str: string): { type: 'text' | 'variable', value: string }[] => {
        const parts = str.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{(.*?)}}$/);
            if (match) {
                const raw = match[1];
                const [key] = raw.split('=');
                return { type: 'variable', value: key.trim() };
            }
            return { type: 'text', value: part };
        });
    };


    const insertNamedVariable = () => {
        if (isEditingVariable) {
            // Replace all instances of the old variable name
            const updatedText = text.replace(
                new RegExp(`{{${originalVariableName}}}`, 'g'),
                `{{${tempVariableName}}}`
            );

            onChangeText(updatedText);

            // Update store
            useVariableStore.getState().setVariable(tempVariableName, tempVariableValue);

        } else {
            // Insert new variable at cursor
            const before = text.slice(0, selection.start);
            const after = text.slice(selection.end);
            const insert = `{{${tempVariableName}}}`;
            const newText = before + insert + after;
            const newCursor = before.length + insert.length;

            onChangeText(newText);
            setSelection({ start: newCursor, end: newCursor });

            useVariableStore.getState().setVariable(tempVariableName, tempVariableValue);
        }

        // Clear modal state
        setTempVariableName('');
        setTempVariableValue('');
        setIsEditingVariable(false);
        setOriginalVariableName('');
        setShowVariableModal(false);
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
                style={styles.chip}
            >
                <Text style={styles.chipText}>{name}</Text>
            </TouchableOpacity>
        );
    };

    const getVariableIcon = (name: string): string | undefined => {
        const lower = name.toLowerCase();

        if (lower.includes('count') || lower.includes('number') || lower.includes('amount') || lower.includes('total')) {
            return '🔢';
        }
        if (lower.includes('year') || lower.includes('date') || lower.includes('time')) {
            return '📅';
        }
        if (lower.includes('city') || lower.includes('place') || lower.includes('location') || lower.includes('destination')) {
            return '🧭';
        }
        if (lower.includes('name') || lower.includes('person') || lower.includes('user')) {
            return '🧑';
        }
        if (lower.includes('topic') || lower.includes('subject')) {
            return '📚';
        }

        return undefined; // ← no icon if no match
    };

    return (
        <View style={styles.container}>
            {/* Row with +Variable aligned right */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => setShowInsertModal(true)}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>+ Insert</Text>
                </TouchableOpacity>
            </View>


            <TextInput
                value={text}
                onChangeText={onChangeText}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => setSelection(e.nativeEvent.selection)}
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
                        usedVars.map((varName, i) => renderPart({ type: 'variable', value: varName }, i))
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
                                {parsePreviewChunks(text).map((chunk, i) => {
                                    const isVariable = chunk.type === 'variable';
                                    const value = isVariable
                                        ? useVariableStore.getState().getVariable(chunk.value)?.trim() || '?'
                                        : chunk.value;

                                    return value;
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
                        if (isEditingVariable) {
                            // Replace by removing the old one (if needed) and re-adding
                            store.removeFunction(name); // optional if you're storing by name
                        }
                        store.setFunction(name, value);
                    } else if (mode === 'Snippet') {
                        const store = useSnippetStore.getState();
                        if (isEditingVariable) {
                            store.removeSnippet(name);
                        }
                        store.setSnippet(name, value);
                    } else {
                        const store = useVariableStore.getState();
                        if (isEditingVariable) {
                            store.removeVariable(name);
                        }
                        store.setVariable(name, value);
                    }

                    // Insert `{{name}}` if it's a new insert (not an edit)
                    if (!isEditingVariable) {
                        const before = text.slice(0, selection.start);
                        const after = text.slice(selection.end);
                        const insert = `{{${name}}}`;
                        const newText = before + insert + after;
                        onChangeText(newText);
                        setSelection({ start: before.length + insert.length, end: before.length + insert.length });
                    }

                    // Clear state
                    setIsEditingVariable(false);
                    setTempVariableName('');
                    setTempVariableValue('');
                    setShowInsertModal(false);
                }}
            />





        </View>
    );

}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
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
    chip: {
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 6,
        marginBottom: 6,
    },
    chipText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    previewContainer: {
        marginTop: 16,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.secondaryText,
        marginBottom: 4,
    },
    previewText: {
        fontSize: 16,
        color: colors.text,
        flexWrap: 'wrap',
        lineHeight: 22,
        paddingBottom: 12,
    },

});
