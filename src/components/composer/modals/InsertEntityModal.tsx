import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ComposerNode } from '../../../core/types/composer';
import { useColors } from '../../../hooks/useColors';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (node: ComposerNode) => void;
    nodes: ComposerNode[];
}

export function InsertEntityModal({ visible, onClose, onSelect, nodes }: Props) {
    const colors = useColors();

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Select Entity:</Text>

                    <FlatList
                        data={nodes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, { borderColor: colors.border }]}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={{ color: colors.text }}>{item.title || '(Untitled)'}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={{ color: colors.accent }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' },
    content: { padding: 24, borderRadius: 12, width: '80%', maxHeight: '80%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    item: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
    closeButton: { marginTop: 12, alignItems: 'center' },
});
