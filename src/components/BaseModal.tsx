import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '../hooks/useColors';

type BaseModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
    blur?: boolean;
};

export default function BaseModal({
    visible,
    onRequestClose,
    children,
    blur = true, // default to true for modal feel
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
                {blur && (
                    <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <View style={styles.modalCard}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            position: 'relative',
        },
        modalCard: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            zIndex: 10,
        },
    });
