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

    type RouteName = '1-library' | '2-sandbox' | '3-composer-entry';

    const icons: Record<RouteName, keyof typeof Ionicons.glyphMap> = {
        '1-library': 'library-outline',
        '2-sandbox': 'flask-outline',
        '3-composer-entry': 'rocket-outline'
    };

    const labels: Record<RouteName, string> = {
        '1-library': 'Library',
        '2-sandbox': 'Sandbox',
        '3-composer-entry': 'Composer'
    };

    return (
        <Tabs>
            {(Object.keys(icons) as RouteName[]).map((routeName) => {
                const isSandbox = routeName === '2-sandbox';
                const isComposer = routeName === '3-composer-entry';

                return (
                    <Tabs.Screen
                        key={routeName}
                        name={routeName}
                        options={{
                            tabBarLabel: labels[routeName],
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name={icons[routeName]} size={size} color={color} />
                            ),
                            tabBarActiveTintColor: colors.primary,
                            tabBarStyle: {
                                backgroundColor: colors.background,
                                borderTopColor: colors.border,
                            },
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
                            headerTitle: labels[routeName],
                        }}
                        {...((isSandbox || isComposer) && {
                            listeners: {
                                tabPress: (e) => {
                                    e.preventDefault();

                                    if (isSandbox) {
                                        useEditorStore.getState().clearEditingEntity();
                                        useVariableStore.getState().clearAll();
                                        router.replace('/2-sandbox');
                                    }

                                    if (isComposer) {
                                        router.push('/composer');
                                    }
                                },
                            },
                        })}
                    />
                );
            })}
        </Tabs>
    );
}
