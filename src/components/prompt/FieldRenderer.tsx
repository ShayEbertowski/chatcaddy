import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { RichVariableRenderer } from '../shared/RichVariableRenderer';
import { Variable } from '../../types/prompt';

type FieldRendererProps = {
    name: string;
    variable: Variable;
    value: string;
    richMode: boolean;
    onRichToggle: (enabled: boolean) => void;
    onValueChange: (newValue: string) => void;
    onChipPress: (chipName: string) => void;
    onInsertPress: () => void;
};

export function FieldRenderer({
    name, variable, value, richMode, onRichToggle, onValueChange, onChipPress, onInsertPress
}: FieldRendererProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
                <Text style={styles.label}>{name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {variable.richCapable && (
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleText}>Use Chips</Text>
                            <Switch value={richMode} onValueChange={onRichToggle} />
                        </View>
                    )}
                    {richMode && (
                        <TouchableOpacity onPress={onInsertPress}>
                            <MaterialIcons name="add-circle" size={28} color={colors.accent} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.inputBox}>
                {richMode ? (
                    <RichVariableRenderer value={value || ''} onVariablePress={onChipPress} />
                ) : (
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onValueChange}
                        placeholder="Enter value"
                        placeholderTextColor={colors.secondaryText}
                    />
                )}
            </View>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, color: colors.accent, marginBottom: 4 },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    inputBox: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
        padding: 10,
    },
    input: {
        color: colors.text,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    toggleText: {
        fontSize: 12,
        color: colors.secondaryText,
        marginRight: 6,
    },
});
