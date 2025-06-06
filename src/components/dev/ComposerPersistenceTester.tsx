import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerTreeRecord } from '../../core/types/composer';

export function ComposerPersistenceTester() {
    const colors = useColors();
    const [trees, setTrees] = useState<ComposerTreeRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        refreshTreeList();
    }, []);

    async function refreshTreeList() {
        await composerStore.getState().listTrees();
        setTrees(composerStore.getState().availableTrees);
    }

    async function handleSave() {
        try {
            setSaving(true);
            const id = await composerStore.getState().saveTree('Test Tree');
            console.log('Saved with ID:', id);
            await refreshTreeList();
        } finally {
            setSaving(false);
        }
    }

    async function handleLoad(treeId: string) {
        try {
            setLoading(true);
            await composerStore.getState().loadTree(treeId);
            console.log('Loaded tree:', treeId);
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
                    <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Current Tree'}</Text>
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
