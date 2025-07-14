import { Stack } from 'expo-router';
import { Platform, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../src/hooks/useColors';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

function CustomHeaderTitle({ children }: { children: React.ReactNode }) {
    const colors = useColors();
    return (
        <View style={{ marginLeft: Platform.OS === 'android' ? 4 : 0 }}>
            <Text style={{ color: colors.accent, fontSize: 18 }} numberOfLines={1}>
                {children}
            </Text>
        </View>
    );
}

export default function StackLayout() {
    const colors = useColors();
    const navigation = useNavigation();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.accent,
                headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
                headerTitle: (props) => <CustomHeaderTitle {...props} />,
                headerLeft: () =>
                    navigation.canGoBack() ? (
                        <TouchableOpacity onPress={navigation.goBack} style={{ paddingLeft: 12 }}>
                            <Ionicons
                                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                                size={24}
                                color={colors.accent}
                            />
                        </TouchableOpacity>
                    ) : null,
            }}
        />
    );
}
