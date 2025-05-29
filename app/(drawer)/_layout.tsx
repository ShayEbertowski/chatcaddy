import { Drawer } from 'expo-router/drawer';
import { View, Text, Platform, StatusBar } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';



export function CustomDrawerContent(props: any) {
    return (
        <View
            style={{
                flex: 1,
                paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight ?? 44 : 0,
                backgroundColor: '#fff', // 👈 set background if needed
            }}
        >
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                    🧠 ChatCaddy
                </Text>

                <DrawerItem
                    label="Settings"
                    onPress={() => props.navigation.navigate('settings')}
                />
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