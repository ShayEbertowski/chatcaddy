import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import BaseModal from '../../../src/components/modals/BaseModal';
import ConfirmModal from '../../../src/components/modals/ConfirmModal';
import DropdownSelector, { DropdownOption } from '../../../src/components/shared/DropdownSelector';
import { supabase } from '../../../src/lib/supabaseClient';
import { useRouter } from 'expo-router';
import EntityCard from '../../../src/components/entity/EntityCard';
import { IndexedEntity } from '../../../src/types/entity';
import { useComposerStore } from '../../../src/stores/useComposerStore';

const options: DropdownOption<IndexedEntity['entityType']>[] = [
    { label: 'Prompts', value: 'Prompt' },
    { label: 'Functions', value: 'Function' },
    { label: 'Snippets', value: 'Snippet' },
];

export default function EntityLibraryScreen() {
    const colors = useColors();
    const router = useRouter();
    const styles = getStyles(colors);

    const [category, setCategory] = useState<IndexedEntity['entityType']>('Prompt');
    const [modalVisible, setModalVisible] = useState(false);
    const [entities, setEntities] = useState<IndexedEntity[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<IndexedEntity | null>(null);

    const promptVersion = useComposerStore((s) => s.promptVersion);

    useEffect(() => {
        async function loadEntities() {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('id, tree_id, root_id, entity_type, title, content, variables'); // ✅ explicitly include root_id

            if (error) {
                console.error('Error loading indexed entities:', error);
                return;
            }

            const normalized = (data || []).map((item) => ({
                ...item,
                entityType: item.entity_type,
                root_id: item.root_id,
                variables: item.variables ?? {},
            }));

            setEntities(normalized);
        }

        loadEntities();
    }, [promptVersion]);

    const filteredEntities = useMemo(
        () => entities.filter((e) => e.entityType === category),
        [entities, category]
    );

    const handleEdit = (entity: IndexedEntity) => {
        router.push({
            pathname: '/2-sandbox',
            params: { editId: entity.id },
        });
    };

    const handleRun = (entity: IndexedEntity) => {
        console.log('Running with treeId:', entity.tree_id);
        console.log('Running with nodeId (root_id):', entity.root_id);
        router.push({
            pathname: '/(drawer)/run',
            params: {
                treeId: entity.tree_id,
                nodeId: entity.root_id,
            },
        });

    };

    const handleDeleteRequest = (entity: IndexedEntity) => {
        setDeleteTarget(entity);
    };

    const handleConfirmDelete = async () => {
        if (deleteTarget) {
            const { error } = await supabase
                .from('indexed_entities')
                .delete()
                .eq('id', deleteTarget.id);

            if (!error) {
                setEntities((prev) => prev.filter((e) => e.id !== deleteTarget.id));
            } else {
                console.error('Failed to delete indexed entity:', error);
            }

            setDeleteTarget(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteTarget(null);
    };

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
    });
