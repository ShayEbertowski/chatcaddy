import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { useColors } from '../../../hooks/useColors';
import { useEntityStore } from '../../../stores/useEntityStore';
import { ComposerNode } from '../../../types/composer';
import { Entity, PromptEntity, FunctionEntity } from '../../../types/entity';
import { generateUUID } from '../../../utils/uuid/generateUUID';
import { ThemedButton } from '../../ui/ThemedButton';
import { createEntityAndNode } from '../../../utils/composer/createEntityAndNode';

type EntityType = 'Prompt' | 'Function';

interface Props {
    visible: boolean;
    entityType: EntityType;
    onClose: () => void;
    onInsert: (newNode: ComposerNode) => void;
}

export function InsertEntityModal({ visible, entityType, onClose, onInsert }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const { entities, addEntity } = useEntityStore();

    // Filter existing entities by type
    const filteredEntities = Object.values(entities).filter(e => e.entityType === entityType);

    const [mode, setMode] = useState<'Search' | 'Create'>('Search');
    const [selected, setSelected] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    // Insert existing entity
    const handleSelectInsert = () => {
        if (!selected) return;
        const entity = filteredEntities.find(e => e.id === selected);
        if (!entity) return;

        const newNode: ComposerNode = {
            id: entity.id,
            type: entityType.toLowerCase() as ComposerNode['type'],
            title: entity.title,
            children: [],
        };

        onInsert(newNode);
        onClose();
    };

    // Create new entity & insert
    const handleCreateInsert = async () => {
        const { entity, node } = await createEntityAndNode(entityType, newTitle, newContent);
        addEntity(entity);
        onInsert(node);
        onClose();
    };


    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Insert {entityType}</Text>

                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            onPress={() => setMode('Search')}
                            style={[styles.toggleButton, mode === 'Search' && styles.toggleButtonActive]}
                        >
                            <Text style={[styles.toggleText, mode === 'Search' && styles.toggleTextActive]}>Search</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setMode('Create')}
                            style={[styles.toggleButton, mode === 'Create' && styles.toggleButtonActive]}
                        >
                            <Text style={[styles.toggleText, mode === 'Create' && styles.toggleTextActive]}>Create New</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'Search' ? (
                        <FlatList
                            data={filteredEntities}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        selected === item.id && styles.selectedItem,
                                    ]}
                                    onPress={() => setSelected(item.id)}
                                >
                                    <Text style={styles.itemText}>{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <>
                            <TextInput
                                placeholder={`${entityType} Title`}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder={`${entityType} Content`}
                                value={newContent}
                                onChangeText={setNewContent}
                                style={[styles.input, { height: 120 }]}
                                multiline
                            />
                            <ThemedButton
                                title="Create & Insert"
                                onPress={handleCreateInsert}
                                style={{ marginTop: 20 }}
                                disabled={newTitle.trim() === ''}
                            />
                        </>
                    )}

                    {mode === 'Search' && (
                        <ThemedButton
                            title="Insert Selected"
                            onPress={handleSelectInsert}
                            disabled={!selected}
                            style={{ marginTop: 20 }}
                        />
                    )}

                    <ThemedButton title="Cancel" onPress={onClose} colorKey="softError" style={{ marginTop: 12 }} />
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
        container: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, width: '90%', maxHeight: '90%' },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.accent },
        toggleRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
        toggleButton: { paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, marginHorizontal: 8, borderRadius: 8 },
        toggleButtonActive: { backgroundColor: colors.primary },
        toggleText: { color: colors.text },
        toggleTextActive: { color: colors.onPrimary, fontWeight: 'bold' },
        item: { padding: 12, borderBottomWidth: 1, borderColor: colors.border },
        selectedItem: { backgroundColor: colors.primary + '22' },
        itemText: { fontSize: 16 },
        input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginBottom: 12, color: colors.text },
    });
