import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { capitalize, removeLastChar } from '../../utils/string/stringHelper';

type EmptyStateProps = {
    icon?: React.ReactNode;  // Optional future icon override
    title: string;
    subtitle: string;
    buttonLabel: string;
    onButtonPress: () => void;
};

export default function EmptyState({
    icon,
    title,
    subtitle,
    buttonLabel,
    onButtonPress,
}: EmptyStateProps) {
    const colors = useColors();
    const bounceValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceValue, {
                    toValue: 1.05,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(3000),
            ])
        );

        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: bounceValue }] }]}>
            {icon ?? <MaterialIcons name="library-books" size={64} color={colors.secondaryText} />}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={onButtonPress}
            >
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                    {buttonLabel}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    title: {
        ...typography.heading,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.lg,
        color: '#666666', // colors.secondaryText will override this anyway
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        marginTop: spacing.md,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
