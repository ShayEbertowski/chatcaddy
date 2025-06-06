import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { ThemedButton } from '../../ui/ThemedButton';
import { useColors } from '../../../hooks/useColors';
import { ComposerNode } from '../../../types/composer';
import { generateUUID } from '../../../utils/uuid/generateUUID';

interface Props {
    visible: boolean;
    onClose: () => void;
    onInsert: (newNode: ComposerNode) => void;
}

export function InsertChildModal({ visible, onClose, onInsert }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const [insertType, setInsertType] = useState<'Prompt' | 'Function' | null>(null);

    const handleInsertEntity = async () => {
        if (!insertType) return;

        const id = await generateUUID();
        const newNode: ComposerNode = {
            id,
            type: insertType.toLowerCase() as ComposerNode['type'],
            title: `New ${insertType}`,
            children: [],
        };

        onInsert(newNode);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Insert Child</Text>

                    <ThemedButton title="Insert Prompt" onPress={() => setInsertType('Prompt')} style={{ marginBottom: 12 }} />
                    <ThemedButton title="Insert Function" onPress={() => setInsertType('Function')} style={{ marginBottom: 12 }} />

                    {insertType && (
                        <ThemedButton title="Create & Insert" onPress={handleInsertEntity} style={{ marginTop: 20 }} />
                    )}

                    <ThemedButton title="Cancel" onPress={onClose} colorKey="softError" style={{ marginTop: 16 }} />
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
        container: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, width: '90%' },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.accent },
    });
