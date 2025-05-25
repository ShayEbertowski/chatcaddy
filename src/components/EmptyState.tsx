import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '..//theme/colors';
import { spacing } from '..//theme/spacing';
import { typography } from '../theme/typography';

type EmptyStateProps = {
    bounceValue: Animated.Value;
    onCreatePress: () => void;
};

export default function EmptyState({ bounceValue, onCreatePress }: EmptyStateProps) {
    return (
        <Animated.View style={[styles.container, { transform: [{ scale: bounceValue }] }]}>
            <MaterialIcons name="library-books" size={64} color="#ccc" />
            <Text style={styles.title}>Your Prompt Library is Empty</Text>
            <Text style={styles.subtitle}>
                Save prompts from the Sandbox to see them here.
            </Text>
            <TouchableOpacity style={styles.button} onPress={onCreatePress}>
                <Text style={styles.buttonText}>Create Your First Prompt</Text>
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
        color: colors.text,
    },
    subtitle: {
        ...typography.body,
        color: colors.mutedText,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

