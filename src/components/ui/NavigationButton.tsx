import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

type Props = {
    icon: 'chevron-back' | 'chevron-forward';
    onPress: () => void;
    style?: ViewStyle;
    size?: number;
};

export function NavigationButton({
    icon,
    onPress,
    style,
    size = 28,
}: Props) {
    const colors = useColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor: colors.navigation }, style]}
        >
            <Ionicons name={icon} size={size} color={colors.onNavigation} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
});
