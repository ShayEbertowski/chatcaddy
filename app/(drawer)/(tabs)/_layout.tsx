import { Tabs, useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
    const navigation = useNavigation();
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerTitle: '',
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
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.push('/admin')}
                        style={{ marginRight: 16 }}
                    >
                        <Ionicons name="flask-outline" size={24} />
                    </TouchableOpacity>
                ),
                tabBarActiveTintColor: 'dodgerblue',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="demos"
                options={{
                    title: 'Demos',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="play-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sandbox"
                options={{
                    title: 'Sandbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="flask-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="toolbox"
                options={{
                    title: 'Toolbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="construct-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="composer"
                options={{
                    title: 'Composer',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="code-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

// ✅ Hide this layout from drawer (if nested)
export const unstable_settings = {
    drawerItemStyle: { display: 'none' },
};
