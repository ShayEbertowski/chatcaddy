import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { PromptEntity } from '../types/entity';
import { StringVariable, Variable } from '../types/prompt';
import { useColors } from '../hooks/useColors';
import VariableModal from '../components/modals/VariableModal';


type Props = {
    entity: PromptEntity;
    onUpdateVariables: (updated: Record<string, Variable>) => void;
};

export default function EntityEditorScreen({ entity, onUpdateVariables }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    const [variables, setVariables] = useState<Record<string, Variable>>(entity.variables ?? {});
    const [showVariableModal, setShowVariableModal] = useState(false);
    const [editingVarName, setEditingVarName] = useState<string | null>(null);

    const handleSave = (name: string, variable: Variable) => {
        setVariables(prev => ({
            ...prev,
            [name]: variable,
        }));
        onUpdateVariables({
            ...variables,
            [name]: variable,
        });
        setShowVariableModal(false);
    };

    const handleOpenModal = (name: string | null = null) => {
        setEditingVarName(name);
        setShowVariableModal(true);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Variables</Text>

            {Object.entries(variables).map(([name, variable]) => (
                <TouchableOpacity
                    key={name}
                    style={styles.variableItem}
                    onPress={() => handleOpenModal(name)}
                >
                    <Text style={styles.variableName}>{name}</Text>
                    <Text style={styles.variableType}>
                        {variable.type === 'string' ? 'String' : 'Prompt'}
                    </Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
                <Text style={styles.addButtonText}>+ Add Variable</Text>
            </TouchableOpacity>

            {/* ✅ Variable Modal */}
            {showVariableModal && (
                <VariableModal
                    visible={showVariableModal}
                    variableName={editingVarName ?? ''}
                    variableValue={
                        editingVarName
                            ? variables[editingVarName]?.type === 'string'
                                ? variables[editingVarName]?.value ?? ''
                                : ''
                            : ''
                    }
                    onChangeName={(name) => setEditingVarName(name)}
                    onChangeValue={(val) => {
                        if (editingVarName) {
                            const existingVar = variables[editingVarName];
                            if (existingVar?.type === 'string') {
                                setVariables(prev => ({
                                    ...prev,
                                    [editingVarName]: {
                                        ...existingVar,
                                        value: val,
                                    } as StringVariable,
                                }));
                            }
                        }
                    }}
                    onInsert={() => {
                        if (editingVarName) {
                            setVariables(prev => ({
                                ...prev,
                                [editingVarName]: {
                                    type: 'string',
                                    value: '',
                                    richCapable: false,
                                },
                            }));
                            setShowVariableModal(false);
                        }
                    }}
                    onClose={() => setShowVariableModal(false)}
                />
            )}
        </ScrollView>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, padding: 16 },
        title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: colors.text },
        variableItem: {
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        variableName: { fontSize: 16, color: colors.text },
        variableType: { fontSize: 14, color: colors.secondaryText },
        addButton: {
            marginTop: 20,
            padding: 12,
            backgroundColor: colors.primary,
            borderRadius: 8,
            alignItems: 'center',
        },
        addButtonText: { color: colors.background, fontWeight: '600', fontSize: 16 },
    });
