import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../src/hooks/useColors';

export default function ForgotPasswordScreen() {
    const colors = useColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
                Forgot Password Screen
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
