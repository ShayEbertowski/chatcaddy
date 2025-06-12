import React from 'react';
import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';

type ThemedSafeAreaProps = ViewProps & {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableTopInset?: boolean;
    disableBottomInset?: boolean;
    fullscreen?: boolean; // Enables fullscreen mode with manual inset handling
};

export const ThemedSafeArea: React.FC<ThemedSafeAreaProps> = ({
    children,
    style,
    disableTopInset = false,
    disableBottomInset = false,
    fullscreen = false,
    ...rest
}) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // If fullscreen, we manually control top inset padding
    const edges: Edge[] = [];

    if (!disableTopInset && !fullscreen) edges.push('top');
    edges.push('left', 'right');
    if (!disableBottomInset && !fullscreen) edges.push('bottom');

    // Reliable top padding for fullscreen mode (handles notch and flat devices)
    // TEMP: Hardcoded top padding in fullscreen mode to align content visually.
    // This avoids issues with inconsistent header spacing on some devices.
    // TODO: Investigate proper safe area + layout stack behavior (insets + RPE padding)
    // NOTE: Value was tuned manually to work across iPhone models with notch.
    const fullscreenPaddingTop = fullscreen ? insets.top + 64 : 0;
    return (
        <SafeAreaView
            edges={edges}
            style={[
                {
                    flex: 1,
                    backgroundColor: colors.background,
                    paddingTop: fullscreenPaddingTop,
                },
                style,
            ]}
            {...rest}
        >
            {children}
        </SafeAreaView>
    );
};
