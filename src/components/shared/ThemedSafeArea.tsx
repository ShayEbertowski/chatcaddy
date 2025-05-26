import React from 'react';
import { ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';

export const ThemedSafeArea = ({
    children,
    style,
    ...rest
}: ViewProps & { children?: React.ReactNode }) => {
    const colors = useColors();

    return (
        <SafeAreaView
            style={[{ flex: 1, backgroundColor: colors.background }, style]}
            {...rest}
        >
            {children}
        </SafeAreaView>
    );
};
