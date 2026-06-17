import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../store/SettingsContext';
import { colors, radius, spacing } from '../theme';

/** Keep only digits so wa.me gets a clean country-code number. */
function digits(s?: string): string {
  return (s || '').replace(/[^\d]/g, '');
}

interface Props {
  /** Pre-filled WhatsApp text (e.g. an order summary). */
  message?: string;
  /** Show only the WhatsApp button (used on the order-success screen). */
  whatsappOnly?: boolean;
}

export default function SupportButtons({ message, whatsappOnly }: Props) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const callNumber = settings.support_phone || settings.whatsapp_number;
  const waNumber = digits(settings.whatsapp_number || settings.support_phone);

  const onCall = () => {
    if (!callNumber) return;
    Linking.openURL(`tel:${callNumber}`).catch(() => Alert.alert(t('cant_open')));
  };

  const onWhatsApp = () => {
    if (!waNumber) return;
    const url = `https://wa.me/${waNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    Linking.openURL(url).catch(() => Alert.alert(t('whatsapp_not_installed')));
  };

  if (!callNumber && !waNumber) return null;

  return (
    <View style={styles.row}>
      {!!waNumber && (
        <TouchableOpacity style={[styles.btn, styles.wa]} onPress={onWhatsApp} activeOpacity={0.85}>
          <Text style={styles.waIcon}>💬</Text>
          <Text style={styles.waText}>{message ? t('confirm_on_whatsapp') : t('whatsapp')}</Text>
        </TouchableOpacity>
      )}
      {!whatsappOnly && !!callNumber && (
        <TouchableOpacity style={[styles.btn, styles.call]} onPress={onCall} activeOpacity={0.85}>
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callText}>{t('call_us')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  wa: { backgroundColor: '#25D366' },
  waIcon: { fontSize: 18, marginRight: 8 },
  waText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  call: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary },
  callIcon: { fontSize: 17, marginRight: 8 },
  callText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
