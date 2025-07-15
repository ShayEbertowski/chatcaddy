// components/ui/BottomSheetWrapper.tsx
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

type BottomSheetWrapperProps = {
    children: ReactNode;
};

export const BottomSheetWrapper = forwardRef<any, BottomSheetWrapperProps>(
    ({ children }, ref) => {
        const sheetRef = useRef<BottomSheetModal>(null);
        const snapPoints = useMemo(() => ['40%', '80%'], []);

        useImperativeHandle(ref, () => ({
            present: () => sheetRef.current?.present(),
            close: () => sheetRef.current?.dismiss(),
        }));

        return (
            <BottomSheetModalProvider>
                <BottomSheetModal
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    backgroundStyle={styles.sheet}
                    handleIndicatorStyle={styles.handle}
                >
                    <View style={styles.content}>
                        {children}
                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>
        );
    }
);


const styles = StyleSheet.create({
    sheet: {
        borderRadius: 20,
        backgroundColor: '#121212', // dark mode-friendly
    },
    handle: {
        backgroundColor: '#888',
    },
    content: {
        flex: 1,
        padding: 16,
    },
});
