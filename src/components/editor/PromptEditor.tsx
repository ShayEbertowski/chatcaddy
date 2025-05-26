import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';

type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'var'; name: string };

interface Props {
    value: string;
    placeholder: string;
    onChange: (updated: string) => void;
    onEditVariable?: (name: string) => void;
    selection: { start: number; end: number };
    onSelectionChange: (selection: { start: number; end: number }) => void;

}

export default function PromptEditor({
    value,
    placeholder,
    onChange,
    onEditVariable,
    onSelectionChange

}: Props) {
    const inputRef = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isFocused, setIsFocused] = useState(false);
    const blinkOpacity = useRef(new Animated.Value(1)).current;


    const parsePrompt = (text: string): PromptPart[] => {
        const regex = /{{\s*([\w\d_]+)\s*}}/g;
        const parts: PromptPart[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            parts.push({ type: 'var', name: match[1] });
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push({ type: 'text', value: text.slice(lastIndex) });
        }

        return parts;
    };

    const insertAtCursor = (text: string, insertText: string) => {
        const before = text.slice(0, selection.start);
        const after = text.slice(selection.end);
        const newText = before + insertText + after;
        const newCursorPos = before.length + insertText.length;
        onChange(newText);
        setSelection({ start: newCursorPos, end: newCursorPos });
    };

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(blinkOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(blinkOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();

        return () => loop.stop(); // cleanup on unmount
    }, []);

    const parts = parsePrompt(value);

    return (
        <TouchableOpacity
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
            style={[
                styles.editorWrapper,
                isFocused && styles.editorWrapperFocused,
            ]}
        >
            {/* Hidden input to handle typing */}
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChange}
                multiline
                editable
                selection={selection}
                onSelectionChange={({ nativeEvent: { selection } }) =>
                    onSelectionChange(selection)
                }
                style={styles.hiddenInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {/* Fake placeholder */}
            {value.length === 0 && (
                <Text style={styles.fakePlaceholder}>{placeholder}</Text>
            )}

            {/* Render parsed prompt */}
            <View style={styles.partsContainer}>
                {isFocused && (
                    <Animated.Text style={[styles.fakeCursor, { opacity: blinkOpacity }]}>
                        |
                    </Animated.Text>
                )}
                {parts.map((part, index) =>
                    part.type === 'text' ? (
                        <Text key={index} style={styles.text}>
                            {part.value}
                        </Text>
                    ) : (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onEditVariable?.(part.name)}
                            style={styles.chip}
                        >
                            <Text style={styles.chipText}>{part.name}</Text>
                        </TouchableOpacity>
                    )
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    editorWrapper: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#f9f9f9',
        justifyContent: 'flex-start',
    },
    partsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    chip: {
        backgroundColor: '#e0f0ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 4,
        marginBottom: 4,
    },
    chipText: {
        color: '#007aff',
        fontWeight: '500',
    },
    hiddenInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0.01,        // still hidden but responsive
        height: 40,           // enough to trigger keyboard and typing
        width: '100%',        // full width for typing
        color: 'transparent', // you won't see what you type directly
    },
    fakePlaceholder: {
        position: 'absolute',
        top: 12,
        left: 12,
        color: '#999',
        fontSize: 16,
        pointerEvents: 'none',
    },
    editorWrapperFocused: {
        borderColor: '#007aff',
        shadowColor: '#007aff',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    fakeCursor: {
        fontSize: 16,
        color: '#007aff',
        marginLeft: 2,
        lineHeight: 20,
    },


});
