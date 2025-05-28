import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePromptsStore } from '../../stores/usePromptsStore';
import { useThemeMode } from '../../theme/ThemeProvider';
import { light, dark } from '../../theme/colors';

export default function DevMenu() {
    const [visible, setVisible] = useState(false);
    const deleteAllPrompts = usePromptsStore((s) => s.deleteAll);
    const seedSampleData = usePromptsStore((s) => s.seedSampleData);
    const { theme } = useThemeMode();
    const isDark = theme === 'dark';
    const colors = isDark ? dark : light;

    const handleAction = (action: string) => {
        setVisible(false);
        switch (action) {
            case 'deleteAll':
                deleteAllPrompts();
                console.log('🧨 Deleted all prompts');
                break;
            case 'seed':
                seedSampleData();
                console.log('🌱 Seeded sample data');
                break;
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setVisible(true)} style={{ paddingRight: 16 }}>
                <Ionicons name="flask-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.menu, { backgroundColor: colors.card }]}>
                        <Text style={[styles.header, { color: colors.text }]}>Dev Tools</Text>

                        <TouchableOpacity onPress={() => handleAction('deleteAll')}>
                            <Text style={[styles.item, { color: colors.text }]}>🧨 Delete All Prompts</Text>
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity onPress={() => handleAction('seed')}>
                            <Text style={[styles.item, { color: colors.text }]}>🌱 Seed Sample Data</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 50,
        paddingRight: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menu: {
        borderRadius: 8,
        padding: 12,
        minWidth: 220,
        elevation: 4,
    },
    header: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    item: {
        paddingVertical: 8,
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 8,
        opacity: 0.2,
    },
});
