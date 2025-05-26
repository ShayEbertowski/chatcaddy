import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

export default function AvatarDrawerButton() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ paddingLeft: 16 }}
        >
            <Image
                source={require('../../assets/avatar.png')}
                style={{ width: 32, height: 32, borderRadius: 16 }}
            />
        </TouchableOpacity>
    );
}
