import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import { colors, radius, spacing } from '../theme';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { orderId, status } = route.params;
  const [order, setOrder] = useState<any>(null);
  const failed = status === 'failed';

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((r) => setOrder(unwrap(r))).catch(() => {});
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={[styles.icon, failed && { color: colors.danger }]}>{failed ? '✕' : '✓'}</Text>
      <Text style={styles.title}>{failed ? 'Payment failed' : t('order_placed')}</Text>
      <Text style={styles.no}>{order.order_number}</Text>
      <Text style={styles.total}>₹{Number(order.total).toFixed(2)} • {order.payment_method.toUpperCase()}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })}
      >
        <Text style={styles.btnText}>{t('home')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card, padding: spacing.xl },
  icon: { fontSize: 64, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  no: { color: colors.muted, marginTop: 8 },
  total: { color: colors.text, fontWeight: '700', marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 40, marginTop: spacing.xl },
  btnText: { color: '#fff', fontWeight: '800' },
});
