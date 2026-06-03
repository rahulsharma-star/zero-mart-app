import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, errMsg } from '../api/client';
import { colors, radius, spacing } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert(t('phone'), '10-digit valid number');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { phone });
      navigation.navigate('Otp', { phone, isNewUser: res.data.data?.isNewUser });
    } catch (e) {
      Alert.alert('', errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>● Zero</Text>
        <Text style={styles.sub}>{t('app_name')}</Text>
      </View>
      <Text style={styles.title}>{t('login_title')}</Text>
      <Text style={styles.hint}>{t('enter_phone')}</Text>
      <View style={styles.inputRow}>
        <Text style={styles.cc}>+91</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          placeholder={t('phone')}
          value={phone}
          onChangeText={(v) => setPhone(v.replace(/\D/g, ''))}
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '…' : t('continue')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.memberLink} onPress={() => navigation.navigate('MemberLogin')}>
        <Text style={styles.memberLinkText}>{t('member_login')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card, padding: spacing.xl, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: '900', color: colors.primary },
  sub: { color: colors.muted, marginTop: 4 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  hint: { color: colors.muted, marginTop: 4, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md },
  cc: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  memberLink: { alignItems: 'center', marginTop: 28, paddingVertical: 8 },
  memberLinkText: { color: colors.muted, fontWeight: '600', textDecorationLine: 'underline' },
});
