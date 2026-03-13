/**
 * Forgot Password Screen
 * Request password reset
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useResetPassword } from '@/features/auth/hooks/use-auth';
import { Card, Button, Input } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const resetPassword = useResetPassword();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    try {
      await resetPassword.mutateAsync({ email: email.trim() });
      Alert.alert(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar email');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Esqueceu a senha?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Digite seu email para receber instruções de redefinição
          </Text>
        </View>

        <Card style={styles.card}>
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

          <Button
            title="Enviar instruções"
            onPress={handleResetPassword}
            loading={resetPassword.isPending}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Voltar ao login"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    padding: 24,
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
  },
});
