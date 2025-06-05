import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useColors } from '../../hooks/useColors';

type SavePromptModalProps = {
    visible: boolean;
    title: string;
    prompt: string;
    onChangeTitle: (text: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
    selectedFolder: string;
    loading: boolean;
};

export default function SavePromptModal({
    visible,
    title,
    prompt,
    onChangeTitle,
    onCancel,
    onConfirm,
    selectedFolder,
    loading,
}: SavePromptModalProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Save this prompt?</Text>

                    {loading ? (
                        <View style={{ paddingVertical: 20 }}>
                            <Text style={{ color: colors.text, marginBottom: 10 }}>Generating smart title...</Text>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    ) : (
                        <>
                            <View style={styles.box}>
                                <Text style={styles.label}>Title:</Text>
                                <TextInput
                                    value={title}
                                    onChangeText={onChangeTitle}
                                    style={styles.input}
                                    placeholder="Give your prompt a short title"
                                    placeholderTextColor={colors.secondaryText}
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
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        container: {
            backgroundColor: colors.card,
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
            color: colors.text,
        },
        box: {
            backgroundColor: colors.inputBackground,
            padding: 12,
            borderRadius: 8,
            marginVertical: 12,
            width: '100%',
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        prompt: {
            fontSize: 14,
            color: colors.text,
            marginTop: 4,
        },
        input: {
            fontSize: 14,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            backgroundColor: colors.background,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
        },
        button: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: colors.primary,
            borderRadius: 6,
            marginLeft: 10,
        },
        buttonText: {
            color: colors.onPrimary,
            fontWeight: '600',
        },
        cancel: {
            backgroundColor: colors.toggleBackground,
        },
        cancelText: {
            color: colors.text,
        },
    });
