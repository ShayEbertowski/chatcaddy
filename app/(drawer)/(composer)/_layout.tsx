import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import { useThemeStore } from '../../../src/stores/useThemeStore';
import { View, TouchableOpacity, Platform } from 'react-native';
import UserAvatar from '../../../src/components/shared/UserAvatar';
import { useRouter } from 'expo-router';

export default function ComposerLayout() {
    const colors = useColors();
    const toggle = useThemeStore((s) => s.toggle);
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTitleStyle: { color: colors.accent },
                headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
                headerTintColor: colors.primary,
                headerLeft: () => (
                    <View style={{ paddingLeft: Platform.OS === 'android' ? 16 : 12 }}>
                        <UserAvatar />
                    </View>
                ),
                headerRight: () => (
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 12,
                            marginRight: Platform.OS === 'android' ? 16 : 12,
                        }}
                    >
                        <TouchableOpacity onPress={() => router.push('/ideas')}>
                            <Ionicons name="bulb-outline" size={24} color="orange" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggle}>
                            <Ionicons
                                name={colors.isDark ? 'moon' : 'sunny'}
                                size={24}
                                color={colors.toggle}
                            />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        />
    );
}
