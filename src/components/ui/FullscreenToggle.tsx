import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    isFullscreen: boolean;
    onToggle: () => void;
    style?: ViewStyle;
};

export function FullscreenToggle({ isFullscreen, onToggle, style }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <TouchableOpacity
            onPress={onToggle}
            style={[
                {
                    position: 'absolute',
                    top: insets.top + 12,
                    right: 16,
                    zIndex: 1000,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                },
                style,
            ]}
        >
            <Text style={{ color: 'white', fontSize: 14 }}>
                {isFullscreen ? '⤡ Exit' : '⤢ Fullscreen'}
            </Text>
        </TouchableOpacity>
    );
}
