import React from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '../../hooks/useColors';
import { useThemeStore } from '../../stores/useThemeStore';

type BaseModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
    blur?: boolean;
    dismissOnBackdropPress?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
};

export default function BaseModal({
    visible,
    onRequestClose,
    children,
    blur = true,
    dismissOnBackdropPress = false,
}: BaseModalProps) {
    const colors = useColors();
    const mode = useThemeStore((state) => state.mode);
    const styles = getStyles(colors, mode);

    const handleBackdropPress = () => {
        if (dismissOnBackdropPress) {
            onRequestClose();
        }
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose}>
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.overlay}>
                    {blur && (
                        <>
                            <BlurView intensity={40} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                            <View style={[StyleSheet.absoluteFill, {
                                backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'
                            }]} />
                        </>
                    )}
                    <TouchableWithoutFeedback>{/* Prevent closing when tapping inside modal */}
                        <View style={styles.modalCard}>{children}</View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>, mode: 'light' | 'dark') =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            position: 'relative',
        },
        modalCard: {
            backgroundColor: mode === 'dark'
                ? 'rgba(40,40,40,0.85)'
                : 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: mode === 'dark'
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(0,0,0,0.1)',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            zIndex: 100,
        },
    });
