import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ComposerNode, VariableValue } from '../../types/composer';
import { useComposerStore } from '../../stores/useComposerStore';
import { useColors } from '../../hooks/useColors';

interface Props {
    node: ComposerNode;
}

export function ComposerTreeView({ node }: Props) {
    const { updateVariable } = useComposerStore();
    const colors = useColors();
    const styles = getStyles(colors);

    const [activeVariable, setActiveVariable] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{node.title}</Text>

            {Object.entries(node.variables).map(([varName, value]) => (
                <View key={varName} style={styles.variableRow}>
                    <Text style={styles.variableLabel}>{varName}:</Text>

                    {value.type === 'string' ? (
                        <TextInput
                            style={styles.input}
                            value={value.value}
                            onChangeText={(text) => updateVariable(node.id, varName, { type: 'string', value: text })}
                            placeholder={`Enter ${varName}`}
                        />
                    ) : (
                        <View style={styles.entityBox}>
                            <Text style={styles.entityText}>[{value.entity.title}]</Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => setActiveVariable(varName)}>
                        <Text style={styles.plusButton}>+</Text>
                    </TouchableOpacity>
                </View>
            ))}

        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { marginBottom: 20 },
        title: { fontSize: 20, fontWeight: 'bold', color: colors.accent, marginBottom: 12 },
        variableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        variableLabel: { width: 80, fontWeight: 'bold', color: colors.text },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 6,
            flex: 1,
            marginRight: 10,
            color: colors.text,
        },
        entityBox: {
            flex: 1,
            backgroundColor: colors.surface,
            padding: 8,
            borderRadius: 6,
            borderColor: colors.border,
            borderWidth: 1,
            marginRight: 10,
        },
        entityText: { fontStyle: 'italic', color: colors.text },
        plusButton: { fontSize: 24, color: colors.primary },
    });
