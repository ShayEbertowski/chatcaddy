import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';

export default function DemosScreen() {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Demos and instructions coming soon!</Text>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        text: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
    });
