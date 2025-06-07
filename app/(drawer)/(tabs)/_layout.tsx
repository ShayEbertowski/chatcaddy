import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import UserAvatar from '../../../src/components/shared/UserAvatar';
import { useColors } from '../../../src/hooks/useColors';
import { useThemeStore } from '../../../src/stores/useThemeStore';
import { useEditorStore } from '../../../src/stores/useEditorStore';
import { useVariableStore } from '../../../src/stores/useVariableStore';

export default function TabLayout() {
    const router = useRouter();
    const colors = useColors();
    const toggle = useThemeStore((s) => s.toggle);

    const icons = {
        library: 'library-outline',
        sandbox: 'flask-outline',
        'composer-entry': 'rocket-outline',
    } as const;

    const labels = {
        library: 'Library',
        sandbox: 'Sandbox',
        'composer-entry': 'Composer',
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
            <Tabs.Screen
                name="library"
            />
            <Tabs.Screen
                name="sandbox"
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        useEditorStore.getState().clearEditingEntity();
                        useVariableStore.getState().clearAll();
                        router.replace('/(drawer)/(tabs)/2-sandbox');
                    },
                }}
            />
            <Tabs.Screen
                name="composer-entry"
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push('/(drawer)/(composer)');
                    },
                }}
            />
        </Tabs>
    );
}
