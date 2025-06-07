import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { ThemedSafeArea } from '../src/components/shared/ThemedSafeArea';
import { useRouter } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import { composerStore } from '../src/core/composer/composerStore';
import { useStore } from 'zustand';
import uuid from 'react-native-uuid';


export default function HomeScreen() {
    const colors = useColors();
    const router = useRouter();
    const [newTreeName, setNewTreeName] = useState('');

    useEffect(() => {
        composerStore.getState().listTrees();
    }, []);

    const trees = useStore(composerStore, (state) => state.availableTrees);

    const handleCreate = async () => {
        if (!newTreeName.trim()) return;

        const id = uuid.v4() as string;

        composerStore.getState().setRootNode({
            id,
            entityType: 'Prompt',
            title: newTreeName,
            content: '',
            variables: {},
            children: [],
        });

        await composerStore.getState().saveTree(newTreeName);
        setNewTreeName('');
    };

    const handleLoad = async (id: string) => {
        await composerStore.getState().loadTree(id);
        router.push(`/composer/${composerStore.getState().rootNode?.id}`);
    };

    return (
        <ThemedSafeArea>
            <Text style={[styles.title, { color: colors.text }]}>Your ChatCaddy Trees</Text>

            <TextInput
                value={newTreeName}
                onChangeText={setNewTreeName}
                placeholder="New Tree Name"
                placeholderTextColor={colors.placeholder}
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />

            <TouchableOpacity onPress={handleCreate} style={[styles.button, { backgroundColor: colors.accent }]}>
                <Text style={[styles.buttonText, { color: colors.background }]}>Create New Tree</Text>
            </TouchableOpacity>

            <FlatList
                data={trees}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleLoad(item.id)} style={[styles.treeItem, { borderBottomColor: colors.border }]}>
                        <Text style={{ color: colors.text }}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    treeItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
});
