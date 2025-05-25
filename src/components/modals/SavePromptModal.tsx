import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type SavePromptModalProps = {
    visible: boolean;
    title: string;
    prompt: string;
    onChangeTitle: (text: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function SavePromptModal({
    visible,
    title,
    prompt,
    onChangeTitle,
    onCancel,
    onConfirm,
}: SavePromptModalProps) {
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Save this prompt?</Text>

                    <View style={styles.box}>
                        <Text style={styles.label}>Title:</Text>
                        <TextInput
                            value={title}
                            onChangeText={onChangeTitle}
                            style={styles.input}
                            placeholder="Give your prompt a short title"
                        />

                        <Text style={[styles.label, { marginTop: 12 }]}>Prompt:</Text>
                        <Text style={styles.prompt}>{prompt}</Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
                            <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onConfirm}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    box: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    prompt: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    input: {
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 4,
        backgroundColor: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#007aff',
        borderRadius: 6,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancel: {
        backgroundColor: '#f0f0f0',
    },
    cancelText: {
        color: '#555',
    },
});
