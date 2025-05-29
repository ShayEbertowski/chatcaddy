// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'apps';

                    if (route.name === 'library') iconName = 'book-outline';
                    else if (route.name === 'sandbox') iconName = 'chatbubble-outline';
                    else if (route.name === 'composer') iconName = 'code-slash-outline';
                    else if (route.name === 'toolbox') iconName = 'construct-outline';
                    else if (route.name === 'demos') iconName = 'videocam-outline';

                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                headerShown: true,
            })}
        />
    );
}
