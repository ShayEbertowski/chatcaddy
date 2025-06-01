import { Drawer } from 'expo-router/drawer';
import { View, Text, Platform, StatusBar } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useColors } from '../../src/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useRouter } from 'expo-router';


export function CustomDrawerContent(props: any) {
    const colors = useColors();
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);
    const router = useRouter();

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight ?? 44 : 0, backgroundColor: colors.background }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, color: colors.accent }}>
                    🌯 ChatCaddy
                </Text>

                <DrawerItem
                    label="Settings"
                    onPress={() => props.navigation.navigate('settings')}
                    icon={({ color, size }) => (
                        <Ionicons name="settings-outline" color={colors.accent} size={size} />
                    )}
                    labelStyle={{ color: colors.accent, fontWeight: '500', fontSize: 16 }}
                    activeTintColor={colors.primary}
                    inactiveTintColor={colors.text}
                />

                {!user && (
                    <DrawerItem
                        label="Sign In"
                        onPress={() => router.push('/(auth)/signin')}
                        icon={({ color, size }) => (
                            <Ionicons name="log-in-outline" color={color} size={size} />
                        )}
                        labelStyle={{ color: colors.text, fontWeight: '500', fontSize: 16 }}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.text}
                    />
                )}
            </DrawerContentScrollView>

            {/* 👇 This keeps logout pinned to bottom */}
            {user && (
                <View style={{ padding: 16, borderTopWidth: 1, borderColor: colors.border }}>
                    <DrawerItem
                        label="Log Out"
                        onPress={async () => await signOut()}
                        icon={({ color, size }) => (
                            <Ionicons name="log-out-outline" color={colors.accent} size={size} />
                        )}
                        labelStyle={{ color: colors.accent, fontWeight: '500', fontSize: 16 }}
                        activeTintColor={colors.primary}
                        inactiveTintColor={colors.text}
                    />
                </View>
            )}
        </View>
    );
}


export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
