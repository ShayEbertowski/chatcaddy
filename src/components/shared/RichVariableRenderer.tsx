import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { parsePromptParts } from '../../utils/prompt/promptManager';
import { useColors } from '../../hooks/useColors';

type Props = {
    value: string;
    onChipPress?: (name: string) => void;  // optional future functionality
};

type RichVariableRendererProps = {
    value: string;
    onVariablePress?: (variableName: string) => void;
};

export function RichVariableRenderer({ value, onVariablePress }: RichVariableRendererProps) {
    const colors = useColors();
    const parts = parsePromptParts(value);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {parts.map((part, i) => {
                if (part.type === 'variable') {
                    return (
                        <TouchableOpacity key={i} onPress={() => onVariablePress?.(part.name)} style={{
                            backgroundColor: colors.accent + '33',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                            marginRight: 6,
                            marginBottom: 6,
                        }}>
                            <Text style={{ color: colors.accent, fontWeight: '500' }}>{part.name}</Text>
                        </TouchableOpacity>
                    );
                }
                return (
                    <Text key={i} style={{ color: colors.text, fontSize: 15 }}>
                        {part.value}
                    </Text>
                );
            })}
        </View>
    );
}
