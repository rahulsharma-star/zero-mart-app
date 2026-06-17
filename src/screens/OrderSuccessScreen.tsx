import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import SupportButtons from '../components/SupportButtons';
import { colors, radius, spacing } from '../theme';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { t, i18n } = useTranslation();
  const { orderId, status } = route.params;
  const [order, setOrder] = useState<any>(null);
  const failed = status === 'failed';

  const waMessage = order
    ? buildOrderMessage(order, i18n.language)
    : undefined;
  const isCod = order?.payment_method === 'cod';

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

      {!failed && isCod && <Text style={styles.cod}>{t('cod_note')}</Text>}

      {!failed && (
        <View style={styles.support}>
          <SupportButtons message={waMessage} whatsappOnly />
        </View>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })}
      >
        <Text style={styles.btnText}>{t('home')}</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Builds a friendly WhatsApp order-confirmation message the customer can send. */
function buildOrderMessage(order: any, lang: string): string {
  const hi = lang !== 'en';
  const lines: string[] = [];
  lines.push(hi ? 'राम राम सा 🙏' : 'Hello 🙏');
  lines.push(
    hi
      ? `मेरा ऑर्डर नंबर ${order.order_number} है।`
      : `My order number is ${order.order_number}.`
  );
  for (const it of order.items ?? []) {
    const name = typeof it.name === 'object' ? it.name?.[lang] ?? it.name?.hi ?? it.name?.en : it.name;
    lines.push(`• ${name} x ${it.quantity}`);
  }
  lines.push(
    hi
      ? `कुल: ₹${Number(order.total).toFixed(2)} (${String(order.payment_method).toUpperCase()})`
      : `Total: ₹${Number(order.total).toFixed(2)} (${String(order.payment_method).toUpperCase()})`
  );
  lines.push(hi ? 'कृपया पुष्टि करें।' : 'Please confirm.');
  return lines.join('\n');
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card, padding: spacing.xl },
  icon: { fontSize: 64, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  no: { color: colors.muted, marginTop: 8 },
  total: { color: colors.text, fontWeight: '700', marginTop: 4 },
  cod: { color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
  support: { alignSelf: 'stretch', marginTop: spacing.xl },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 40, marginTop: spacing.md },
  btnText: { color: '#fff', fontWeight: '800' },
});
