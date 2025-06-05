import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ToolboxStackParamList } from '../../../src/types/navigation';



export default function Demos() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation<NativeStackNavigationProp<ToolboxStackParamList>>();

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
             <Text style={styles.title}>Demos will be here</Text>
            </ScrollView>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            padding: 20,
        },
        item: {
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        description: {
            fontSize: 14,
            color: colors.secondaryText,
        },
    });
