import React from 'react';
import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';

type ThemedSafeAreaProps = ViewProps & {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableTopInset?: boolean;
};

export const ThemedSafeArea: React.FC<ThemedSafeAreaProps> = ({ children, style, disableTopInset = false, ...rest }) => {
    const colors = useColors();

    // dynamically calculate edges based on disableTopInset
    const edges: Edge[] = disableTopInset
        ? ['left', 'right', 'bottom']
        : ['top', 'left', 'right', 'bottom'];

    return (
        <SafeAreaView
            style={[{ flex: 1, backgroundColor: colors.background }, style]}
            edges={edges}
            {...rest}
        >
            {children}
        </SafeAreaView>
    );
};
