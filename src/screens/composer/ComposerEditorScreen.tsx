import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { ComposerNode, VariableValue } from '../../core/types/composer';
import { useComposerStore } from '../../core/composer/useComposerStore';
import BaseModal from '../../components/modals/BaseModal';
import { flattenTree } from '../../utils/flattenTree';
import { EntityType } from '../../types/entity';
import { runComposerTree } from '../../core/composer/utils/runComposerTree';


export default function ComposerEditorScreen() {
    const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
    const colors = useColors();
    const router = useRouter();

    const rootNode = useComposerStore.getState().rootNode;
    const node = findNodeById(rootNode, nodeId);
    const [title, setTitle] = useState(node?.title ?? '');
    const [content, setContent] = useState(node?.content ?? '');

    const [entityModalVisible, setEntityModalVisible] = useState(false);
    const [pendingVarName, setPendingVarName] = useState<string | null>(null);

    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);


    const handleRun = async () => {
        if (!node) return;
        setIsRunning(true);
        setOutput(null);
        try {
            const result = await runComposerTree(node);
            setOutput(result);
        } catch (err) {
            console.error(err);
            setOutput('⚠️ Error running prompt.');
        } finally {
            setIsRunning(false);
        }
    };


    const handleSave = () => {
        useComposerStore.setState((state) => {
            if (!state.rootNode) return state;
            return { rootNode: updateNode(state.rootNode, nodeId!, { title, content }) };
        });
    };

    function flattenTree(node: ComposerNode | null): ComposerNode[] {
        if (!node) return [];
        return [node, ...node.children.flatMap(flattenTree)];
    }


    if (!node) return (
        <ThemedSafeArea>
            <Text style={{ padding: 20, color: 'red' }}>Node not found</Text>
        </ThemedSafeArea>
    );


    // Following methods must come after     if (!node) return (...
    const handleAddChild = (newEntityType: EntityType) => {
        const childId = crypto.randomUUID();
        const childNode: ComposerNode = {
            id: childId,
            entityType: newEntityType,  // 👈 use dynamic entity type now
            title: `${newEntityType} ${childId.slice(0, 4)}`,
            content: '',
            variables: {},
            children: [],
        };

        useComposerStore.getState().addChild(node.id, childNode);
    };


    const handleAddVariable = () => {
        const varName = `var${Object.keys(node.variables).length + 1}`;

        // Offer choice: string or entity insertion
        // For now we just default to entity mode (later we can build a true picker)

        setPendingVarName(varName);
        setEntityModalVisible(true);
    };

    const handleInsertEntityVariable = (selectedNode: ComposerNode) => {
        if (!pendingVarName) return;

        useComposerStore.setState((state) => {
            const updateTree = (n: ComposerNode): ComposerNode => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        variables: {
                            ...n.variables,
                            [pendingVarName]: { type: 'entity', entity: selectedNode },
                        },
                    };
                }
                return { ...n, children: n.children.map(updateTree) };
            };

            if (!state.rootNode) return state;
            return { rootNode: updateTree(state.rootNode) };
        });

        setPendingVarName(null);
        setEntityModalVisible(false);
    };



    const handleUpdateVariable = (variableName: string, newValue: VariableValue) => {
        useComposerStore.setState((state) => {
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

    const handleDeleteVariable = (variableName: string) => {
        useComposerStore.setState((state) => {
            const updateTree = (n: ComposerNode): ComposerNode => {
                if (n.id === node.id) {
                    const newVariables = { ...n.variables };
                    delete newVariables[variableName];
                    return { ...n, variables: newVariables };
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
                    onPress={() => handleAddChild('Prompt')}
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

                        <TouchableOpacity onPress={() => handleDeleteVariable(varName)} style={styles.deleteButton}>
                            <Text style={{ color: 'red' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    onPress={handleRun}
                    style={[styles.button, { backgroundColor: colors.accent, marginTop: 16 }]}
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>Run Prompt</Text>
                </TouchableOpacity>

                {isRunning && (
                    <Text style={[styles.resultText, { color: colors.placeholder }]}>Running...</Text>
                )}

                {output && (
                    <View style={[styles.resultBox, { borderColor: colors.border }]}>
                        <Text style={{ color: colors.text }}>{output}</Text>
                    </View>
                )}


                <TouchableOpacity
                    onPress={handleAddVariable}
                    style={[styles.addChildButton, { backgroundColor: colors.accent }]}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Variable</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleRun}
                    style={[styles.addChildButton, { backgroundColor: colors.primary }]}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Run Prompt</Text>
                </TouchableOpacity>


            </ScrollView>

            <BaseModal
                visible={entityModalVisible}
                onRequestClose={() => setEntityModalVisible(false)}
                blur
                animationType="slide"
            >
                <Text style={styles.section}>Select Node to Insert</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                    {flattenTree(rootNode).map((candidate) => (
                        <TouchableOpacity
                            key={candidate.id}
                            style={styles.entityButton}
                            onPress={() => handleInsertEntityVariable(candidate)}
                        >
                            <Text>{candidate.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </BaseModal>


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
    entityButton: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    deleteButton: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 4,
    },
    resultBox: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    resultText: {
        fontSize: 16,
        marginTop: 12,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        padding: 10,
    },

});
