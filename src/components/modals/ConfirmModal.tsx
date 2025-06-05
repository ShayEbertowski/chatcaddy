import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useColors } from '../../hooks/useColors';
import BaseModal from './BaseModal';
import { useSettingsStore } from '../../stores/useSettingsStore';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    showCheckbox?: boolean;
};

export default function ConfirmModal({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Discard',
    cancelText = 'Cancel',
    showCheckbox
}: Props) {
    const colors = useColors();

    const dontShowAgain = !useSettingsStore((s) => s.confirmPromptDelete);
    const confirmPromptDelete = useSettingsStore((s) => s.confirmPromptDelete);
    const setConfirmPromptDelete = useSettingsStore((s) => s.setConfirmPromptDelete);

    const handleToggle = () => {
        setConfirmPromptDelete(!confirmPromptDelete);
    };

    return (
        <BaseModal visible={visible} onRequestClose={onCancel} blur>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>

            {showCheckbox && (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Switch
                            value={confirmPromptDelete}
                            onValueChange={setConfirmPromptDelete}
                            trackColor={{
                                false: colors.switchTrackOff, 
                                true: colors.switchTrackOn
                            }}
                        />
                        <Text style={{ marginLeft: 8, color: colors.secondaryText }}>
                            Don’t show this again
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 16 }}>
                        You can re-enable this confirmation in Settings.
                    </Text>
                </>
            )}

            <View style={styles.actions}>
                <TouchableOpacity onPress={onCancel} style={styles.button}>
                    <Text style={{ color: colors.text }}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onConfirm} style={styles.button}>
                    <Text style={{ color: colors.error }}>{confirmText}</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    message: { fontSize: 15, marginBottom: 24 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
    button: { padding: 10 },
});
