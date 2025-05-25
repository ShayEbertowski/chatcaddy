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
import { placeholderText } from '../styles/shared';
import { getVariableIcon } from '../utils/getVariableIcon';
import { useColors } from '../hooks/useColors';

type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; value: string };

type Props = {
    text: string;
    onChangeText: (newText: string) => void;
};

export default function RichPromptEditor({
    text,
    onChangeText
}: Props) {
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

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

    const colors = useColors();
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
            const match = part.match(/^{{(.*?)}}$/);
            if (match) return { type: 'variable', value: match[1] };
            return { type: 'text', value: part };
        });
    };

    const usedVars = Array.from(
        new Set(
            parsePrompt(text)
                .filter((part) => part.type === 'variable')
                .map((part) => part.value)
        )
    );

    const preview = text.replace(/{{(.*?)}}/g, (_, name) => {
        const value = useVariableStore.getState().getVariable(name);
        return value?.trim() ? value : '?';
    });

    const parsePreviewChunks = (str: string): { type: 'text' | 'variable', value: string }[] => {
        const parts = str.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{(.*?)}}$/);
            if (match) {
                return { type: 'variable', value: match[1] };
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
        if (part.type === 'text') {
            return null; // Don't render plain text chunks in chip preview
        }

        return (
            <TouchableOpacity
                key={i}
                onPress={() => handleEditVariable(part.value)}
                style={styles.chip}
            >
                <Text style={styles.chipText}>{part.value}</Text>
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
                    onPress={() => {
                        setIsEditingVariable(false);
                        setOriginalVariableName('');
                        setTempVariableName('');
                        setTempVariableValue('');
                        setShowVariableModal(true);
                    }}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>+ Variable</Text>
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

            <View style={styles.divider} />

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
                            <Text style={styles.previewText}>
                                {parsePreviewChunks(text).map((chunk, i) => {
                                    if (chunk.type === 'variable') {
                                        const rawValue = useVariableStore.getState().getVariable(chunk.value);
                                        const isMissing = !rawValue?.trim();
                                        const display = isMissing ? '⚠️' : rawValue;
                                        const icon = isMissing ? undefined : getVariableIcon(chunk.value);

                                        return (
                                            <Text key={i} style={styles.previewVariable}>
                                                {icon ? `${icon} ` : ''}
                                                {display}
                                            </Text>
                                        );
                                    }

                                    return <Text key={i}>{chunk.value}</Text>;
                                })}

                            </Text>
                        </View>
                    )}
                </View>

            </CollapsibleSection>

            <View style={styles.divider} />

            <VariableModal
                visible={showVariableModal}
                variableName={tempVariableName}
                variableValue={tempVariableValue}
                onChangeName={setTempVariableName}
                onChangeValue={setTempVariableValue}
                onClose={() => setShowVariableModal(false)}
                onInsert={insertNamedVariable} />
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
    divider: {
        height: 1.5, // a bit thicker
        backgroundColor: colors.border, // theme-aware
        marginVertical: 16, // more spacing to breathe
        opacity: 0.6, // softens it a bit for elegance
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
    previewVariable: {
        backgroundColor: colors.inputBackground,
        color: colors.text,
        fontStyle: 'italic',
        fontWeight: 'bold',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
});
