import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../src/hooks/useColors';

export default function StackLayout() {
    const router = useRouter();
    const colors = useColors();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.accent,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 12 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.accent} />
                    </TouchableOpacity>
                ),
            }}
        />
    );
}
