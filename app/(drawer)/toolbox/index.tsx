import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { ToolboxStackParamList } from '../../../src/types/navigation';



export default function Toolbox() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation<NativeStackNavigationProp<ToolboxStackParamList>>();

    const items = [
        {
            title: 'Prompt Functions',
            description: 'Reusable functions like summarize(), expand(), simplify()',
            onPress: () => navigation.navigate('PromptFunctions'),
        },
        { title: 'Tags Manager', description: 'Manage tag effects and tag groups' },
        { title: 'Composable Snippets', description: 'Reusable prompt snippets with drag-and-drop' },
        { title: 'Variables & Templates', description: 'Browse saved prompts and variable usage' },
        { title: 'Smart Graph', description: 'Future visual graph of logic flow and references' },
    ];

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.container}>
                {items.map((item, index) => (
                    <View key={index}>
                        <TouchableOpacity key={index} style={styles.item} onPress={item.onPress}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </TouchableOpacity>
                        {index < items.length - 1 && <View style={sharedStyles.divider} />}
                    </View>
                ))}
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
