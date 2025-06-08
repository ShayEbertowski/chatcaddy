import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';

type ToggleOption = {
    label: string;
    value: string;
};

type Props = {
    options: ToggleOption[];
    value: string;
    onChange: (val: string) => void;
};

export default function ToggleRow({ options, value, onChange }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={[
                            styles.button,
                            isSelected && styles.buttonSelected,
                        ]}
                    >
                        <Text
                            style={[
                                styles.text,
                                isSelected && styles.textSelected,
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignSelf: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            overflow: 'hidden',
            marginTop: 16,
            marginBottom: 16,
        },
        button: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            alignItems: 'center',
        },
        buttonSelected: {
            backgroundColor: colors.accent,
        },
        text: {
            color: colors.secondaryText,
            fontWeight: '500',
            fontSize: 16,
        },
        textSelected: {
            color: colors.onAccent,
            fontWeight: '700',
        },
    });
