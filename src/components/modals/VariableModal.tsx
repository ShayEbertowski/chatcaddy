import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from '../BaseModal';


export interface VariableModalProps {
    visible: boolean;
    variableName: string;
    variableValue: string;
    onChangeName: (name: string) => void;
    onChangeValue: (value: string) => void;
    onInsert: () => void;
    onClose: () => void;
}

export default function VariableModal({
    visible,
    variableName,
    onChangeName,
    onClose,
    onInsert,
}: VariableModalProps) {
    return (
        <BaseModal visible={visible} onRequestClose={onClose}>
            <View style={styles.helperRow}>
                <Ionicons name="information-circle-outline" size={18} color="#007aff" style={styles.icon} />
                <Text style={styles.helper}>
                    Insert variables using <Text style={{ fontStyle: 'italic' }}>{"{{yourVariable}}"}</Text> syntax.
                </Text>
            </View>

            <Text style={styles.label}>Variable name:</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. topic"
                value={variableName}
                onChangeText={onChangeName}
                autoFocus
            />

            <View style={styles.buttons}>
                <TouchableOpacity onPress={onClose} style={styles.button}>
                    <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onInsert} style={[styles.button, { marginLeft: 10 }]}>
                    <Text style={{ color: '#007aff', fontWeight: '600' }}>Insert</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    label: {
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    helperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    helper: {
        color: '#444',
        fontSize: 14,
        flex: 1,
        flexWrap: 'wrap',
    },
    icon: {
        marginRight: 8,
        marginTop: 1,
    },
});
