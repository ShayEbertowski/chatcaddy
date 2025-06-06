import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { ComposerNode, VariableValue } from '../../core/types/composer';
import { composerStore } from '../../core/composer/composerStore';

export default function ComposerEditorScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const colors = useColors();
    const router = useRouter();

    const rootNode = composerStore.getState().rootNode;
    const node = findNodeById(rootNode, nodeId);
    const [title, setTitle] = useState(node?.title ?? '');
    const [content, setContent] = useState(node?.content ?? '');

    const handleSave = () => {
        composerStore.setState((state) => {
            if (!state.rootNode) return state;
            return { rootNode: updateNode(state.rootNode, nodeId!, { title, content }) };
        });
    };

    if (!node) return (
        <ThemedSafeArea>
            <Text style={{ padding: 20, color: 'red' }}>Node not found</Text>
        </ThemedSafeArea>
    );


    // Must come after     if (!node) return (...
    const handleAddChild = () => {
        const childId = crypto.randomUUID();
        const childNode: ComposerNode = {
            id: childId,
            entityType: 'Prompt',
            title: `Child ${childId.slice(0, 4)}`,
            content: '',
            variables: {},
            children: [],
        };

        composerStore.getState().addChild(node.id, childNode);
    };

    // Must come after     if (!node) return (...
    const handleAddVariable = () => {
        const varName = `var${Object.keys(node.variables).length + 1}`;

        composerStore.setState((state) => {
            const updateTree = (n: ComposerNode): ComposerNode => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        variables: {
                            ...n.variables,
                            [varName]: { type: 'string', value: 'New Value' }
                        }
                    };
                }
                return { ...n, children: n.children.map(updateTree) };
            };

            if (!state.rootNode) return state;
            return { rootNode: updateTree(state.rootNode) };
        });
    };

    const handleUpdateVariable = (variableName: string, newValue: VariableValue) => {
        composerStore.setState((state) => {
            const updateTree = (n: ComposerNode): ComposerNode => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        variables: {
                            ...n.variables,
                            [variableName]: newValue,
                        },
                    };
                }
                return { ...n, children: n.children.map(updateTree) };
            };

            if (!state.rootNode) return state;
            return { rootNode: updateTree(state.rootNode) };
        });
    };



    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={styles.section}>Title:</Text>
                <TextInput value={title} onChangeText={setTitle} style={styles.input} />

                <Text style={styles.section}>Content:</Text>
                <TextInput value={content} onChangeText={setContent} style={[styles.input, { height: 120 }]} multiline />

                <TouchableOpacity
                    onPress={handleAddChild}
                    style={[styles.addChildButton, { backgroundColor: colors.accent }]}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Child Node</Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={handleSave} style={[styles.save, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>

                <Text style={styles.section}>Child Nodes:</Text>

                {node.children.map((child) => (
                    <TouchableOpacity key={child.id} onPress={() => router.push(`/composer/${child.id}`)} style={styles.childButton}>
                        <Text style={{ color: colors.text }}>{child.title}</Text>
                    </TouchableOpacity>
                ))}

                <Text style={styles.section}>Variables:</Text>

                {Object.entries(node.variables).map(([varName, varValue]) => (
                    <View key={varName} style={styles.variableRow}>
                        <Text style={styles.variableName}>{varName}:</Text>

                        {varValue.type === 'string' ? (
                            <TextInput
                                value={varValue.value}
                                onChangeText={(newValue) => handleUpdateVariable(varName, { type: 'string', value: newValue })}
                                style={styles.variableInput}
                            />
                        ) : (
                            <Text style={styles.variableValue}>[Entity: {varValue.entity.title}]</Text>
                        )}
                    </View>
                ))}

                <TouchableOpacity
                    onPress={handleAddVariable}
                    style={[styles.addChildButton, { backgroundColor: colors.accent }]}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Variable</Text>
                </TouchableOpacity>

            </ScrollView>
        </ThemedSafeArea>
    );
}

// Recursive node lookup
function findNodeById(node: ComposerNode | null, id?: string): ComposerNode | null {
    if (!node || !id) return null;
    if (node.id === id) return node;
    for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
    }
    return null;
}

// Recursive node updater
function updateNode(node: ComposerNode, id: string, updates: Partial<ComposerNode>): ComposerNode {
    if (node.id === id) return { ...node, ...updates };
    return { ...node, children: node.children.map((c) => updateNode(c, id, updates)) };
}

const styles = StyleSheet.create({
    input: { borderWidth: 1, padding: 12, marginVertical: 8, borderRadius: 8 },
    save: { marginTop: 12, padding: 16, borderRadius: 8, alignItems: 'center' },
    section: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
    childButton: { padding: 12, borderWidth: 1, borderRadius: 8, marginVertical: 6 },
    addChildButton: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    variableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    variableName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    variableValue: {
        fontSize: 16,
        color: '#555',
    },
    variableInput: {
        borderWidth: 1,
        padding: 8,
        borderRadius: 6,
        flex: 1,
        marginLeft: 8,
    },



});
