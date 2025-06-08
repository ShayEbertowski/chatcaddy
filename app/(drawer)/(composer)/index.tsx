// app/composer/[treeId]/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { useColors } from '../../../src/hooks/useColors';
import { ComposerTreeView } from '../../../src/components/composer/ComposerTreeView';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';

export default function ComposerTreeScreen() {
    const colors = useColors();
    const { treeId } = useLocalSearchParams<{ treeId: string }>();
    const { rootNode, setRootNode, loadTree, saveTree } = composerStore();
    const [loading, setLoading] = useState(true);
    const [insertModalVisible, setInsertModalVisible] = useState(false);
    const [newChildTitle, setNewChildTitle] = useState('');

    useEffect(() => {
        async function fetchTree() {
            await loadTree(treeId);
            setLoading(false);
        }
        fetchTree();
    }, [treeId]);

    if (loading || !rootNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    const handleInsertChild = async () => {
        if (!newChildTitle.trim()) return;

        const newChild: ComposerNode = {
            id: generateUUIDSync(),
            entityType: 'Prompt',
            title: newChildTitle,
            content: '',
            variables: {},
            children: [],
        };

        const updatedRoot: ComposerNode = {
            ...rootNode,
            children: [...(rootNode.children ?? []), newChild],
        };

        setRootNode(updatedRoot);
        await saveTree(updatedRoot.title);
        setNewChildTitle('');
        setInsertModalVisible(false);
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <ComposerTreeView node={rootNode} />

                <Text style={[styles.subtitle, { color: colors.text }]}>Children:</Text>

                {rootNode.children?.length ? (
                    <FlatList
                        data={rootNode.children}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.childButton}>
                                <Text style={{ color: colors.text }}>{item.title || '(Untitled)'}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={{ color: colors.text }}>No children yet.</Text>
                )}

                <ThemedButton title="Insert Child" onPress={() => setInsertModalVisible(true)} />
            </View>

            <Modal visible={insertModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>New Child Title:</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            value={newChildTitle}
                            onChangeText={setNewChildTitle}
                            placeholder="Enter title"
                            placeholderTextColor={colors.border}
                        />
                        <ThemedButton title="Add" onPress={handleInsertChild} />
                        <ThemedButton title="Cancel" onPress={() => setInsertModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    childButton: { padding: 12, borderRadius: 8, backgroundColor: '#333', marginBottom: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' },
    modalContent: { padding: 24, borderRadius: 12, width: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    input: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 16 },
});
