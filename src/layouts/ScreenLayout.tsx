import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColors } from '../hooks/useColors'; // adjust path if needed

type Options = {
    title: string;
    showBack?: boolean;
};

export function ScreenLayout({ title, showBack = true }: Options) {
    const router = useRouter();
    const colors = useColors();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitle: title,
                headerTitleStyle: {
                    color: colors.accent, // ← uses your theme's text color
                },
                headerStyle: {
                    backgroundColor: colors.background, // ← uses your theme's background
                },
                headerLeft: showBack
                    ? () => (
                        <TouchableOpacity
                            style={{ marginLeft: 12 }}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.accent} />
                        </TouchableOpacity>
                    )
                    : undefined,
            }}
        />
    );
}
