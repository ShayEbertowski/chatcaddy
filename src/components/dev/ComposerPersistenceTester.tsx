import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { generateUUIDSync } from '../../utils/uuid/generateUUIDSync';
import { ComposerNode, useComposerStore } from '../../stores/useComposerStore';

export function ComposerPersistenceTester() {
    const colors = useColors();
    const [trees, setTrees] = useState<{ id: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        refreshTreeList();
    }, []);

    async function refreshTreeList() {
        await useComposerStore.getState().listTrees();
        const available = useComposerStore.getState().availableTrees;
        setTrees(available);
    }

    async function handleSave() {
        try {
            setSaving(true);
            const newRoot: ComposerNode = {
                id: generateUUIDSync(),
                entityType: 'Prompt',
                title: 'Test Root',
                content: '',
                variables: {},
                childIds: [],
                updatedAt: new Date().toISOString(),
            };

            const treeId = generateUUIDSync();
            const tree = {
                id: treeId,
                name: 'Test Tree',
                rootId: newRoot.id,
                nodes: { [newRoot.id]: newRoot },
                updatedAt: newRoot.updatedAt,
            };

            useComposerStore.setState({
                activeTreeId: treeId,
                composerTree: tree,
            });

            const id = await useComposerStore.getState().saveTree();
            console.log('✅ Saved with ID:', id);
            await refreshTreeList();
        } finally {
            setSaving(false);
        }
    }

    async function handleLoad(treeId: string) {
        try {
            setLoading(true);
            await useComposerStore.getState().loadTree(treeId);
            console.log('📥 Loaded tree:', treeId);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ThemedSafeArea>
            <View style={{ padding: 16 }}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Test Tree'}</Text>
                </TouchableOpacity>

                <FlatList
                    data={trees}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.treeItem, { borderColor: colors.primary }]}
                            onPress={() => handleLoad(item.id)}
                        >
                            <Text style={{ color: colors.text }}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    style={{ marginTop: 20 }}
                />
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    treeItem: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
    },
});
