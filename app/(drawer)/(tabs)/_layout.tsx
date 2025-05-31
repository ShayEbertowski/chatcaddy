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


    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
        '1-library': 'library-outline',
        '2-sandbox': 'flask-outline',
        '3-composer': 'code-slash-outline',
        '4-toolbox': 'construct-outline',
        '5-demos': 'videocam-outline',
    };

    const labels: Record<string, string> = {
        '1-library': 'Library',
        '2-sandbox': 'Sandbox',
        '3-composer': 'Composer',
        '4-toolbox': 'Toolbox',
        '5-demos': 'Demos',
    };

    return (
        <Tabs>
            {Object.keys(icons).map((routeName) => (
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
                        headerTitleStyle: {
                            color: colors.text,
                        },
                        headerStyle: {
                            backgroundColor: colors.surface,
                            borderBottomColor: colors.border,
                            borderBottomWidth: 1,
                        },
                        headerTitleAlign: 'center',
                        headerLeft: () => <UserAvatar />,
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', gap: 12, marginRight: 12 }}>
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
                        headerTitle: labels[routeName],
                    }}
                />
            ))}
        </Tabs>
    );
}
