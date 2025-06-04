import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import BaseModal from '../../../src/components/modals/BaseModal';
import { useEntityStore } from '../../../src/stores/useEntityStore';
import { Entity, EntityType } from '../../../src/types/entity';
import { useRouter } from 'expo-router';

const options: { label: string; value: EntityType }[] = [
    { label: 'Prompts', value: 'Prompt' },
    { label: 'Functions', value: 'Function' },
    { label: 'Snippets', value: 'Snippet' },  // You can easily add more entity types here
];

export default function EntityLibraryScreen() {
    const colors = useColors();
    const router = useRouter();
    const [category, setCategory] = useState<EntityType>('Prompt');
    const [modalVisible, setModalVisible] = useState(false);
    const entities = useEntityStore((state) => state.entities);

    const filteredEntities = useMemo(
        () => entities.filter((e) => e.entityType === category),
        [entities, category]
    );

    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const onClose = () => setModalVisible(false);

    const handleEdit = (entity: Entity) => {
        router.push({
            pathname: '/2-sandbox',
            params: {
                editId: entity.id,
            },
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.dropdownWrapper}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {options.find((o) => o.value === category)?.label}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={colors.accent} />
                </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />

            {filteredEntities.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.secondaryText }}>
                    No {category}s found.
                </Text>
            ) : (
                <FlatList
                    data={filteredEntities}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleEdit(item)}
                            style={{
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                            }}
                        >
                            <Text style={{ fontSize: 16, color: colors.text }}>{item.title || '(Untitled)'}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <BaseModal visible={modalVisible} blur dismissOnBackdropPress onRequestClose={onClose}>
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
