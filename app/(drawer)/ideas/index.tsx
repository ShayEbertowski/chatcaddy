import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { getSharedStyles } from '../../../src/styles/shared';
import { useColors } from '../../../src/hooks/useColors';
import { useIdeaStore } from '../../../src/stores/useIdeaStore';
import { Ionicons } from '@expo/vector-icons';
import EditOrDeleteActions from '../../../src/components/shared/EditOrDeleteActions';

export default function IdeasScreen() {
    const [input, setInput] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const inputRef = useRef<TextInput>(null);

    const ideas = useIdeaStore((state) => state.ideas);
    const loadIdeas = useIdeaStore((state) => state.loadIdeas);
    const addIdea = useIdeaStore((state) => state.addIdea);
    const deleteIdea = useIdeaStore((state) => state.deleteIdea);
    const updateIdea = useIdeaStore((state) => state.updateIdea);

    const colors = useColors();
    const sharedStyle = getSharedStyles(colors);
    const styles = getStyles(colors);

    const handleSubmit = async () => {
        const trimmed = input.trim();
        if (trimmed === '') return;

        if (editingId) {
            await updateIdea(editingId, trimmed);
            setEditingId(null);
        } else {
            await addIdea(trimmed);
        }
        setInput('');
    };

    const handleEdit = (id: string, content: string) => {
        setEditingId(id);
        setInput(content);
        // Focus input when editing
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleDeleteIdea = async (id: string) => {
        await deleteIdea(id);
        if (id === editingId) {
            setEditingId(null);
            setInput('');
        }
    };

    useEffect(() => {
        loadIdeas();
    }, []);

    return (
        <ThemedSafeArea>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {editingId && (
                    <Text style={{ color: colors.accent, marginBottom: 8 }}>
                        Editing Idea...
                    </Text>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        ref={inputRef}
                        style={[
                            sharedStyle.input,
                            styles.input,
                            { flex: 1 },
                            editingId && { borderColor: colors.accent, borderWidth: 2 }
                        ]}
                        placeholder={editingId ? "Edit your idea..." : "Add a new idea..."}
                        placeholderTextColor={colors.placeholder}
                        value={input}
                        onChangeText={setInput}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                        <Ionicons
                            name={editingId ? "checkmark-circle" : "add-circle"}
                            size={32}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    {editingId && (
                        <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => { setEditingId(null); setInput(''); }}>
                            <Ionicons name="close-circle" size={32} color={colors.warning} />
                        </TouchableOpacity>
                    )}
                </View>


                <FlatList
                    data={ideas}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingTop: 16 }}
                    renderItem={({ item }) => (
                        <View style={[styles.ideaCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.ideaText, { color: colors.text }]}>{item.content}</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                                <EditOrDeleteActions
                                    onEdit={() => handleEdit(item.id, item.content)}
                                    onDelete={() => handleDeleteIdea(item.id)}
                                    size={20}
                                />
                            </View>
                        </View>

                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: colors.placeholder, marginTop: 32 }}>
                            No ideas yet.
                        </Text>
                    }
                />
            </KeyboardAvoidingView>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, padding: 16 },
        inputRow: { flexDirection: 'row', alignItems: 'center' },
        input: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 },
        addButton: { marginLeft: 10 },
        ideaCard: {
            padding: 16,
            marginBottom: 12,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
            backgroundColor: colors.card,
        },

        ideaText: { flex: 1, fontSize: 16 },
        actionsRow: { flexDirection: 'row', alignItems: 'center' },
    });
