import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors'; // Adjust if needed
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type EmptyStateProps = {
    bounceValue: Animated.Value;
    onCreatePress: () => void;
};

export default function EmptyState({ bounceValue, onCreatePress }: EmptyStateProps) {
    const colors = useColors();

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: bounceValue }] }]}>
            <MaterialIcons name="library-books" size={64} color={colors.secondaryText} />
            <Text style={[styles.title, { color: colors.text }]}>Your Prompt Library is Empty</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Save prompts from the Sandbox to see them here.
            </Text>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={onCreatePress}
            >
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                    Create Your First Prompt
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
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: '600' as const,
        fontSize: 16,
    },
});
