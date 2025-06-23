import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import UserAvatar from '../../../src/components/shared/UserAvatar';
import { useColors } from '../../../src/hooks/useColors';
import { useThemeStore } from '../../../src/stores/useThemeStore';

export default function TabLayout() {
    const router = useRouter();
    const colors = useColors();
    const toggle = useThemeStore((s) => s.toggle);

    const icons = {
        entry: 'rocket-outline',
        sandbox: 'flask-outline',
        library: 'library-outline',
    } as const;

    const labels = {
        entry: 'Composer',
        sandbox: 'Sandbox',
        library: 'Library',
    } as const;

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarLabel: labels[route.name as keyof typeof labels],
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={icons[route.name as keyof typeof icons]} size={size} color={color} />
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                },
                headerTitle: labels[route.name as keyof typeof labels],
                headerTitleStyle: { color: colors.accent },
                headerStyle: { backgroundColor: colors.surface },
                headerTitleAlign: 'center',
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
            })}
        >
            <Tabs.Screen name="entry" />
            <Tabs.Screen
                name="sandbox"
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.replace('/(drawer)/(tabs)/2-sandbox');
                    },
                }}
            />
            <Tabs.Screen name="library" />
        </Tabs>
    );
}
