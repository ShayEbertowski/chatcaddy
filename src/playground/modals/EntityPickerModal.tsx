import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ComposerNode } from '../../core/types/composer';


interface Props {
    visible: boolean;
    onClose: () => void;
    availableNodes: ComposerNode[];
    onSelect: (node: ComposerNode) => void;
}

export function EntityPickerModal({ visible, onClose, availableNodes, onSelect }: Props) {
    const colors = useColors();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.overlay, { backgroundColor: colors.modalBackground || '#000000AA' }]}>
                <View style={[styles.modal, { backgroundColor: colors.card }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Select Entity</Text>

                    <ScrollView>
                        {availableNodes.map((node) => (
                            <TouchableOpacity
                                key={node.id}
                                style={styles.item}
                                onPress={() => {
                                    onSelect(node);
                                    onClose();
                                }}
                            >
                                <Text style={[styles.itemText, { color: colors.text }]}>{node.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modal: { width: '80%', padding: 20, borderRadius: 10, maxHeight: '80%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    item: { paddingVertical: 10 },
    itemText: { fontSize: 16 },
    closeButton: { marginTop: 20, alignSelf: 'center' },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
});
