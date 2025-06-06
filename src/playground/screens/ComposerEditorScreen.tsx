import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerNode, VariableValue } from '../../core/types/composer';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { useColors } from '../../hooks/useColors';
import { router } from 'expo-router';
import { useEntityStore } from '../../stores/useEntityStore';
import { EntityPickerModal } from '../modals/EntityPickerModal';

export default function ComposerEditorScreen() {
    const { setRootNode } = composerStore();
    const colors = useColors();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [variableName, setVariableName] = useState('');
    const [variableValue, setVariableValue] = useState('');
    const [variables, setVariables] = useState<Record<string, VariableValue>>({});
    const { entities } = useEntityStore();
    const [entityPickerVisible, setEntityPickerVisible] = useState(false);

    const handleAddVariable = () => {
        if (!variableName) return;

        setVariables((prev) => ({
            ...prev,
            [variableName]: { type: 'string', value: variableValue },
        }));

        setVariableName('');
        setVariableValue('');
    };

    const handleCreateNode = async () => {
        const id = await generateUUID();
        const newNode: ComposerNode = {
            id,
            entityType: 'Prompt',
            title,
            content,
            variables,
        };

        setRootNode(newNode);
        router.replace('/playground');
    };

    const handleSelectEntity = (node: ComposerNode) => {
        if (!variableName) return;

        setVariables((prev) => ({
            ...prev,
            [variableName]: { type: 'entity', entity: node },
        }));

        setVariableName('');
    };


    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>New Composer Node</Text>

                <Text style={[styles.label, { color: colors.text }]}>Title</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />

                <Text style={[styles.label, { color: colors.text }]}>Content</Text>
                <TextInput
                    value={content}
                    onChangeText={setContent}
                    multiline
                    style={[styles.input, { color: colors.text, borderColor: colors.border, height: 120 }]}
                />

                <Text style={[styles.label, { color: colors.text }]}>Add Variable</Text>
                <TextInput
                    placeholder="Variable Name"
                    value={variableName}
                    onChangeText={setVariableName}
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
                <TextInput
                    placeholder="Variable Value"
                    value={variableValue}
                    onChangeText={setVariableValue}
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
                <ThemedButton title="Add Variable" onPress={handleAddVariable} />

                {Object.entries(variables).map(([name, val]) => (
                    <Text key={name} style={{ color: colors.text }}>
                        {name}: {val.type === 'string' ? val.value : '[Entity]'}
                    </Text>
                ))}

                <ThemedButton title="Insert Entity Reference" onPress={() => setEntityPickerVisible(true)} />
                <ThemedButton title="Create Node" onPress={handleCreateNode} />
                <ThemedButton title="Back to Playground" onPress={() => router.back()} />

                <EntityPickerModal
                    visible={entityPickerVisible}
                    onClose={() => setEntityPickerVisible(false)}
                    availableNodes={Object.values(entities)}
                    onSelect={handleSelectEntity}
                />

            </ScrollView>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
});
