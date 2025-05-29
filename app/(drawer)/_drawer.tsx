import { DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawerContent(props: any) {
    const router = useRouter();

    return (
        <DrawerContentScrollView {...props}>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                }}
                onPress={() => {
                    router.push('/settings');
                    props.navigation.closeDrawer();
                }}
            >
                <Ionicons name="settings-outline" size={20} style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16 }}>Settings</Text>
            </TouchableOpacity>

            {/* Add more items like this */}
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                }}
                onPress={() => {
                    // router.push('/logout') or show confirmation modal
                }}
            >
                <Ionicons name="log-out-outline" size={20} style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 16 }}>Log Out</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}
