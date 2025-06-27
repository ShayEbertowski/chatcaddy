// src/components/editor/RichPromptEditor.tsx
import React, { useMemo, useState } from 'react';
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
import { getSharedStyles } from '../../styles/shared';
import { useColors } from '../../hooks/useColors';
import { resolveVariableDisplayValue } from '../../utils/variables/variables';
import { parsePromptParts } from '../../utils/prompt/promptManager';
import { useEntityStore } from '../../stores/useEntityStore';
import { Ionicons } from '@expo/vector-icons';
import { Variable } from '../../types/prompt';
import DropdownSelector, { DropdownOption } from '../shared/DropdownSelector';

export interface RichPromptEditorProps {
    text: string;
    onChangeText: (newText: string) => void;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    onChangeEntityType: (newType: 'Prompt' | 'Function' | 'Snippet') => void;
    variables: Record<string, Variable>;
    onChangeVariables: (newVars: Record<string, Variable>) => void;
    onChipPress: (name: string) => void;
}

export const uiEntityTypes = ['Prompt', 'Function', 'Snippet'] as const;
export type UIEntityType = typeof uiEntityTypes[number];

export default function RichPromptEditor({
    text,
    onChangeText,
    entityType,
    onChangeEntityType,
    onChipPress,
}: RichPromptEditorProps) {
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [isEditingVariable, setIsEditingVariable] = useState(false);
    const [editMode, setEditMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');
    const [tempVariableName, setTempVariableName] = useState('');
    const [tempVariableValue, setTempVariableValue] = useState('');

    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);

    const entityStore = useEntityStore();
    const { values, setVariable, getVariable, removeVariable } = useVariableStore.getState();

    const [showVariables, setShowVariables] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const parts = useMemo(() => parsePromptParts(text), [text]);

    const usedVars = useMemo(
        () => Array.from(new Set(parts.filter((p) => p.type === 'variable').map((p) => p.name))),
        [parts]
    );

    /* ─────────────────────────────────────────────────── */
    /*  Handlers                                           */
    /* ─────────────────────────────────────────────────── */

    const handleInsert = (
        mode: 'Function' | 'Snippet' | 'Variable',
        name: string,
        value: string
    ) => {
        if (mode === 'Variable') {
            if (isEditingVariable) removeVariable(name);
            setVariable(name, { type: 'string', value, richCapable: false });
        } else {
            const newEntity = {
                id: name,
                entityType: mode,
                title: name,
                content: value,
                variables: {},
            };
            if (isEditingVariable) entityStore.deleteEntity(name);
            entityStore.upsertEntity(newEntity);
        }

        // Insert {{name}} into prompt at current cursor position
        if (!isEditingVariable) {
            const before = text.slice(0, selection.start);
            const after = text.slice(selection.end);
            const insert = `{{${name}}}`;
            const newText = before + insert + after;
            onChangeText(newText);
            setSelection({
                start: before.length + insert.length,
                end: before.length + insert.length,
            });
        }

        // Reset modal state
        setIsEditingVariable(false);
        setTempVariableName('');
        setTempVariableValue('');
        setShowInsertModal(false);
    };

    const options: DropdownOption<UIEntityType>[] = [
        { label: 'Prompt', value: 'Prompt' },
        { label: 'Function', value: 'Function' },
        { label: 'Snippet', value: 'Snippet' },
    ];

    /* ─────────────────────────────────────────────────── */
    /*  Render                                             */
    /* ─────────────────────────────────────────────────── */

    return (
        <View style={styles.container}>
            {/* Header with “insert” button */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => setShowInsertModal(true)}
                    style={styles.insertIconButton}
                >
                    <Ionicons name="add" size={20} color={colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Entity-type dropdown */}
            {/* <View style={{ marginBottom: 16 }}>
                <DropdownSelector
                    value={entityType}
                    options={options}
                    onSelect={onChangeEntityType}
                />
            </View> */}

            {/* Prompt input */}
            <TextInput
                value={text}
                onChangeText={onChangeText}
                onSelectionChange={(
                    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
                ) => setSelection(e.nativeEvent.selection)}
                selection={selection}
                multiline
                style={[styles.input, { borderColor: colors.borderThin }]}
                placeholder="Try anything here..."
                placeholderTextColor={colors.secondaryText}
            />

            {/* Variables */}
            <CollapsibleSection
                title="Variables"
                isOpen={showVariables}
                onToggle={() => setShowVariables(!showVariables)}
            >
                <View style={styles.chipContainer}>
                    {usedVars.length === 0 ? (
                        <Text
                            style={{
                                color: colors.secondaryText,
                                fontStyle: 'italic',
                                paddingVertical: 6,
                            }}
                        >
                            No variables yet. Add one above.
                        </Text>
                    ) : (
                        usedVars.map((varName, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => onChipPress(varName)}
                                style={sharedStyles.chip}
                            >
                                <Text style={sharedStyles.chipText}>{varName}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </CollapsibleSection>

            <View style={sharedStyles.divider} />

            {/* Preview */}
            <CollapsibleSection
                title="Preview"
                isOpen={showPreview}
                onToggle={() => setShowPreview(!showPreview)}
            >
                <View style={styles.section}>
                    {text.trim() === '' ? (
                        <Text style={sharedStyles.placeholderText}>
                            Preview will appear here as you type your prompt.
                        </Text>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Text style={sharedStyles.previewVariable}>
                                {parts
                                    .map((chunk) =>
                                        chunk.type === 'variable'
                                            ? resolveVariableDisplayValue(
                                                  getVariable(chunk.name) ?? {
                                                      type: 'string',
                                                      value: '',
                                                      richCapable: false,
                                                  }
                                              )
                                            : chunk.value
                                    )
                                    .join('')}
                            </Text>
                        </View>
                    )}
                </View>
            </CollapsibleSection>

            <View style={sharedStyles.divider} />

            {/* Insert Modal */}
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
        insertIconButton: {
            backgroundColor: colors.surface,
            borderColor: colors.borderThin,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
        },

        input: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
            color: colors.text,
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

        previewContainer: { paddingVertical: 12, paddingHorizontal: 8 },
    });
