import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useLocalSearchParams, router } from 'expo-router';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerNode, VariableValue } from '../../types/composer';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { useColors } from '../../hooks/useColors';
import { PlaygroundHeader } from '../components/PlaygroundHeader';

export default function ComposerTreeScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const { rootNode, updateVariable } = useComposerStore();
    const colors = useColors();

    const [newVariableName, setNewVariableName] = useState('');
    const [newVariableValue, setNewVariableValue] = useState('');

    if (!rootNode || !nodeId) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>Node not found.</Text>
            </ThemedSafeArea>
        );
    }

    const currentNode = findNodeById(rootNode, nodeId);
    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: colors.text }}>Node not found in tree.</Text>
            </ThemedSafeArea>
        );
    }

    const handleInsertChildNode = async () => {
        if (!newVariableName) return;

        const childId = await generateUUID();
        const childNode: ComposerNode = {
            id: childId,
            entityType: 'Prompt',
            title: `Child Node ${childId.slice(0, 4)}`,
            content: `Hello from child ${childId.slice(0, 4)}`,
            variables: {},
        };

        updateVariable(currentNode.id, newVariableName, { type: 'entity', entity: childNode });

        setNewVariableName('');
        setNewVariableValue('');
    };

    return (
        <ThemedSafeArea>
            <PlaygroundHeader title="Composer Canvas" />

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>{currentNode.title}</Text>
                <Text style={[styles.content, { color: colors.text }]}>{currentNode.content}</Text>

                <View style={styles.variablesContainer}>
                    <Text style={[styles.subheading, { color: colors.text }]}>Variables:</Text>

                    {Object.entries(currentNode.variables).map(([key, val]) => {
                        if (val.type === 'string') {
                            return (
                                <Text key={key} style={{ color: colors.text }}>
                                    {key}: "{val.value}"
                                </Text>
                            );
                        }
                        if (val.type === 'entity') {
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.childButton, { backgroundColor: colors.card }]}
                                    onPress={() => router.push(`/playground/composer/${val.entity.id}`)}
                                >
                                    <Text style={{ color: colors.text }}>
                                        {key}: [Entity] {val.entity.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                    })}
                </View>

                <View style={styles.addVariableContainer}>
                    <Text style={[styles.subheading, { color: colors.text }]}>Insert New Child Node:</Text>
                    <TextInput
                        placeholder="Variable Name"
                        placeholderTextColor={colors.border}
                        value={newVariableName}
                        onChangeText={setNewVariableName}
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    />
                    <ThemedButton title="Insert Child Node" onPress={handleInsertChildNode} />
                </View>

                <ThemedButton title="Back to Playground" onPress={() => router.back()} />
            </ScrollView>
        </ThemedSafeArea>
    );
}

function findNodeById(node: ComposerNode, targetId: string): ComposerNode | null {
    if (node.id === targetId) return node;

    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            const result = findNodeById(val.entity, targetId);
            if (result) return result;
        }
    }
    return null;
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    content: { fontSize: 16, marginBottom: 20 },
    variablesContainer: { marginTop: 20 },
    subheading: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    childButton: { padding: 10, marginVertical: 5, borderRadius: 6 },
    addVariableContainer: { marginTop: 30 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 10 },
});
