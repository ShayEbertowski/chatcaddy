import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Switch,
} from 'react-native';
import { useColors } from '../../hooks/useColors';

type Props = {
    visible: boolean;
    mode: 'Variable' | 'Function' | 'Snippet';
    isEdit: boolean;
    initialName: string;
    initialValue: string;
    initialRichCapable?: boolean;
    onClose: () => void;
    onInsert: (
        mode: 'Variable' | 'Function' | 'Snippet',
        name: string,
        value: string,
        richCapable?: boolean
    ) => void;
};

export default function InsertModal({
    visible,
    onClose,
    onInsert,
    initialName,
    initialValue,
    initialRichCapable = false,
}: Props) {
    const colors = useColors();
    const [mode, setMode] = useState<'Variable' | 'Function' | 'Snippet'>('Variable');
    const [name, setName] = useState(initialName);
    const [value, setValue] = useState(initialValue);
    const [richCapable, setRichCapable] = useState(initialRichCapable);

    const styles = getStyles(colors);

    const handleInsert = () => {
        const trimmedName = name.trim();
        const trimmedValue = value.trim();
        onInsert(mode, trimmedName, trimmedValue, richCapable);
        setName('');
        setValue('');
        setRichCapable(false);
        onClose();
    };

    useEffect(() => {
        setName(initialName);
        setValue(initialValue);
        setRichCapable(initialRichCapable);
    }, [initialName, initialValue, initialRichCapable, visible]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.tabRow}>
                        {['Variable', 'Function', 'Snippet'].map((m) => {
                            const isActive = mode === m;
                            return (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.tabButton, isActive && styles.tabActive]}
                                    onPress={() => setMode(m as typeof mode)}
                                >
                                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                        {m}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TextInput
                        placeholder={`${mode} name`}
                        placeholderTextColor={colors.mutedText}
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder={`${mode} value`}
                        placeholderTextColor={colors.mutedText}
                        value={value}
                        onChangeText={setValue}
                        style={[styles.input, { height: 100 }]}
                        multiline
                    />

                    {/* ✅ Add richCapable toggle if mode === 'Variable' */}
                    {mode === 'Variable' && (
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleText}>Allow Chips</Text>
                            <Switch value={richCapable} onValueChange={setRichCapable} />
                        </View>
                    )}

                    <TouchableOpacity onPress={handleInsert} style={styles.insertButton}>
                        <Text style={styles.insertText}>Insert {mode}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 24,
        },
        modal: {
            backgroundColor: colors.card,
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
            backgroundColor: colors.inputBackground,
        },
        tabActive: {
            backgroundColor: colors.primary,
        },
        tabText: {
            fontSize: 16,
            color: colors.text,
        },
        tabTextActive: {
            color: colors.onPrimary,
            fontWeight: '600',
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
        },
        toggleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        toggleText: {
            fontSize: 14,
            color: colors.text,
        },
        insertButton: {
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 6,
        },
        insertText: {
            color: colors.onPrimary,
            fontWeight: '600',
            textAlign: 'center',
        },
        cancelText: {
            marginTop: 12,
            textAlign: 'center',
            color: colors.primary,
        },
    });
