/**
 * Login Screen
 * User authentication with email/password and Google
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSignIn, useGoogleSignIn } from '@/features/auth/hooks/use-auth';
import { Card, Button, Input } from '@/components/ui';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const signIn = useSignIn();
  const googleSignIn = useGoogleSignIn();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    try {
      await signIn.mutateAsync({ email: email.trim(), password });
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error.message || 'Verifique suas credenciais');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn.mutateAsync();
    } catch (error: any) {
      Alert.alert('Erro ao entrar com Google', error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="cart" size={64} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Market House</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Bem-vindo de volta!
            </Text>
          </View>

          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Entrar</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleSignIn}
              loading={signIn.isPending}
              fullWidth
              style={styles.button}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>

            <Button
              title="Continuar com Google"
              onPress={handleGoogleSignIn}
              loading={googleSignIn.isPending}
              variant="outline"
              fullWidth
              leftIcon={<Ionicons name="logo-google" size={20} color={colors.primary} />}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Não tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  passwordContainer: {
    position: 'relative',
    marginTop: 16,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 42,
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
