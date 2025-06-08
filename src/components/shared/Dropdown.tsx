import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, Pressable, StyleSheet
} from 'react-native';
import { useColors } from '../../hooks/useColors';

type Option = { label: string; value: string };

type Props = {
    options: Option[];
    value: string;
    onSelect: (val: string) => void;
};

export default function Dropdown({ options, value, onSelect }: Props) {
    const [visible, setVisible] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);

    const selectedLabel = options.find(opt => opt.value === value)?.label ?? value;

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>{selectedLabel}</Text>
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.modal}>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => {
                                    onSelect(opt.value);
                                    setVisible(false);
                                }}
                                style={styles.item}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        opt.value === value && styles.itemTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        button: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 10,
            backgroundColor: colors.card,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
        },
        modal: {
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 10,
            width: 250,
        },
        item: {
            paddingVertical: 12,
            alignItems: 'center',
        },
        itemText: {
            fontSize: 16,
            color: colors.text,
        },
        itemTextActive: {
            color: colors.primary,
            fontWeight: '700',
        },
    });
