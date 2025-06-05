import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseModal from '../../modals/BaseModal';
import { useColors } from '../../../hooks/useColors';
import { getSharedStyles } from '../../../styles/shared';

interface Props {
    visible: boolean;
    onSelect: (type: 'string' | 'prompt' | 'function' | 'snippet') => void;
    onClose: () => void;
}

export function InsertChildModal({ visible, onSelect, onClose }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    return (
        <BaseModal visible={visible} onRequestClose={onClose} blur animationType='slide'>
            <Text style={styles.title}>Add Child</Text>

            {['string', 'prompt', 'function', 'snippet'].map((type) => (
                <TouchableOpacity
                    key={type}
                    style={styles.option}
                    onPress={() => {
                        onSelect(type as any);
                        onClose();
                    }}
                >
                    <Text style={styles.optionText}>{type}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
        </BaseModal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: colors.accent },
        option: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
        optionText: { fontSize: 16, color: colors.text },
        cancel: { marginTop: 20, color: 'red', textAlign: 'center' },
    });
