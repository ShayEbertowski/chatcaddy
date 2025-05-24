import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VariableModalProps } from '../../types/components';

const VariableModal: React.FC<VariableModalProps> = ({
    visible,
    variableName,
    variableValue,
    onChangeName,
    onChangeValue,
    onClose,
    onInsert,
}) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.helperRow}>
                        <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color="#007aff"
                            style={{ marginRight: 8, marginTop: 1 }}
                        />
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

                    <Text style={[styles.label, { marginTop: 12 }]}>Default value:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. gluten-free"
                        value={variableValue}
                        onChangeText={onChangeValue}
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={styles.button}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onInsert} style={[styles.button, { marginLeft: 10 }]}>
                            <Text style={{ color: '#007aff', fontWeight: '600' }}>Insert</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default VariableModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
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
});
