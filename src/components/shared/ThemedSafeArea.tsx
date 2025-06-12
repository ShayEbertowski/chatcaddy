import React from 'react';
import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';

type ThemedSafeAreaProps = ViewProps & {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableTopInset?: boolean;
    disableBottomInset?: boolean;
};

export const ThemedSafeArea: React.FC<ThemedSafeAreaProps> = ({
    children,
    style,
    disableTopInset = false,
    disableBottomInset = false,
    ...rest
}) => {
    const colors = useColors();

    const edges: Edge[] = [];

    if (!disableTopInset) edges.push('top');
    edges.push('left', 'right');
    if (!disableBottomInset) edges.push('bottom');

    return (
        <SafeAreaView
            edges={edges}
            style={[{ flex: 1, backgroundColor: colors.background }, style]}
            {...rest}
        >
            {children}
        </SafeAreaView>
    );
};
