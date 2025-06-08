import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { composerStore } from '../../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../../src/core/types/composer';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { VariableEditor } from '../../../../src/components/composer/VariableEditor';
import { useColors } from '../../../../src/hooks/useColors';
import { generateUUIDSync } from '../../../../src/utils/uuid/generateUUIDSync';
import { Breadcrumb } from '../../../../src/components/composer/Breadcrumb';
import { getNodePath, getParentNodeId } from '../../../../src/utils/composer/pathUtils';

export default function ComposerNodeScreen() {
    const colors = useColors();
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();

    const rootNode = composerStore((state) => state.rootNode);
    const loadTree = composerStore((state) => state.loadTree);
    const saveTree = composerStore((state) => state.saveTree);
    const addChild = composerStore((state) => state.addChild);

    const [loading, setLoading] = useState(true);
    const [currentNode, setCurrentNode] = useState<ComposerNode | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newChildTitle, setNewChildTitle] = useState('');
    const [nodePath, setNodePath] = useState<ComposerNode[]>([]);

    useEffect(() => {
        async function load() {
            if (!rootNode) {
                await loadTree(treeId);
            }
            setLoading(false);
        }
        load();
    }, [treeId]);

    useEffect(() => {
        if (!rootNode) return;

        const path = getNodePath(rootNode, nodeId);
        setNodePath(path);

        const found = path[path.length - 1] ?? null;
        setCurrentNode(found);
    }, [rootNode, nodeId]);

    const parentId = getParentNodeId(nodePath);

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

    if (loading || !currentNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Breadcrumb treeId={treeId} rootNode={rootNode!} currentNodeId={nodeId} />

                <Text style={[styles.title, { color: colors.accent }]}>
                    Node {currentNode.title || currentNode.id}
                </Text>

                <VariableEditor node={currentNode} />

                <Text style={[styles.subtitle, { color: colors.text }]}>Children:</Text>

                {currentNode.children?.length ? (
                    <FlatList
                        data={currentNode.children}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.childButton}
                                onPress={() => router.push(`/(drawer)/(composer)/${treeId}/${item.id}`)}
                            >
                                <Text style={{ color: colors.text }}>{item.title || '(Untitled)'}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={{ color: colors.text }}>No children yet.</Text>
                )}

                <ThemedButton title="Insert Child" onPress={() => setModalVisible(true)} />

                {parentId && (
                    <ThemedButton
                        title="Back"
                        onPress={() => router.push(`/(drawer)/(composer)/${treeId}/${parentId}`)}
                    />
                )}
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
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    childButton: { padding: 12, borderRadius: 8, backgroundColor: '#333', marginBottom: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' },
    modalContent: { padding: 24, borderRadius: 12, width: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    input: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 16 },
});
