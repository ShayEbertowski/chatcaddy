import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { Prompt } from '../../types/prompt';
import InsertModalV2 from '../modals/InsertModalV2';
import BaseModal from '../modals/BaseModal';
import VariableEditModal from '../modals/VariableEditModal';
import { FieldRenderer } from './FieldRenderer';

export function PromptVariableEditor({ prompt, initialValues = {}, onChange }: {
    prompt: Prompt;
    initialValues?: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
}) {
    const colors = useColors();

    const [inputs, setInputs] = useState<Record<string, string>>(initialValues);
    const [richModeMap, setRichModeMap] = useState<Record<string, boolean>>({});
    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [editingMode, setEditingMode] = useState<'String' | 'Function'>('String');
    const [tempVariable, setTempVariable] = useState<string>('');
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [editingVariable, setEditingVariable] = useState<{ name: string; value: string } | null>(null);

    useEffect(() => {
        onChange(inputs);
    }, [inputs]);

    useEffect(() => {
        const initialInputs: Record<string, string> = {};
        const initialRich: Record<string, boolean> = {};
        Object.entries(prompt.variables ?? {}).forEach(([k, v]) => {
            if (v.type === 'string') {
                initialInputs[k] = initialValues[k] ?? v.value ?? '';
            } else if (v.type === 'prompt') {
                initialInputs[k] = initialValues[k] ?? `{{${v.promptTitle}}}`;
            }
            initialRich[k] = false;
        });
        setInputs((prev) => ({ ...initialInputs, ...prev }));
        setRichModeMap((prev) => ({ ...initialRich, ...prev }));
    }, [prompt]);

    const handleInsert = (value: string) => {
        if (!insertTarget) return;
        setInputs(prev => ({
            ...prev,
            [insertTarget]: editingMode === 'Function' ? `{{${value}}}` : value,
        }));
        setShowInsertModal(false);
        setInsertTarget(null);
        setTempVariable('');
    };

    if (!prompt.variables) return null;

    return (
        <View>
            {Object.entries(prompt.variables).map(([name, variable]) => (
                <FieldRenderer
                    key={name}
                    name={name}
                    variable={variable}
                    value={inputs[name] || ''}
                    richMode={richModeMap[name]}
                    onRichToggle={(enabled) =>
                        setRichModeMap(prev => ({ ...prev, [name]: enabled }))
                    }
                    onValueChange={(text) =>
                        setInputs(prev => ({ ...prev, [name]: text }))
                    }
                    onChipPress={(chipName) =>
                        setEditingVariable({ name: chipName, value: inputs[chipName] ?? '' })
                    }
                    onInsertPress={() => {
                        setInsertTarget(name);
                        setEditingMode(variable.type === 'string' ? 'String' : 'Function');
                        setTempVariable(inputs[name] ?? '');
                        setShowInsertModal(true);
                    }}
                />
            ))}

            {showInsertModal && insertTarget && (
                <BaseModal visible blur onRequestClose={() => {
                    setShowInsertModal(false);
                    setInsertTarget(null);
                    setTempVariable('');
                }}>
                    <InsertModalV2
                        visible
                        insertTarget={insertTarget}
                        onRequestClose={() => {
                            setShowInsertModal(false);
                            setInsertTarget(null);
                            setTempVariable('');
                        }}
                        onInsert={handleInsert}
                        entityType={editingMode === 'Function' ? 'Function' : 'Variable'}
                    />
                </BaseModal>
            )}

            {editingVariable && (
                <VariableEditModal
                    visible
                    variableName={editingVariable.name}
                    currentValue={editingVariable.value}
                    onCancel={() => setEditingVariable(null)}
                    onSave={(newValue) => {
                        setInputs(prev => ({
                            ...prev,
                            [editingVariable.name]: newValue,
                        }));
                        setEditingVariable(null);
                    }}
                />
            )}
        </View>
    );
}
