import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseModal from './BaseModal';
import { useColors } from '../../hooks/useColors';
import { useLibraryItems } from '../../stores/useLibraryItems';

type InsertModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    insertTarget: string;
    onInsert: (value: string) => void;
    entityType: 'Prompt' | 'Function' | 'Snippet';
};

export default function InsertModalV2({ visible, onRequestClose, insertTarget, onInsert, entityType }: InsertModalProps) {
    const colors = useColors();
    const styles = getStyles(colors);
    const items = useLibraryItems(entityType);

    return (
        <BaseModal visible={visible} blur onRequestClose={onRequestClose}>
            <Text style={styles.title}>Insert {entityType}</Text>

            {items.length === 0 ? (
                <Text>No {entityType}s available</Text>
            ) : (
                items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={{ paddingVertical: 10 }}
                        onPress={() => {
                            onInsert(item.content);
                            onRequestClose();
                        }}
                    >
                        <Text style={{ color: colors.primary }}>{item.title}</Text>
                    </TouchableOpacity>
                ))
            )}

            <TouchableOpacity onPress={onRequestClose} style={[styles.button, { marginTop: 16 }]}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </BaseModal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 20,
        },
        button: {},
        cancelText: {
            color: colors.text,
        },
    });
