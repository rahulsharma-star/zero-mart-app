import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import SupportButtons from '../components/SupportButtons';
import { colors, radius, spacing } from '../theme';

export default function OpenRequestScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { requestId, requestText } = route.params;
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setReq(unwrap(await api.get(`/requests/${requestId}`)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [requestId]);

  const confirm = async () => {
    try {
      // Use first address — checkout would be better but keep MVP simple
      const addrs = unwrap(await api.get('/addresses'));
      const addr = addrs[0];
      if (!addr) {
        Alert.alert(t('error'), t('add_address_first'));
        return;
      }
      const res = unwrap(await api.post(`/requests/${requestId}/confirm`, {
        address_id: addr.id,
        payment_method: 'cod',
      }));
      navigation.replace('OrderSuccess', { orderId: res.order_id });
    } catch (e) {
      Alert.alert(t('error'), errMsg(e));
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('open_request')}</Text>
      <Text style={styles.text}>"{requestText ?? req?.request_text}"</Text>
      <Text style={styles.status}>{t(`request_status_${req?.status}`)}</Text>

      {req?.status === 'matched' && req?.store && (
        <View style={styles.match}>
          <Text style={styles.shop}>🏪 {req.store.name}</Text>
          {req.quoted_price != null && <Text style={styles.price}>₹{Number(req.quoted_price).toFixed(0)}</Text>}
          <SupportButtons whatsappOnly message={`${t('greeting')}\n${req.request_text}`} />
          <TouchableOpacity style={styles.btn} onPress={confirm}>
            <Text style={styles.btnText}>{t('confirm_order')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {req?.status === 'pending' && (
        <Text style={styles.wait}>{t('waiting_for_shop')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card, padding: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: colors.text },
  text: { color: colors.muted, marginTop: spacing.md, fontSize: 16 },
  status: { color: colors.primary, fontWeight: '700', marginTop: spacing.lg },
  match: { marginTop: spacing.xl, backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.lg },
  shop: { fontSize: 18, fontWeight: '800', color: colors.text },
  price: { fontSize: 20, fontWeight: '900', color: colors.primary, marginVertical: spacing.sm },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  btnText: { color: '#fff', fontWeight: '800' },
  wait: { color: colors.muted, marginTop: spacing.xl, textAlign: 'center' },
});
