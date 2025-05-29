import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useColors } from '../../../src/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const navigation = useNavigation();
    const colors = useColors();
    const insets = useSafeAreaInsets();


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
        <Tabs
            screenOptions={({ route }) => ({
                tabBarLabel: labels[route.name] ?? route.name,
                tabBarIcon: ({ color, size }) => (
                    <Ionicons
                        name={icons[route.name] ?? 'apps-outline'}
                        size={size}
                        color={color}
                    />
                ),
                tabBarActiveTintColor: colors.active,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    color: colors.text
                },
             
                headerTitleStyle: {
                    color: colors.text,
                },
                headerStyle: {
                    backgroundColor: colors.surface, // or colors.background if you prefer
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1, // optional for a divider effect
                },
                headerTitleAlign: 'center', // ✅ center the title
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        style={{ marginLeft: 12 }}
                    >
                        <Image
                            source={require('../../../assets/avatar.png')}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                    </TouchableOpacity>
                ),
                headerTitle: labels[route.name] ?? route.name, // ✅ just a string, not a View
            })}
        />



    );
}
