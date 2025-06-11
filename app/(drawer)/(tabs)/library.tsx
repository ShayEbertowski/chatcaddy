import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import BaseModal from '../../../src/components/modals/BaseModal';
import { useEntityStore } from '../../../src/stores/useEntityStore';
import { Entity, EntityType, UIEntityType } from '../../../src/types/entity';
import { useRouter } from 'expo-router';
import EntityCard from '../../../src/components/entity/EntityCard';
import ConfirmModal from '../../../src/components/modals/ConfirmModal';
import DropdownSelector, { DropdownOption } from '../../../src/components/shared/DropdownSelector';

const options: { label: string; value: EntityType }[] = [
    { label: 'Prompts', value: 'Prompt' },
    { label: 'Functions', value: 'Function' },
    { label: 'Snippets', value: 'Snippet' },
];

export default function EntityLibraryScreen() {
    const colors = useColors();
    const router = useRouter();
    const styles = getStyles(colors);
    const [category, setCategory] = useState<EntityType>('Prompt');
    const [modalVisible, setModalVisible] = useState(false);
    const entities = useEntityStore((state) => state.entities);
    const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);

    const filteredEntities = useMemo(
        () => entities.filter((e) => e.entityType === category),
        [entities, category]
    );

    const handleEdit = (entity: Entity) => {
        router.push({
            pathname: '/2-sandbox',
            params: { editId: entity.id },
        });
    };


    const handleRun = (entity: Entity) => {
        router.push({
            pathname: '/run-prompt',
            params: { id: entity.id },
        });
    };

    const handleDeleteRequest = (entity: Entity) => {
        setDeleteTarget(entity);
    };

    const handleConfirmDelete = async () => {
        if (deleteTarget) {
            await useEntityStore.getState().deleteEntity(deleteTarget.id);
            setDeleteTarget(null);  // close modal after deletion
        }
    };

    const handleCancelDelete = () => {
        setDeleteTarget(null);
    };


    const options: DropdownOption<UIEntityType>[] = [
        { label: 'Prompts', value: 'Prompt' },
        { label: 'Functions', value: 'Function' },
        { label: 'Snippets', value: 'Snippet' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.dropdownWrapper}>
                <DropdownSelector
                    value={category}
                    options={options}
                    onSelect={setCategory}
                />
            </View>

            {filteredEntities.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.secondaryText }}>
                    No {category}s found.
                </Text>
            ) : (
                <FlatList
                    data={filteredEntities}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <EntityCard
                            entity={item}
                            onPress={() => handleRun(item)}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDeleteRequest(item)}
                        />
                    )}
                />

            )}

            <BaseModal visible={modalVisible} blur dismissOnBackdropPress onRequestClose={() => setModalVisible(false)}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={styles.modalItem}
                        onPress={() => {
                            setCategory(opt.value);
                            setModalVisible(false);
                        }}
                    >
                        <Text style={styles.modalText}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </BaseModal>

            <ConfirmModal
                visible={!!deleteTarget}
                title="Delete Entity"
                message={`Are you sure you want to delete "${deleteTarget?.title || 'Untitled'}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Delete"
                cancelText="Cancel"
                showCheckbox={true}
            />

        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        modalItem: { padding: 16 },
        modalText: { fontSize: 16, textAlign: 'center', color: colors.accent },
        dropdownWrapper: {
            paddingTop: 16,
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: colors.background,
        },
        dropdown: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.inputBackground,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
        },
        dropdownText: { fontSize: 16, fontWeight: '500', color: colors.accent },
    });
