import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';


type Props = {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

export default function CollapsibleSection({ title, isOpen, onToggle, children }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                onPress={onToggle}
                style={styles.header}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    {isOpen ? `Hide ${title}` : `Show ${title}`}
                </Text>
                <MaterialIcons
                    name={isOpen ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={colors.secondaryText} // ← ✅ dynamic icon color
                />
            </TouchableOpacity>

            {isOpen && <View style={styles.body}>{children}</View>}
        </View>
    );
}


const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        wrapper: {
            marginTop: 16,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text, // ← was '#8e8e93'
        },
        body: {
            marginTop: 12,
        },
    });

