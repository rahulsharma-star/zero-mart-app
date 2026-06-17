import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { setLanguage } from '../i18n';
import { api } from '../api/client';
import BannerSlot from '../components/BannerSlot';
import SupportButtons from '../components/SupportButtons';
import { colors, radius, spacing, shadow } from '../theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, signOut, refresh } = useAuth();

  const switchLang = async (lng: 'en' | 'hi') => {
    await setLanguage(lng);
    try {
      await api.patch('/auth/me', { language: lng });
      await refresh();
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? user?.phone ?? 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Customer'}</Text>
        <Text style={styles.phone}>+91 {user?.phone}</Text>
      </View>

      <Text style={styles.section}>{t('language')}</Text>
      <View style={styles.langRow}>
        {(['en', 'hi'] as const).map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.lang, i18n.language === l && styles.langActive]}
            onPress={() => switchLang(l)}
          >
            <Text style={[styles.langText, i18n.language === l && styles.langTextActive]}>
              {l === 'en' ? 'English' : 'हिंदी'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>{t('help')}</Text>
      <View style={styles.helpCard}>
        <Text style={styles.helpDesc}>{t('help_desc')}</Text>
        <SupportButtons />
      </View>

      <BannerSlot screen="profile" position="middle" />

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, ...shadow.card },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  phone: { color: colors.muted, marginTop: 2 },
  section: { fontSize: 14, fontWeight: '800', color: colors.muted, marginTop: spacing.xl, marginBottom: spacing.sm },
  langRow: { flexDirection: 'row', gap: spacing.md },
  lang: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  langActive: { borderColor: colors.primary, borderWidth: 2 },
  langText: { color: colors.text, fontWeight: '600' },
  langTextActive: { color: colors.primary },
  helpCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  helpDesc: { color: colors.muted, marginBottom: spacing.md },
  logout: { marginTop: spacing.xl, paddingVertical: 14, alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
