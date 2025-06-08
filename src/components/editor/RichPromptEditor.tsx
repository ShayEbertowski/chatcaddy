import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData, TouchableOpacity } from 'react-native';

import InsertModal from '../modals/InsertModal';
import CollapsibleSection from '../shared/CollapsibleSection';
import EntityTypeDropdown from '../shared/EntityTypeDropdown';
import { useVariableStore } from '../../stores/useVariableStore';
import { getEntityForEdit } from '../../utils/prompt/generateEntityForEdit';
import { getSharedStyles } from '../../styles/shared';
import { useColors } from '../../hooks/useColors';
import { resolveVariableDisplayValue } from '../../utils/variables/variables';
import { parsePromptParts } from '../../utils/prompt/promptManager';
import { EntityType } from '../../types/entity';
import { useEntityStore } from '../../stores/useEntityStore';
import InsertIconButton from '../shared/InsertIconnButton';

type Props = {
    text: string;
    onChangeText: (newText: string) => void;
    entityType: EntityType;
    onChangeEntityType: (newType: EntityType) => void;
};

const entityTypes: EntityType[] = ['Prompt', 'Function', 'Snippet', 'Template'];

export default function RichPromptEditor({ text, onChangeText, entityType, onChangeEntityType }: Props) {
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [isEditingVariable, setIsEditingVariable] = useState(false);
    const [editMode, setEditMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');
    const [tempVariableName, setTempVariableName] = useState('');
    const [tempVariableValue, setTempVariableValue] = useState('');
    const [showVariables, setShowVariables] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);
    const entityStore = useEntityStore();
    const { setVariable, getVariable, removeVariable } = useVariableStore.getState();

    const parts = useMemo(() => parsePromptParts(text), [text]);

    const usedVars = useMemo(() => {
        return Array.from(new Set(parts.filter(p => p.type === 'variable').map(p => p.name)));
    }, [parts]);

    const handleInsert = (mode: 'Function' | 'Snippet' | 'Variable', name: string, value: string) => {
        if (mode === 'Variable') {
            if (isEditingVariable) removeVariable(name);
            setVariable(name, { type: 'string', value, richCapable: false });
        } else {
            const newEntity = { id: name, entityType: mode, title: name, content: value, variables: {} };
            if (isEditingVariable) entityStore.deleteEntity(name);
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
                <InsertIconButton onPress={() => setShowInsertModal(true)} />
            </View>

            <View style={{ marginBottom: 12 }}>
                <EntityTypeDropdown value={entityType} options={entityTypes} onSelect={onChangeEntityType} />
            </View>

            <TextInput
                value={text}
                onChangeText={onChangeText}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                    setSelection(e.nativeEvent.selection)}
                selection={selection}
                multiline
                style={styles.input}
                placeholder="Try anything here..."
                placeholderTextColor={colors.secondaryText}
            />

            <CollapsibleSection title="Variables" isOpen={showVariables} onToggle={() => setShowVariables(!showVariables)}>
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
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { padding: 4 },
        headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
        input: {
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 6,
            color: colors.text,
            backgroundColor: colors.card,
            minHeight: 80,
        },
        chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
        section: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 12 },
        previewContainer: { paddingVertical: 12, paddingHorizontal: 8 },
    });
