import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import { useThemeStore } from '../../../src/stores/useThemeStore';
import { View, TouchableOpacity } from 'react-native';
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
                headerTitleAlign: 'center',
                headerTintColor: colors.primary,
                headerLeft: () => <UserAvatar />,
                headerRight: () => (
                    <View style={{ flexDirection: 'row', gap: 12, marginRight: 12 }}>
                        <TouchableOpacity onPress={() => router.push('/ideas')}>
                            <Ionicons name="bulb-outline" size={24} color="orange" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggle}>
                            <Ionicons name={colors.isDark ? 'moon' : 'sunny'} size={24} color={colors.toggle} />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        />
    );
}
