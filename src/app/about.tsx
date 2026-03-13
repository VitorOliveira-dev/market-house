/**
 * About Screen
 * Information about the app
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Card, Button } from '@/components/ui';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.logoCard}>
          <Ionicons name="cart" size={64} color={colors.primary} />
          <Text style={[styles.appName, { color: colors.text }]}>Market House</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Versão 1.0.0</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sobre o App</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Market House é um aplicativo de gerenciamento de compras e despensa que ajuda você a
            organizar suas compras, controlar o estoque da despensa e acompanhar seus gastos.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Funcionalidades</Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Lista de compras inteligente
              </Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Controle de despensa com alertas
              </Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Histórico de compras
              </Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Gestão de categorias e itens
              </Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Sincronização em nuvem
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tecnologias</Text>
          <View style={styles.techList}>
            <View style={[styles.techBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.techText, { color: colors.textSecondary }]}>React Native</Text>
            </View>
            <View style={[styles.techBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.techText, { color: colors.textSecondary }]}>Expo</Text>
            </View>
            <View style={[styles.techBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.techText, { color: colors.textSecondary }]}>TypeScript</Text>
            </View>
            <View style={[styles.techBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.techText, { color: colors.textSecondary }]}>Supabase</Text>
            </View>
            <View style={[styles.techBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.techText, { color: colors.textSecondary }]}>React Query</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Desenvolvedor</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Desenvolvido com ❤️ para uso pessoal
          </Text>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 Market House
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Todos os direitos reservados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logoCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  techText: {
    fontSize: 12,
    fontWeight: '500',
  },
  testButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    marginVertical: 2,
  },
});
