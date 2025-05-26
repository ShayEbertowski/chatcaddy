import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';

import FunctionLibraryScreen from './FunctionLibraryScreen';
import PromptLibraryScreen from './PromptLibraryScreen';

type LibraryType = 'prompts' | 'functions';

const options: { label: string; value: LibraryType }[] = [
    { label: 'Prompts', value: 'prompts' },
    { label: 'Functions', value: 'functions' },
];

const UnknownCategory: React.FC = () => (
    <Text style={{ padding: 16 }}>Unknown category</Text>
);

export default function LibraryScreen() {
    const [category, setCategory] = useState<LibraryType>('prompts');
    const [modalVisible, setModalVisible] = useState(false);

    const ScreenComponent: React.ComponentType = useMemo(() => {
        switch (category) {
            case 'prompts':
                return PromptLibraryScreen;
            case 'functions':
                return FunctionLibraryScreen;
            default:
                return UnknownCategory as React.ComponentType;
        }
    }, [category]);


    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {options.find((o) => o.value === category)?.label}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScreenComponent />

            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modal}>
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
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 16,
        backgroundColor: '#fff',
    },
    dropdown: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 250,
        paddingVertical: 8,
    },
    modalItem: {
        padding: 16,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
