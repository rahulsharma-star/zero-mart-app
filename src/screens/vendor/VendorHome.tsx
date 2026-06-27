import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing } from '../../theme';

const TABS = ['pending', 'active', 'offers'] as const;

export default function VendorHome({ navigation }: any) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('pending');
  const [me, setMe] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [offerPrices, setOfferPrices] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadMe = useCallback(async () => {
    try { setMe(unwrap(await api.get('/vendor/me'))); } catch { /* ignore */ }
  }, []);

  const loadOrders = useCallback(async (which = tab) => {
    if (which === 'offers') {
      try { setOffers(unwrap(await api.get('/vendor/offers'))); } catch { setOffers([]); }
      return;
    }
    try { setOrders(unwrap(await api.get(`/vendor/orders?status=${which}`))); } catch { setOrders([]); }
  }, [tab]);

  useFocusEffect(useCallback(() => { loadMe(); loadOrders(); }, [loadMe, loadOrders]));
  useEffect(() => { loadOrders(tab); }, [tab, loadOrders]);

  const acceptOffer = async (offerId: string) => {
    const price = parseFloat(offerPrices[offerId] || '0');
    if (!price || price <= 0) {
      Alert.alert(t('error'), t('enter_price'));
      return;
    }
    try {
      await api.post(`/vendor/offers/${offerId}/accept`, { quoted_price: price });
      Alert.alert(t('common_ok'), t('offer_accepted'));
      loadOrders('offers');
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.message || 'Error');
    }
  };

  const data = tab === 'offers' ? offers : orders;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.shop}>🏪 {me?.store?.name ?? '...'}</Text>
        <Text style={styles.sub}>{t('vendor_dashboard')}</Text>
        <View style={styles.stats}>
          <Stat label={t('pending')} value={String(me?.stats?.pending_orders ?? 0)} />
          <Stat label={t('active')} value={String(me?.stats?.active_orders ?? 0)} />
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tb) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && styles.tabActive]} onPress={() => setTab(tb)}>
            <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>
              {tb === 'offers' ? t('open_requests') : t(tb)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(o) => o.id ?? o.offer_id}
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await loadMe();
            await loadOrders();
            setRefreshing(false);
          }} />
        }
        ListEmptyComponent={<Text style={styles.empty}>{t('no_orders_vendor')}</Text>}
        renderItem={({ item }) =>
          tab === 'offers' ? (
            <View style={styles.card}>
              <Text style={styles.req}>{item.request_text}</Text>
              <Text style={styles.meta}>📍 {item.pincode} • {item.customer_name ?? item.customer_phone}</Text>
              <TextInput
                style={styles.priceInput}
                placeholder={t('enter_price')}
                keyboardType="numeric"
                value={offerPrices[item.offer_id] ?? ''}
                onChangeText={(v) => setOfferPrices((p) => ({ ...p, [item.offer_id]: v }))}
              />
              <TouchableOpacity style={styles.accept} onPress={() => acceptOffer(item.offer_id)}>
                <Text style={styles.acceptText}>{t('accept')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('VendorOrderDetail', { id: item.id })}>
              <Text style={styles.no}>{item.order_number}</Text>
              <Text style={styles.meta}>₹{Number(item.total).toFixed(0)} • {item.status}</Text>
              <Text style={styles.meta}>{item.address_line1}, {item.address_pincode}</Text>
            </TouchableOpacity>
          )
        }
      />

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  shop: { fontSize: 20, fontWeight: '900', color: colors.text },
  sub: { color: colors.muted, marginTop: 2 },
  stats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: colors.primary },
  statLabel: { color: colors.muted, fontSize: 12 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primaryTint },
  tabText: { color: colors.muted, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  no: { fontWeight: '800', color: colors.text },
  req: { fontWeight: '700', color: colors.text, fontSize: 15 },
  meta: { color: colors.muted, marginTop: 4 },
  priceInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 10, marginTop: spacing.sm, backgroundColor: '#fff' },
  accept: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center', marginTop: spacing.sm },
  acceptText: { color: '#fff', fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  logout: { padding: spacing.md, alignItems: 'center' },
  logoutText: { color: colors.danger, fontWeight: '700' },
});
