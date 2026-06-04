import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import { useCart, CartTotals } from '../store/CartContext';
import { colors, radius, spacing, shadow } from '../theme';

type Method = 'upi' | 'card' | 'cod';

export default function CheckoutScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { totals: ctxTotals, reload } = useCart();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>('upi');
  const [urgent, setUrgent] = useState(false);
  const [totals, setTotals] = useState<CartTotals | null>(ctxTotals);
  const [urgentRate, setUrgentRate] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ line1: '', city: '', pincode: '', contact_name: '', contact_phone: '' });

  const loadAddresses = async () => {
    const res = await api.get('/addresses');
    const list = unwrap(res);
    setAddresses(list);
    if (list.length && !selected) setSelected(list[0].id);
  };

  // Re-price whenever the urgent toggle flips, so the bill + CTA stay accurate.
  const loadCart = async (isUrgent: boolean) => {
    const res = await api.get('/cart', { params: { urgent: isUrgent ? 1 : 0 } });
    const data = unwrap(res);
    setTotals(data.totals);
    setUrgentRate(Number(data.urgent_fee_rate ?? 0));
  };

  useEffect(() => {
    loadAddresses();
    loadCart(false);
  }, []);

  const toggleUrgent = (v: boolean) => {
    setUrgent(v);
    loadCart(v);
  };

  const saveAddress = async () => {
    if (!form.line1 || !/^\d{6}$/.test(form.pincode)) {
      Alert.alert('', 'Address line + 6-digit pincode required');
      return;
    }
    try {
      const res = await api.post('/addresses', { ...form, is_default: addresses.length === 0 });
      const created = unwrap(res);
      setModal(false);
      setForm({ line1: '', city: '', pincode: '', contact_name: '', contact_phone: '' });
      await loadAddresses();
      setSelected(created.id);
    } catch (e) {
      Alert.alert('', errMsg(e));
    }
  };

  const placeOrder = async () => {
    if (!selected) {
      Alert.alert('', t('add_address'));
      return;
    }
    setPlacing(true);
    try {
      const orderRes = await api.post('/orders', { address_id: selected, payment_method: method, is_urgent: urgent });
      const order = unwrap(orderRes);
      await reload();

      if (method === 'cod') {
        navigation.replace('OrderSuccess', { orderId: order.id });
        return;
      }

      const payRes = await api.post('/payments/payu/initiate', { order_id: order.id });
      const pay = unwrap(payRes);
      // Dev bypass (no gateway yet): order already paid+confirmed → go straight to success.
      if (pay.bypass) {
        navigation.replace('OrderSuccess', { orderId: order.id, status: 'success' });
        return;
      }
      navigation.replace('Payment', { ...pay, orderId: order.id });
    } catch (e) {
      Alert.alert('', errMsg(e));
    } finally {
      setPlacing(false);
    }
  };

  const methods: { key: Method; label: string }[] = [
    { key: 'upi', label: t('upi') },
    { key: 'card', label: t('card') },
    { key: 'cod', label: t('cod') },
  ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.section}>{t('select_address')}</Text>
        {addresses.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.addr, selected === a.id && styles.addrActive]}
            onPress={() => setSelected(a.id)}
          >
            <Text style={styles.addrText}>
              {a.line1}, {a.city} - {a.pincode}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addAddr} onPress={() => setModal(true)}>
          <Text style={styles.addAddrText}>+ {t('add_address')}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>{t('payment_method')}</Text>
        {methods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.method, method === m.key && styles.methodActive]}
            onPress={() => setMethod(m.key)}
          >
            <Text style={styles.methodText}>{m.label}</Text>
            <View style={[styles.radio, method === m.key && styles.radioActive]} />
          </TouchableOpacity>
        ))}

        {/* Urgent / express delivery */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.urgentCard, urgent && styles.urgentCardActive]}
          onPress={() => toggleUrgent(!urgent)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.urgentTitle}>
              ⚡ {t('urgent_delivery')}
              {urgentRate > 0 ? `  +₹${urgentRate.toFixed(0)}` : ''}
            </Text>
            <Text style={styles.urgentDesc}>{t('urgent_delivery_desc')}</Text>
          </View>
          <Switch
            value={urgent}
            onValueChange={toggleUrgent}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#fff"
          />
        </TouchableOpacity>

        {/* Bill details */}
        {totals && (
          <View style={styles.bill}>
            <Text style={styles.section}>{t('price_details')}</Text>
            <BillRow label={t('subtotal')} value={`₹${totals.subtotal.toFixed(0)}`} />
            <BillRow
              label={t('delivery')}
              value={totals.delivery_fee === 0 ? t('free') : `₹${totals.delivery_fee.toFixed(0)}`}
              free={totals.delivery_fee === 0}
            />
            {totals.urgent_fee > 0 && <BillRow label={`⚡ ${t('urgent_fee')}`} value={`₹${totals.urgent_fee.toFixed(0)}`} />}
            {totals.discount > 0 && <BillRow label={t('off')} value={`-₹${totals.discount.toFixed(0)}`} />}
            <View style={styles.billDivider} />
            <BillRow label={t('total')} value={`₹${totals.total.toFixed(0)}`} bold />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.cta} onPress={placeOrder} disabled={placing}>
        {placing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>
            {method === 'cod' ? t('place_order') : t('pay_now')} • ₹{totals?.total.toFixed(0)}
          </Text>
        )}
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.section}>{t('add_address')}</Text>
            {(['line1', 'city', 'pincode', 'contact_name', 'contact_phone'] as const).map((f) => (
              <TextInput
                key={f}
                style={styles.input}
                placeholder={f}
                keyboardType={f === 'pincode' || f === 'contact_phone' ? 'number-pad' : 'default'}
                value={(form as any)[f]}
                onChangeText={(v) => setForm((s) => ({ ...s, [f]: v }))}
              />
            ))}
            <TouchableOpacity style={styles.cta} onPress={saveAddress}>
              <Text style={styles.ctaText}>{t('add_address')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={styles.cancel}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BillRow({ label, value, bold, free }: { label: string; value: string; bold?: boolean; free?: boolean }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && styles.billStrong]}>{label}</Text>
      <Text style={[styles.billValue, bold && styles.billStrong, free && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  urgentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  urgentCardActive: { borderColor: colors.primary, borderWidth: 2 },
  urgentTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  urgentDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  bill: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { color: colors.muted, fontSize: 14 },
  billValue: { color: colors.text, fontSize: 14 },
  billStrong: { fontWeight: '800', color: colors.text, fontSize: 16 },
  billDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  addr: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  addrActive: { borderColor: colors.primary, borderWidth: 2 },
  addrText: { color: colors.text },
  addAddr: { paddingVertical: spacing.sm },
  addAddrText: { color: colors.primary, fontWeight: '700' },
  method: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  methodActive: { borderColor: colors.primary, borderWidth: 2 },
  methodText: { color: colors.text, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  cta: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', margin: spacing.lg, ...shadow.float },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, marginBottom: spacing.sm },
  cancel: { textAlign: 'center', color: colors.muted, padding: spacing.sm },
});
