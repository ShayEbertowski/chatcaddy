import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Modal } from 'react-native';
import { ThemedButton } from '../../ui/ThemedButton';
import { useColors } from '../../../hooks/useColors';
import { ComposerNode } from '../../../core/types/composer';
import { generateUUID } from '../../../utils/uuid/generateUUID';

interface Props {
    visible: boolean;
    parentId: string;
    onClose: () => void;
    onInsert: (newNode: ComposerNode) => void;
}

export function InsertChildModal({ visible, parentId, onClose, onInsert }: Props) {
    const colors = useColors();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleInsert = async () => {
        if (!title.trim()) return;

        const newNode: ComposerNode = {
            id: await generateUUID(),
            entityType: 'Prompt',
            title,
            content,
            variables: {},
            children: [],
        };

        onInsert(newNode);
        setTitle('');
        setContent('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Child Title"
                        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                        placeholderTextColor={colors.border}
                    />
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Child Content"
                        multiline
                        style={[styles.input, { borderColor: colors.border, color: colors.text, height: 120 }]}
                        placeholderTextColor={colors.border}
                    />
                    <ThemedButton title="Insert Child" onPress={handleInsert} />
                    <ThemedButton title="Cancel" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    container: { padding: 20, borderRadius: 12, width: '90%', gap: 20 },
    input: { borderWidth: 1, padding: 10, borderRadius: 8 },
});
