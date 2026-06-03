import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import { useAuth } from '../store/AuthContext';
import { colors, radius, spacing } from '../theme';

export default function OtpScreen({ route }: any) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { phone, isNewUser } = route.params;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (code.length < 4) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', {
        phone,
        code,
        ...(isNewUser && name ? { name } : {}),
      });
      const { token, user } = unwrap(res);
      await signIn(token, user);
    } catch (e) {
      Alert.alert('', errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await api.post('/auth/otp/request', { phone });
      Alert.alert('', t('resend'));
    } catch (e) {
      Alert.alert('', errMsg(e));
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('otp_title')}</Text>
      <Text style={styles.hint}>
        {t('otp_sent_to')} +91 {phone}
      </Text>
      <TextInput
        style={styles.otp}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="••••••"
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
      />
      {isNewUser && (
        <TextInput style={styles.name} placeholder={t('your_name')} value={name} onChangeText={setName} />
      )}
      <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '…' : t('verify')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={resend}>
        <Text style={styles.resend}>{t('resend')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  hint: { color: colors.muted, marginTop: 4, marginBottom: 24 },
  otp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, fontSize: 24, letterSpacing: 8, textAlign: 'center', paddingVertical: 14 },
  name: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, fontSize: 16, paddingVertical: 14, paddingHorizontal: 16, marginTop: 16 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resend: { color: colors.primary, textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
