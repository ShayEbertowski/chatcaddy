import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
    Modal,
    Pressable,
    FlatList,
} from 'react-native';

import InsertModal from '../modals/InsertModal';
import CollapsibleSection from '../shared/CollapsibleSection';
import { useVariableStore } from '../../stores/useVariableStore';
import { getEntityForEdit } from '../../utils/prompt/generateEntityForEdit';
import { getSharedStyles } from '../../styles/shared';
import { useColors } from '../../hooks/useColors';
import { resolveVariableDisplayValue } from '../../utils/variables/variables';
import { parsePromptParts } from '../../utils/prompt/promptManager';
import { EntityType } from '../../types/entity';
import { useEntityStore } from '../../stores/useEntityStore';
import EntityTypeDropdown from '../modals/EntityTypeDropdown';
import { Ionicons } from '@expo/vector-icons';
import { Variable, VariableValue } from '../../types/prompt';

export interface RichPromptEditorProps {
    text: string;
    onChangeText: (newText: string) => void;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    onChangeEntityType: (newType: 'Prompt' | 'Function' | 'Snippet') => void;
    variables: Record<string, Variable>;
    onChangeVariables: (newVars: Record<string, Variable>) => void;
    readOnly?: boolean; // 👈 optional read-only mode
}


export const uiEntityTypes = ['Prompt', 'Function', 'Snippet'] as const;
export type UIEntityType = typeof uiEntityTypes[number];

export default function RichPromptEditor({ text, onChangeText, entityType, onChangeEntityType, readOnly }: RichPromptEditorProps) {
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
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const parts = useMemo(() => parsePromptParts(text), [text]);

    const usedVars = useMemo(() => {
        return Array.from(new Set(parts.filter(p => p.type === 'variable').map(p => p.name)));
    }, [parts]);

    const handleInsert = (mode: 'Function' | 'Snippet' | 'Variable', name: string, value: string) => {
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

            if (isEditingVariable) {
                entityStore.deleteEntity(name);
            }

            entityStore.upsertEntity(newEntity);
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
                {!readOnly && (
                    <TouchableOpacity onPress={() => setShowInsertModal(true)} style={styles.insertIconButton}>
                        <Ionicons name="add" size={20} color={colors.accent} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Dropdown Selector */}
            <View style={{ marginBottom: 16 }}>
                <EntityTypeDropdown
                    value={entityType}
                    options={[...uiEntityTypes]}
                    onSelect={onChangeEntityType}
                    readOnly={readOnly}
                />
            </View>


            <TextInput
                value={text}
                editable={!readOnly}
                onChangeText={onChangeText}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                    setSelection(e.nativeEvent.selection)
                }
                selection={selection}
                multiline
                style={[styles.input, { borderColor: colors.borderThin }]}
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
                            No variables yet. {readOnly ? '' : 'Add one above.'}
                        </Text>
                    ) : (
                        usedVars.map((varName, i) => {
                            const chip = (
                                <View key={i} style={sharedStyles.chip}>
                                    <Text style={sharedStyles.chipText}>{varName}</Text>
                                </View>
                            );

                            if (readOnly) {
                                return chip;
                            }

                            return (
                                <TouchableOpacity key={i} onPress={() => handleChipPress(varName)} style={sharedStyles.chip}>
                                    <Text style={sharedStyles.chipText}>{varName}</Text>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </CollapsibleSection>


            <View style={sharedStyles.divider} />

            <CollapsibleSection title="Preview" isOpen={showPreview} onToggle={() => setShowPreview(!showPreview)}>
                <View style={styles.section}>
                    {text.trim() === '' ? (
                        <Text style={sharedStyles.placeholderText}>Preview will appear here as you type your prompt.</Text>
                    ) : (
                        <View style={styles.previewContainer}>
                            <Text style={sharedStyles.previewVariable}>
                                {parts.map((chunk, i) => {
                                    if (chunk.type === 'variable') {
                                        const variable = getVariable(chunk.name) ?? { type: 'string', value: '', richCapable: false };
                                        return resolveVariableDisplayValue(variable);
                                    }
                                    return chunk.value;
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
        </View >
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { padding: 4 },
        headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
        addButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderThin,  // use your thin variant here
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
        },

        addButtonText: { color: colors.text, fontWeight: '600' },

        dropdownContainer: { marginBottom: 12 },
        dropdownButton: {
            borderWidth: 1, borderColor: colors.border, borderRadius: 6,
            paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.card,
        },
        dropdownButtonText: { fontSize: 16, color: colors.text, fontWeight: '600' },
        modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
        modalContent: { backgroundColor: colors.surface, padding: 16, borderRadius: 10, width: 250 },
        dropdownItem: { paddingVertical: 10 },
        dropdownItemText: { fontSize: 16, color: colors.text },
        dropdownItemActive: { backgroundColor: colors.accent, borderRadius: 6 },
        dropdownItemTextActive: { color: colors.onAccent, fontWeight: '600' },

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


        chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
        section: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 12 },
        previewContainer: { paddingVertical: 12, paddingHorizontal: 8 },
        insertIconButton: {
            backgroundColor: colors.surface,
            borderColor: colors.borderThin,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
        }

    });
