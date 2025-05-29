import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from './_drawer';

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={CustomDrawerContent} // ✅ use your custom drawer UI
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer>
    );
}
