import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useColors } from '../../../hooks/useColors';
import { ComposerNode } from '../../../types/composer';
import { generateUUID } from '../../../utils/uuid/generateUUID';
import { ThemedButton } from '../../ui/ThemedButton';
import { InsertEntityModal } from './InsertEntityModal';

interface Props {
    visible: boolean;
    onClose: () => void;
    onInsert: (newNode: ComposerNode) => void;
}

export function InsertChildModal({ visible, onClose, onInsert }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    const [activeEntityType, setActiveEntityType] = useState<'Prompt' | 'Function' | null>(null);

    const handleChildInsertString = async () => {
        const id = await generateUUID();

        const newNode: ComposerNode = {
            id,
            type: 'string',
            title: 'New String',
            value: '',
            children: [],
        };

        onInsert(newNode);
        onClose();
    };

    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Add Child</Text>

                        <ThemedButton title="Insert Prompt" onPress={() => setActiveEntityType('Prompt')} style={{ marginBottom: 12 }} />
                        <ThemedButton title="Insert Function" onPress={() => setActiveEntityType('Function')} style={{ marginBottom: 12 }} />
                        <ThemedButton title="Insert String" onPress={handleChildInsertString} />

                        <ThemedButton title="Cancel" onPress={onClose} colorKey="softError" style={{ marginTop: 16 }} />
                    </View>
                </View>
            </Modal>

            {activeEntityType && (
                <InsertEntityModal
                    visible={true}
                    entityType={activeEntityType}
                    onClose={() => setActiveEntityType(null)}
                    onInsert={(newNode: ComposerNode) => {
                        onInsert(newNode);
                        setActiveEntityType(null);
                        onClose();
                    }}
                />
            )}
        </>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
        container: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, width: '90%' },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: colors.accent },
    });
