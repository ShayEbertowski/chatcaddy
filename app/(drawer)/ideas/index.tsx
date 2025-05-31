// app/(drawer)/ideas.tsx
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { getSharedStyles } from '../../../src/styles/shared';
import { useColors } from '../../../src/hooks/useColors';
import { useIdeaStore } from '../../../src/stores/useIdeaStore';
import { useEffect, useState } from 'react';


export default function IdeasScreen() {
    const [input, setInput] = useState('');

    const ideas = useIdeaStore((state) => state.ideas);
    const loadIdeas = useIdeaStore((state) => state.loadIdeas);
    const addIdea = useIdeaStore((state) => state.addIdea);
    const deleteIdea = useIdeaStore((state) => state.deleteIdea);


    const colors = useColors();
    const sharedStyle = getSharedStyles(colors);

    const handleAddIdea = async () => {
        if (input.trim() !== '') {
            await addIdea(input.trim());
            setInput('');
        }
    };

    const handleDeleteIdea = async (id: string) => {
        await deleteIdea(id);
    };


    useEffect(() => {
        loadIdeas();
    }, []);




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
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.ideaItem}>
                            <Text style={[styles.ideaText, { color: colors.text }]}>{item.content}</Text>
                            <TouchableOpacity onPress={() => handleDeleteIdea(item.id)}>
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
