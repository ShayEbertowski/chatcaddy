import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../../src/hooks/useColors';
import { useAuthStore } from '../../../src/stores/useAuthStore';

export default function SignInScreen() {
    const colors = useColors();
    const router = useRouter();

    const signIn = useAuthStore((s) => s.signIn);
    const signUp = useAuthStore((s) => s.signUp);
    const loading = useAuthStore((s) => s.loading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const styles = getStyles(colors);

    async function handleSignIn() {
        try {
            await signIn(email, password);
            router.back();  // 👈 or router.replace('/your-home-page') if you want
        } catch (e: any) {
            alert(e.message);
        }
    }

    async function handleSignUp() {
        try {
            await signUp(email, password);
            alert('Account created! You can now sign in.');
        } catch (e: any) {
            alert(e.message);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor={colors.primary}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor={colors.primary}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                secureTextEntry
            />

            {loading ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                <>
                    <TouchableOpacity style={[
                        styles.button,
                        {
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.primary,
                        },
                    ]} onPress={handleSignIn}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
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
    });
