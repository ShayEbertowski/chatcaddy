import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { ComposerNode, VariableValue } from '../../../../src/core/types/composer';
import { useLocalSearchParams, router } from 'expo-router';
import { generateUUID } from '../../../../src/utils/uuid/generateUUID';
import { generateUUIDSync } from '../../../utils/uuid/generateUUIDSync';
import { EntityPickerModal } from '../ui/EntityPickerModal';
import { flattenComposerTree } from '../utils/flattenComposerTree';

export default function ComposerBuilder() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const colors = useColors();

    const [currentNode, setCurrentNode] = useState<ComposerNode | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [variables, setVariables] = useState<Record<string, VariableValue>>({});
    const [newVarName, setNewVarName] = useState('');
    const [newVarValue, setNewVarValue] = useState('');
    const [entityPickerVisible, setEntityPickerVisible] = useState(false);


    useEffect(() => {
        if (nodeId === 'new') {
            setTitle('');
            setContent('');
            setVariables({});
            setCurrentNode(null);
        } else {
            const state = composerStore.getState();
            const root = state.rootNode;
            if (!root) return;

            const found = findNodeById(root, nodeId!);
            if (found) {
                setCurrentNode(found);
                setTitle(found.title);
                setContent(found.content);
                setVariables(found.variables);
            }
        }
    }, [nodeId]);

    const handleSave = async () => {
        if (nodeId === 'new') {
            const id = generateUUIDSync();
            const newNode: ComposerNode = {
                id,
                entityType: 'Prompt',
                title,
                content,
                variables,
            };
            composerStore.setState({ rootNode: newNode });
        } else if (currentNode) {
            const updatedNode = {
                ...currentNode,
                title,
                content,
                variables,
            };

            // Update the node inside the tree
            const state = composerStore.getState();
            const updatedRoot = updateNodeById(state.rootNode!, currentNode.id, updatedNode);
            composerStore.setState({ rootNode: updatedRoot });
        }

        router.replace('/core/composer/dashboard');
    };

    const handleAddVariable = () => {
        if (!newVarName) return;

        setVariables((prev) => ({
            ...prev,
            [newVarName]: { type: 'string', value: newVarValue },
        }));

        setNewVarName('');
        setNewVarValue('');
    };

    const handleSelectEntity = (entity: ComposerNode) => {
        if (!newVarName) return;

        setVariables((prev) => ({
            ...prev,
            [newVarName]: { type: 'entity', entity },
        }));

        setNewVarName('');
        setNewVarValue('');
    };


    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {nodeId === 'new' ? 'Create Composer Node' : 'Edit Composer Node'}
                </Text>

                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor={colors.border}
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />

                <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Content"
                    placeholderTextColor={colors.border}
                    multiline
                    style={[styles.input, { color: colors.text, borderColor: colors.border, height: 120 }]}
                />

                <View style={styles.varSection}>
                    <Text style={[styles.varHeader, { color: colors.text }]}>Variables</Text>

                    {Object.entries(variables).map(([key, value]) => (
                        <Text key={key} style={{ color: colors.text }}>
                            {key}: {value.type === 'string' ? value.value : '[Entity]'}
                        </Text>
                    ))}

                    <TextInput
                        value={newVarName}
                        onChangeText={setNewVarName}
                        placeholder="Variable Name"
                        placeholderTextColor={colors.border}
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    />

                    <TextInput
                        value={newVarValue}
                        onChangeText={setNewVarValue}
                        placeholder="Variable Value"
                        placeholderTextColor={colors.border}
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    />

                    <ThemedButton title="Add Variable" onPress={handleAddVariable} />
                    <ThemedButton title="Insert Entity Reference" onPress={() => setEntityPickerVisible(true)} />

                </View>

                <ThemedButton title="Save Node" onPress={handleSave} />
                <ThemedButton title="Cancel" onPress={() => router.back()} />

                <EntityPickerModal
                    visible={entityPickerVisible}
                    onClose={() => setEntityPickerVisible(false)}
                    availableNodes={flattenComposerTree(composerStore.getState().rootNode!).map(({ node }) => node)}
                    onSelect={handleSelectEntity}
                />

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

function updateNodeById(node: ComposerNode, targetId: string, updated: ComposerNode): ComposerNode {
    if (node.id === targetId) return updated;

    const updatedVariables: Record<string, VariableValue> = {};
    for (const [key, val] of Object.entries(node.variables)) {
        if (val.type === 'entity') {
            updatedVariables[key] = {
                type: 'entity',
                entity: updateNodeById(val.entity, targetId, updated),
            };
        } else {
            updatedVariables[key] = val;
        }
    }

    return { ...node, variables: updatedVariables };
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 20 },
    varSection: { marginTop: 30 },
    varHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
