import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { ComposerNode } from '../../core/types/composer';
import { ThemedButton } from '../ui/ThemedButton';
import { useComposerStore } from '../../core/composer/useComposerStore';
import { useColors } from '../../hooks/useColors';
import { InsertChildModal } from './modals/InsertChildModal';

interface Props {
    node: ComposerNode;
}

export function ComposerNodeView({ node }: Props) {
    const colors = useColors();

    const [title, setTitle] = useState(node.title);
    const [content, setContent] = useState(node.content);

    const [insertModalVisible, setInsertModalVisible] = useState(false);

    const handleInsertChild = (newNode: ComposerNode) => {
        useComposerStore.getState().addChild(node.id, newNode);
        useComposerStore.getState().saveTree(title); // optional: autosave after insert
    };

    useEffect(() => {
        setTitle(node.title);
        setContent(node.content);
    }, [node.id]);

    const handleSave = () => {
        const store = useComposerStore.getState();

        const updateNode = (current: ComposerNode): ComposerNode => {
            if (current.id === node.id) {
                return { ...current, title, content };
            }
            return {
                ...current,
                children: current.children?.map(updateNode) ?? [],
            };
        };

        const updatedRoot = updateNode(store.rootNode!);
        store.setRootNode(updatedRoot);
        store.saveTree(title);
    };

    return (
        <View style={styles.container}>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholderTextColor={colors.border}
            />

            <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Content"
                multiline
                style={[styles.input, { borderColor: colors.border, color: colors.text, height: 150 }]}
                placeholderTextColor={colors.border}
            />

            <ThemedButton title="Save Node" onPress={handleSave} />

            <ThemedButton title="Insert Child" onPress={() => setInsertModalVisible(true)} />

            <InsertChildModal
                visible={insertModalVisible}
                parentId={node.id}
                onInsert={handleInsertChild}
                onClose={() => setInsertModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, gap: 20 },
    input: { borderWidth: 1, padding: 10, borderRadius: 8 },
});
