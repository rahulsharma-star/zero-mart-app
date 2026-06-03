import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing } from '../../theme';

const TABS = ['offered', 'active', 'completed'] as const;

export default function DeliveryHome({ navigation }: any) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('offered');
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMe = useCallback(async () => {
    try { setMe(unwrap(await api.get('/delivery/me'))); } catch { /* ignore */ }
  }, []);

  const loadOrders = useCallback(async (which = tab) => {
    try { setOrders(unwrap(await api.get(`/delivery/orders?status=${which}`))); } catch { setOrders([]); }
  }, [tab]);

  useFocusEffect(useCallback(() => { loadMe(); loadOrders(); }, [loadMe, loadOrders]));
  useEffect(() => { loadOrders(tab); }, [tab, loadOrders]);

  const online = me?.availability === 'online' || me?.availability === 'busy';

  const toggle = async (val: boolean) => {
    try {
      await api.put('/delivery/availability', { availability: val ? 'online' : 'offline' });
      loadMe();
    } catch (e) { /* noop */ }
  };

  return (
    <View style={styles.root}>
      {/* availability + stats */}
      <View style={styles.header}>
        <View style={styles.availRow}>
          <View>
            <Text style={styles.availLabel}>{t('availability')}</Text>
            <Text style={[styles.availState, { color: online ? colors.success : colors.muted }]}>
              {online ? t('online') : t('offline')}
            </Text>
          </View>
          <Switch value={online} onValueChange={toggle} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.stats}>
          <Stat label={t('today')} value={`${me?.today?.delivered ?? 0}`} sub={t('deliveries')} />
          <Stat label={t('earnings')} value={`₹${me?.today?.earnings ?? 0}`} sub={t('today')} />
          <TouchableOpacity style={styles.earnBtn} onPress={() => navigation.navigate('Earnings')}>
            <Text style={styles.earnBtnText}>{t('earnings')} →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* tabs */}
      <View style={styles.tabs}>
        {TABS.map((tb) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && styles.tabActive]} onPress={() => setTab(tb)}>
            <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>{t(tb)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.assignment_id}
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadOrders(); await loadMe(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{online ? t('no_assigned_orders') : t('go_online_hint')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DeliveryOrderDetail', { id: item.order.id })}>
            <View style={styles.cardTop}>
              <Text style={styles.orderNo}>{item.order.order_number}</Text>
              <Text style={styles.total}>₹{item.order.total}</Text>
            </View>
            <Text style={styles.addr} numberOfLines={2}>
              {item.order.address.line1}, {item.order.address.city} - {item.order.address.pincode}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.pay}>{item.order.payment_method?.toUpperCase()}</Text>
              <Text style={styles.payout}>{t('payout')}: ₹{item.payout_amount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availLabel: { color: colors.muted, fontSize: 12 },
  availState: { fontSize: 18, fontWeight: '800' },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.lg },
  stat: {},
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { color: colors.muted, fontSize: 12 },
  earnBtn: { marginLeft: 'auto', backgroundColor: '#eafaf1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  earnBtnText: { color: colors.primary, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, paddingHorizontal: spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  orderNo: { fontWeight: '800', color: colors.text },
  total: { fontWeight: '800', color: colors.text },
  addr: { color: colors.muted, marginVertical: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  pay: { color: colors.text, fontWeight: '600', fontSize: 12 },
  payout: { color: colors.success, fontWeight: '700', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: colors.muted },
  logout: { padding: spacing.md, alignItems: 'center' },
  logoutText: { color: colors.danger, fontWeight: '700' },
});
