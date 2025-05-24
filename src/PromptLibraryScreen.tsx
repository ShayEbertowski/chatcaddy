import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Animated,
  Easing,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/types/navigation';

const PROMPT_STORAGE_KEY = '@prompt_library';

export default function PromptLibraryScreen() {
  const [prompts, setPrompts] = useState([]);
  const [tapBehavior, setTapBehavior] = useState('preview');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(1)).current;
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);


  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROMPT_STORAGE_KEY);
        if (stored) {
          setPrompts(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load prompts:', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadPrompts);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const loadTapBehavior = async () => {
      const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
      setTapBehavior(behavior || 'preview');
    };
    loadTapBehavior();
  }, []);


  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.05,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(3000), // wait 3 seconds before next bounce
      ])
    );

    bounceLoop.start();

    return () => bounceLoop.stop(); // cleanup if screen unmounts
  }, []);

  const handlePromptTap = async (promptText: string) => {
    try {
      const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');

      navigation.navigate('Main', {
        screen: 'Sandbox',
        params: {
          prefill: promptText,
          autoRun: behavior === 'run',
        },
      });
    } catch (error) {
      console.error('Failed to handle prompt tap:', error);
    }
  };

  const renderPromptItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePromptTap(item.content)}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPreview} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="library-books" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Prompt Library is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save prompts from the Sandbox to see them here.
      </Text>
      <AnimatedTouchable
        style={[styles.emptyButton, { transform: [{ scale: bounceValue }] }]}
        onPress={() =>
          navigation.navigate('Main', { screen: 'Sandbox', params: {} })
        }
      >
        <Text style={styles.emptyButtonText}>Create Your First Prompt</Text>
      </AnimatedTouchable>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={prompts}
        keyExtractor={(item) => item.id}
        renderItem={renderPromptItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardPreview: {
    color: '#555',
    fontSize: 14,
  },

  // New empty state styles:
  emptyContainer: {
    flex: 1, // takes full height
    justifyContent: 'center', // centers vertically
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007aff',
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
