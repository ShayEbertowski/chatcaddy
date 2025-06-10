import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    StyleSheet
} from 'react-native';
import { useColors } from '../../hooks/useColors';
import { uiEntityTypes, UIEntityType } from '../../types/entity';

type EntityTypeDropdownProps = {
    value: UIEntityType;
    options: UIEntityType[];
    onSelect: (type: UIEntityType) => void;
    readOnly?: boolean; // 👈 optional read-only mode
};

export default function EntityTypeDropdown({
    value,
    options,
    onSelect,
    readOnly
}: EntityTypeDropdownProps) {
    const [visible, setVisible] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    if (!readOnly) setVisible(true);
                }}
                style={[
                    styles.dropdownButton,
                    readOnly && { opacity: 0.5 }, // 👈 dimmed appearance
                ]}
            >
                <Text style={styles.dropdownButtonText}>{value}</Text>
            </TouchableOpacity>


            {!readOnly && (
                <Modal transparent visible={visible} animationType="fade">
                    <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
                        <View style={styles.modalContent}>
                            {options.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => {
                                        onSelect(type);
                                        setVisible(false);
                                    }}
                                    style={styles.dropdownItem}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            type === value && styles.dropdownItemTextActive
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}

        </>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        dropdownButton: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 10,
            backgroundColor: colors.card,
        },
        dropdownButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.secondaryText
        },

        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
        },
        modalContent: {
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 10,
            width: 250,
        },
        dropdownItem: {
            paddingVertical: 12,
            alignItems: 'center',
        },
        dropdownItemText: {
            fontSize: 16,
            color: colors.text,
        },
        dropdownItemTextActive: {
            color: colors.primary,
            fontWeight: '700',
        },
    });
