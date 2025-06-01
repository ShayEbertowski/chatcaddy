import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../../src/hooks/useColors';
import FunctionLibraryScreen from '../../../src/screens/library/FunctionLibraryScreen';
import PromptLibraryScreen from '../../../src/screens/library/PromptLibraryScreen';
import { getSharedStyles } from '../../../src/styles/shared';
import BaseModal from '../../../src/components/modals/BaseModal';

type LibraryType = 'prompts' | 'functions';

const options: { label: string; value: LibraryType }[] = [
    { label: 'Prompts', value: 'prompts' },
    { label: 'Functions', value: 'functions' },
];

const UnknownCategory: React.FC = () => (
    <Text style={{ padding: 16 }}>Unknown category</Text>
);

export default function Library() {
    const colors = useColors();
    const [category, setCategory] = useState<LibraryType>('prompts');
    const [modalVisible, setModalVisible] = useState(false);

    const ScreenComponent = useMemo(() => {
        switch (category) {
            case 'prompts':
                return () => <PromptLibraryScreen category={category} />;
            case 'functions':
                return () => <FunctionLibraryScreen category={category} />;
            default:
                return UnknownCategory;
        }
    }, [category]);

    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const onClose = () => {
        setModalVisible(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.dropdownWrapper}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {options.find((o) => o.value === category)?.label}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={colors.accent} />
                </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />

            <ScreenComponent />

            <BaseModal visible={modalVisible} blur dismissOnBackdropPress onRequestClose={onClose}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={styles.modalItem}
                        onPress={() => {
                            setCategory(opt.value);
                            setModalVisible(false);
                        }}
                    >
                        <Text style={styles.modalText}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </BaseModal>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({


        modalItem: {
            padding: 16,
        },
        modalText: {
            fontSize: 16,
            textAlign: 'center',
            color: colors.accent,
        },
        dropdownWrapper: {
            paddingTop: 16,
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: colors.background,
        },
        dropdown: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.inputBackground,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
        },
        dropdownText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.accent,
        },
    });
