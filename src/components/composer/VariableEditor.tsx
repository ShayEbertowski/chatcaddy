import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ComposerNode, VariableValue } from '../../core/types/composer';
import { useComposerStore } from '../../core/composer/useComposerStore';
import { useColors } from '../../hooks/useColors';
import { ThemedButton } from '../ui/ThemedButton';
import { flattenTree } from '../../utils/flattenTree';
import { InsertEntityModal } from './modals/InsertEntityModal';

interface Props {
    node: ComposerNode;
}

export function VariableEditor({ node }: Props) {
    const colors = useColors();
    const { updateVariable } = useComposerStore();

    const [newVarName, setNewVarName] = useState('');

    const [insertFor, setInsertFor] = useState<string | null>(null);
    const { rootNode } = useComposerStore();
    const flatNodes = rootNode ? flattenTree(rootNode) : [];

    const handleAddVariable = () => {
        if (!newVarName.trim()) return;

        updateVariable(newVarName, ''); // default to empty string
        setNewVarName('');
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.accent }]}>Variables:</Text>

            <FlatList
                data={Object.entries(node.variables)}
                keyExtractor={([varName]) => varName}
                renderItem={({ item: [varName, value] }) => (
                    <View style={styles.varRow}>
                        <Text style={[styles.varName, { color: colors.text }]}>{varName}:</Text>

                        {typeof value === 'string' ? (
                            <>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                    value={value}
                                    onChangeText={(text) => updateVariable(varName, text)}
                                    placeholder={`Enter ${varName}`}
                                    placeholderTextColor={colors.border}
                                />
                                <TouchableOpacity onPress={() => setInsertFor(varName)}>
                                    <Text style={[styles.injectButton, { color: colors.primary }]}>+</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={[styles.entityBox, { borderColor: colors.border }]}>
                                <Text style={{ color: colors.text }}>[{value.title}]</Text>
                            </View>
                        )}
                    </View>

                )}
            />

            <View style={styles.addRow}>
                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={newVarName}
                    onChangeText={setNewVarName}
                    placeholder="New variable name"
                    placeholderTextColor={colors.border}
                />
                <ThemedButton title="Add" onPress={handleAddVariable} />
            </View>

            {insertFor && (
                <InsertEntityModal
                    visible={true}
                    nodes={flatNodes}
                    onClose={() => setInsertFor(null)}
                    onSelect={(selectedNode) => {
                        updateVariable(insertFor, selectedNode);
                        setInsertFor(null);
                    }}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    varRow: { marginBottom: 12 },
    varName: { marginBottom: 4 },
    input: { borderWidth: 1, padding: 8, borderRadius: 6 },
    entityBox: { padding: 8, borderWidth: 1, borderRadius: 6 },
    addRow: { marginTop: 12 },
    injectButton: {
        color: 'yellow'
    }
});
