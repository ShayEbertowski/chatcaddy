// app/(drawer)/ideas.tsx
import { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { getSharedStyles } from '../../../src/styles/shared';
import { useColors } from '../../../src/hooks/useColors';

export default function IdeasScreen() {
    const [ideas, setIdeas] = useState<string[]>([]);
    const [input, setInput] = useState('');

    const colors = useColors();
    const sharedStyle = getSharedStyles(colors);

    const handleAddIdea = () => {
        if (input.trim() !== '') {
            setIdeas((prevIdeas) => [...prevIdeas, input.trim()]);
            setInput('');
        }
    };

    const handleDeleteIdea = (index: number) => {
        setIdeas((prevIdeas) => prevIdeas.filter((_, i) => i !== index));
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <TextInput
                    style={sharedStyle.input}
                    placeholder="Your idea..."
                    placeholderTextColor={colors.placeholder}
                    value={input}
                    onChangeText={setInput}
                />
                <Button title="Submit" onPress={handleAddIdea} />
                <FlatList
                    data={ideas}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.ideaItem}>
                            <Text style={[styles.ideaText, { color: colors.text}]}>{item}</Text>
                            <TouchableOpacity onPress={() => handleDeleteIdea(index)}>
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </ThemedSafeArea>
    );
}

/*
  TODO: Future improvements
  - Add metadata: who wrote the comment and when (timestamp).
  - Restrict deletion to only the user who wrote the comment.
  - Allow users to set visibility: private (only me and user) or public (anonymous or named).
*/

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    ideaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    ideaText: {
        flex: 1,
    },
    deleteText: {
        color: 'red',
        marginLeft: 16,
    },
});
