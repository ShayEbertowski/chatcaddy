import { Drawer } from 'expo-router/drawer';
import { View, Text, Platform, StatusBar } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useColors } from '../../src/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/useAuthStore';

export function CustomDrawerContent(props: any) {
    const colors = useColors();
    const user = useAuthStore((state) => state.user);

    return (
        <View
            style={{
                flex: 1,
                paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight ?? 44 : 0,
                backgroundColor: colors.background,
            }}
        >
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingHorizontal: 16 }}>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: '600',
                        marginBottom: 8,
                        color: colors.text,
                    }}
                >
                    🧠 ChatCaddy
                </Text>

                {/* ✅ Always show Settings */}
                <DrawerItem
                    label="Settings"
                    onPress={() => props.navigation.navigate('settings')}
                    icon={({ color, size }) => (
                        <Ionicons name="settings-outline" color={color} size={size} />
                    )}
                    labelStyle={{
                        color: colors.text,
                        fontWeight: '500',
                        fontSize: 16,
                    }}
                    activeTintColor={colors.primary}
                    inactiveTintColor={colors.text}
                />

                {/* ✅ Show Sign In only if not signed in */}
                {!user && (
                    <DrawerItem
                        label="Sign In"
                        onPress={() => props.navigation.navigate('signin')}
                        icon={({ color, size }) => (
                            <Ionicons name="log-in-outline" color={color} size={size} />
                        )}
                        labelStyle={{
                            color: colors.text,
                            fontWeight: '500',
                            fontSize: 16,
                        }}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.text}
                    />
                )}
            </DrawerContentScrollView>
        </View>
    );
}


export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={CustomDrawerContent}
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
