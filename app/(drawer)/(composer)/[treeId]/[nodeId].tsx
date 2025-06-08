import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ComposerTreeView } from '../../../../src/components/composer/ComposerTreeView';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../../src/core/types/composer';
import { useColors } from '../../../../src/hooks/useColors';
import { generateUUIDSync } from '../../../../src/utils/uuid/generateUUIDSync';
import { findNodePath } from '../../../../src/utils/composer/findNodePath';
import { VariableEditor } from '../../../../src/components/composer/VariableEditor';

export default function ComposerNodeScreen() {
    const colors = useColors();
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();

    // Zustand subscriptions
    const rootNode = composerStore((state) => state.rootNode);
    const loadTree = composerStore((state) => state.loadTree);
    const saveTree = composerStore((state) => state.saveTree);
    const addChild = composerStore((state) => state.addChild);

    const [currentNode, setCurrentNode] = useState<ComposerNode | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newChildTitle, setNewChildTitle] = useState('');
    const [nodePath, setNodePath] = useState<ComposerNode[]>([]);

    // Single effect: load tree
    useEffect(() => {
        if (!rootNode) {
            loadTree(treeId);
        }
    }, [treeId, rootNode]);

    // Find current node and path after rootNode is populated
    useEffect(() => {
        if (!rootNode || !nodeId) return;

        const foundNode = findNode(rootNode, nodeId);
        setCurrentNode(foundNode);

        const path = findNodePath(rootNode, nodeId);
        setNodePath(path);
    }, [rootNode, nodeId]);

    function findNode(node: ComposerNode, searchId: string): ComposerNode | null {
        if (node.id === searchId) return node;
        for (const child of node.children) {
            const found = findNode(child, searchId);
            if (found) return found;
        }
        return null;
    }

    const handleInsertChild = async () => {
        if (!newChildTitle.trim() || !currentNode) return;

        const newChild: ComposerNode = {
            id: generateUUIDSync(),
            entityType: 'Prompt',
            title: newChildTitle,
            content: '',
            variables: {},
            children: [],
        };

        addChild(currentNode.id, newChild);
        await saveTree(rootNode!.title);

        setNewChildTitle('');
        setModalVisible(false);
    };

    // ✅ Use Zustand state directly for loading indicator
    if (!rootNode || !currentNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <View style={styles.breadcrumbs}>
                    {nodePath.map((node, index) => (
                        <TouchableOpacity
                            key={node.id}
                            onPress={() => router.push(`/composer/${treeId}/${node.id}`)}
                        >
                            <Text style={[styles.breadcrumb, { color: colors.accent }]}>
                                {node.title || '(Untitled)'} {index < nodePath.length - 1 ? ' / ' : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ComposerTreeView node={currentNode} />
                <VariableEditor node={currentNode} />

                <Text style={[styles.subtitle, { color: colors.text }]}>Children:</Text>

                {currentNode.children?.length ? (
                    <FlatList
                        data={currentNode.children}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.childButton}
                                onPress={() => router.push(`/composer/${treeId}/${item.id}`)}
                            >
                                <Text style={{ color: colors.text }}>{item.title || '(Untitled)'}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={{ color: colors.text }}>No children yet.</Text>
                )}

                <ThemedButton title="Insert Child" onPress={() => setModalVisible(true)} />
            </View>

            <Modal visible={modalVisible} transparent animationType="slide">
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
                        <ThemedButton title="Cancel" onPress={() => setModalVisible(false)} />
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
    breadcrumbs: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    breadcrumb: { fontWeight: 'bold', marginRight: 4 },
});
