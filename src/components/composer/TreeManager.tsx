import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { composerStore } from '../../core/composer/composerStore';
import { ComposerTreeRecord } from '../../core/types/composer';

export function LogicraftTreeManager() {
    const colors = useColors();
    const [trees, setTrees] = useState<ComposerTreeRecord[]>([]);
    const [newTreeName, setNewTreeName] = useState('');

    useEffect(() => {
        refresh();
    }, []);

    async function refresh() {
        await composerStore.getState().listTrees();
        setTrees(composerStore.getState().availableTrees);
    }

    async function handleCreate() {
        if (!newTreeName.trim()) return;
        composerStore.getState().setRootNode({
            id: crypto.randomUUID(),
            entityType: 'Prompt',
            title: newTreeName,
            content: '',
            variables: {},
            children: [],
        });
        await composerStore.getState().saveTree(newTreeName);
        setNewTreeName('');
        refresh();
    }

    async function handleLoad(id: string) {
        await composerStore.getState().loadTree(id);
        // later: navigate into composer editor
    }

    async function handleDelete(id: string) {
        await composerStore.getState().clearTree();
        await composerStore.getState().deleteTree(id);
        refresh();
    }

    return (
        <ThemedSafeArea>
            <View style={{ padding: 16 }}>
                <Text style={styles.header}>Composer Trees</Text>

                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <TextInput
                        value={newTreeName}
                        onChangeText={setNewTreeName}
                        placeholder="New tree name"
                        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    />
                    <TouchableOpacity
                        onPress={handleCreate}
                        style={[styles.button, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={trees}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.treeItem}>
                            <TouchableOpacity onPress={() => handleLoad(item.id)}>
                                <Text style={{ color: colors.text }}>{item.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    button: {
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    treeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
});
