import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../../api/client';
import { colors, radius, spacing } from '../../theme';

export default function DeliveryOrderDetail({ route, navigation }: any) {
  const { t } = useTranslation();
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setData(unwrap(await api.get(`/delivery/orders/${id}`))); } catch (e) { Alert.alert('', errMsg(e)); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const act = async (fn: () => Promise<any>, after?: 'back') => {
    setBusy(true);
    try { await fn(); after === 'back' ? navigation.goBack() : await load(); }
    catch (e) { Alert.alert('', errMsg(e)); }
    finally { setBusy(false); }
  };

  if (!data) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;

  const { order, assignment } = data;
  const aStatus = assignment.status;
  const oStatus = order.status;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        <Text style={styles.orderNo}>{order.order_number}</Text>
        <Text style={styles.status}>{oStatus}</Text>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Delivery address</Text>
          <Text style={styles.addr}>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</Text>
          <Text style={styles.addr}>{order.address.city} - {order.address.pincode}</Text>
          <Text style={styles.addr}>{order.address.contact_name} • {order.address.contact_phone}</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Items</Text>
          {order.items.map((it: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{it.name} × {it.quantity}</Text>
              <Text style={styles.itemPrice}>₹{it.price * it.quantity}</Text>
            </View>
          ))}
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>{t('total')} ({order.payment_method?.toUpperCase()})</Text>
            <Text style={styles.totalVal}>₹{order.total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* action bar */}
      <View style={styles.actions}>
        {busy && <ActivityIndicator color={colors.primary} />}
        {!busy && aStatus === 'offered' && (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() =>
              act(() => api.post(`/delivery/orders/${id}/reject`, { reason: 'Not available' }), 'back')}>
              <Text style={styles.rejectText}>{t('reject')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => act(() => api.post(`/delivery/orders/${id}/accept`))}>
              <Text style={styles.primaryText}>{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {!busy && aStatus === 'accepted' && oStatus === 'assigned' && (
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => act(() => api.post(`/delivery/orders/${id}/pickup`))}>
            <Text style={styles.primaryText}>{t('pickup')}</Text>
          </TouchableOpacity>
        )}
        {!busy && oStatus === 'out_for_delivery' && (
          <View>
            <Text style={styles.otpLabel}>{t('enter_delivery_otp')}</Text>
            <TextInput style={styles.otpInput} keyboardType="number-pad" maxLength={4} value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, ''))} placeholder="••••" />
            <TouchableOpacity style={[styles.btn, styles.primary]} disabled={otp.length < 4}
              onPress={() => act(() => api.post(`/delivery/orders/${id}/deliver`, { proof_value: otp }), 'back')}>
              <Text style={styles.primaryText}>{t('mark_delivered')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.failBtn}
              onPress={() => act(() => api.post(`/delivery/orders/${id}/fail`, { reason: 'Customer unreachable' }), 'back')}>
              <Text style={styles.failText}>{t('failed_delivery')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {!busy && aStatus === 'completed' && <Text style={styles.done}>✓ {oStatus}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderNo: { fontSize: 20, fontWeight: '800', color: colors.text },
  status: { color: colors.primary, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  box: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  boxTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  addr: { color: colors.text, marginVertical: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { color: colors.text },
  itemPrice: { color: colors.text },
  totalLabel: { fontWeight: '800', color: colors.text, marginTop: 6 },
  totalVal: { fontWeight: '800', color: colors.text, marginTop: 6 },
  actions: { padding: spacing.lg, backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: spacing.md },
  btn: { flex: 1, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  reject: { backgroundColor: '#fdeaec', borderWidth: 1, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontWeight: '800' },
  otpLabel: { color: colors.muted, marginBottom: 8 },
  otpInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, fontSize: 22, letterSpacing: 8, textAlign: 'center', paddingVertical: 12, marginBottom: spacing.md },
  failBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  failText: { color: colors.danger, fontWeight: '700' },
  done: { textAlign: 'center', color: colors.success, fontWeight: '800', fontSize: 16, textTransform: 'capitalize' },
});
