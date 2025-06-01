import { Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColors } from '../hooks/useColors'; // adjust path if needed

type Options = {
    title: string;
    showBack?: boolean;
};

export function DrawerScreenLayout({ title, showBack = true }: Options) {
    const navigation = useNavigation();
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
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.accent} />
                        </TouchableOpacity>
                    )
                    : undefined,
            }}
        />
    );
}
