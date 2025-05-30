import React from 'react';
import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';

type ThemedSafeAreaProps = ViewProps & {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export const ThemedSafeArea: React.FC<ThemedSafeAreaProps> = ({ children, style, ...rest }) => {
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
