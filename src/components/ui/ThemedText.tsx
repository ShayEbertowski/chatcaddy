import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColors } from '../../hooks/useColors';

export function ThemedText(props: TextProps) {
    const colors = useColors();
    return <Text {...props} style={[{ color: colors.text }, props.style]} />;
}
