import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useColors } from '../hooks/useColors';

type BaseModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
};

export default function BaseModal({
    visible,
    onRequestClose,
    children,
}: BaseModalProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>{children}</View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        container: {
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            elevation: 5,
        },
    });
