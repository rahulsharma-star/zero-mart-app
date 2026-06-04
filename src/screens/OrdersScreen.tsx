import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import BannerSlot from '../components/BannerSlot';
import { colors, radius, spacing, shadow } from '../theme';

const statusColors: Record<string, string> = {
  delivered: colors.success,
  cancelled: colors.danger,
  pending: '#f5a623',
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get('/orders');
    setOrders(unwrap(res));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('no_orders')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: spacing.md }}
      ListHeaderComponent={<BannerSlot screen="orders" position="top" />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.no}>{item.order_number}</Text>
              {item.is_urgent && (
                <Text style={styles.urgentTag}>⚡ {t('urgent')}</Text>
              )}
            </View>
            <Text style={[styles.status, { color: statusColors[item.status] ?? colors.muted }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.items}>
            {item.items.map((i: any) => `${i.name} ×${i.quantity}`).join(', ')}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.total}>₹{Number(item.total).toFixed(2)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  emptyText: { color: colors.muted, fontSize: 16 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadow.card },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  no: { fontWeight: '800', color: colors.text },
  urgentTag: { fontSize: 11, fontWeight: '800', color: colors.danger, backgroundColor: '#fde8ea', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden' },
  status: { fontWeight: '700', textTransform: 'capitalize' },
  items: { color: colors.muted, marginVertical: 6 },
  date: { color: colors.muted, fontSize: 12 },
  total: { fontWeight: '800', color: colors.text },
});
