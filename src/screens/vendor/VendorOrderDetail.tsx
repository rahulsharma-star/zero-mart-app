import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../../api/client';
import { colors, radius, spacing } from '../../theme';

export default function VendorOrderDetail({ route, navigation }: any) {
  const { t } = useTranslation();
  const { id } = route.params;
  const [order, setOrder] = useState<any>(null);

  const load = async () => {
    try { setOrder(unwrap(await api.get(`/vendor/orders/${id}`))); } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, [id]);

  const act = async (path: string, body?: any) => {
    try {
      await api.post(`/vendor/orders/${id}/${path}`, body ?? {});
      await load();
      if (path === 'accept') Alert.alert(t('common_ok'), t('order_accepted'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.message || 'Error');
    }
  };

  if (!order) return null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.no}>{order.order_number}</Text>
      <Text style={styles.status}>{order.status}</Text>
      <Text style={styles.total}>₹{Number(order.total).toFixed(2)} • {order.payment_method?.toUpperCase()}</Text>

      <Text style={styles.section}>{t('customer')}</Text>
      <Text>{order.customer?.name ?? '—'}</Text>
      <Text style={styles.muted}>+91 {order.customer?.phone}</Text>

      <Text style={styles.section}>{t('select_address')}</Text>
      <Text>{order.address_line1}</Text>
      <Text style={styles.muted}>{order.address_pincode}</Text>

      <Text style={styles.section}>{t('cart')}</Text>
      {(order.items ?? []).map((it: any) => (
        <Text key={it.id}>• {typeof it.name === 'object' ? it.name?.hi ?? it.name?.en : it.name} x {it.quantity}</Text>
      ))}

      {order.status === 'placed' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.accept} onPress={() => act('accept')}>
            <Text style={styles.btnText}>{t('accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reject} onPress={() => act('reject', { reason: 'unavailable' })}>
            <Text style={styles.rejectText}>{t('reject')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {order.status === 'confirmed' && (
        <TouchableOpacity style={styles.accept} onPress={() => api.patch(`/vendor/orders/${id}/status`, { status: 'preparing' }).then(load)}>
          <Text style={styles.btnText}>{t('start_preparing')}</Text>
        </TouchableOpacity>
      )}
      {order.status === 'preparing' && (
        <TouchableOpacity style={styles.accept} onPress={() => api.patch(`/vendor/orders/${id}/status`, { status: 'ready_for_pickup' }).then(load)}>
          <Text style={styles.btnText}>{t('ready_for_pickup')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  no: { fontSize: 20, fontWeight: '900', color: colors.text },
  status: { color: colors.primary, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  total: { color: colors.text, fontWeight: '700', marginTop: 2 },
  section: { fontWeight: '800', color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.sm },
  muted: { color: colors.muted },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  accept: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  reject: { flex: 1, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
  rejectText: { color: colors.danger, fontWeight: '800' },
});
