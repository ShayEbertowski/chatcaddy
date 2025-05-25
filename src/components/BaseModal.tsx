import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff', // will move to theme later
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
    },
});
