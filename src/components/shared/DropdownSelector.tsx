import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import BaseModal from '../modals/BaseModal';

export type DropdownOption<T> = {
    label: string;
    value: T;
};

type DropdownSelectorProps<T> = {
    value: T;
    options: DropdownOption<T>[];
    onSelect: (value: T) => void;
    readOnly?: boolean;
};

export default function DropdownSelector<T>({
    value,
    options,
    onSelect,
    readOnly,
}: DropdownSelectorProps<T>) {
    const [visible, setVisible] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);

    const selectedLabel = options.find(opt => opt.value === value)?.label ?? 'Select';

    return (
        <>
            <TouchableOpacity
                style={[styles.dropdown, readOnly && { opacity: 0.5 }]}
                onPress={() => {
                    if (!readOnly) setVisible(true);
                }}
            >
                <Text style={styles.dropdownText}>{selectedLabel}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.accent} />
            </TouchableOpacity>

            <BaseModal
                visible={visible}
                blur
                dismissOnBackdropPress
                onRequestClose={() => setVisible(false)}
            >
                {options.map((opt) => (
                    <TouchableOpacity
                        key={String(opt.value)}
                        style={styles.modalItem}
                        onPress={() => {
                            onSelect(opt.value);
                            setVisible(false);
                        }}
                    >
                        <Text style={styles.modalText}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </BaseModal>
        </>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        dropdown: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.inputBackground,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
        },
        dropdownText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.accent,
        },
        modalItem: {
            padding: 16,
        },
        modalText: {
            fontSize: 16,
            textAlign: 'center',
            color: colors.accent,
        },
    });
