import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type Props = {
    visible: boolean;
    mode: 'Variable' | 'Function' | 'Snippet';
    isEdit: boolean;
    initialName: string;
    initialValue: string;
    onClose: () => void;
    onInsert: (mode: 'Variable' | 'Function' | 'Snippet', name: string, value: string) => void;
};


export default function InsertModal({ visible, onClose, onInsert, initialName, initialValue }: Props) {
    const [mode, setMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');
    const [name, setName] = useState(initialName);
    const [value, setValue] = useState(initialValue);


    const handleInsert = () => {
        const trimmedName = name.trim();
        const trimmedValue = value.trim();
        onInsert(mode, trimmedName, trimmedValue);
        setName('');
        setValue('');
        onClose();
    };

    useEffect(() => {
        setName(initialName);
        setValue(initialValue);
    }, [initialName, initialValue, visible]);


    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Mode Selector */}
                    <View style={styles.tabRow}>
                        {['Variable', 'Function', 'Snippet'].map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[styles.tabButton, mode === m && styles.tabActive]}
                                onPress={() => setMode(m as typeof mode)}
                            >
                                <Text style={[styles.tabText, mode === m && { color: '#fff' }]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Shared Inputs */}
                    <TextInput
                        placeholder={`${mode} name`}
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder={`${mode} value`}
                        value={value}
                        onChangeText={setValue}
                        style={[styles.input, { height: 100 }]}
                        multiline
                    />

                    <TouchableOpacity onPress={handleInsert} style={styles.insertButton}>
                        <Text style={styles.insertText}>Insert {mode}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ marginTop: 12, textAlign: 'center', color: '#007AFF' }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    tabRow: {
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'space-around',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    tabActive: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    insertButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 6,
    },
    insertText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
});
