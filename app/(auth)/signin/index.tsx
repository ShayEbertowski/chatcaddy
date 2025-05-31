import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../../src/hooks/useColors';
import { useAuthStore } from '../../../src/stores/useAuthStore';

export default function SignInScreen() {
    const colors = useColors();
    const router = useRouter();

    const signIn = useAuthStore((s) => s.signIn);
    const loading = useAuthStore((s) => s.loading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const styles = getStyles(colors);

    const handleSignIn = async () => {
        try {
            await signIn(email, password);
            router.back();
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Login</Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                secureTextEntry
            />

            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgot, { color: colors.accent }]}>
                    Forgot Password?
                </Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            )}

            <View style={styles.signupContainer}>
                <Text style={{ color: colors.text }}>Are you a new user? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text style={[styles.signupText, { color: colors.accent }]}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
        alignSelf: 'center',
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    forgot: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        fontWeight: 'bold',
    },
});
