import React from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useColors } from '../../hooks/useColors';

export default function UserAvatar() {
    const navigation = useNavigation();
    const user = useAuthStore((state) => state.user);
    const colors = useColors();

    return (
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            {user ? (
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 8,
                        marginBottom: 4
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                        {user.email?.charAt(0).toUpperCase() ?? '?'}
                    </Text>
                </View>
            ) : (
                <Image
                    source={require('../../../assets/avatar.png')}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                />
            )}
        </TouchableOpacity>
    );
}
