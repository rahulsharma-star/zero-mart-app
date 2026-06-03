import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../../api/client';
import { colors, radius, spacing } from '../../theme';

export default function Earnings() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/delivery/earnings').then((r) => setData(unwrap(r))).catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.cards}>
        <Card label={t('today')} value={`₹${data?.today ?? 0}`} />
        <Card label={t('week')} value={`₹${data?.week ?? 0}`} />
        <Card label={t('total')} value={`₹${data?.total ?? 0}`} />
      </View>
      <View style={styles.cards}>
        <Card label={t('paid')} value={`₹${data?.paid ?? 0}`} />
        <Card label={t('due')} value={`₹${data?.due ?? 0}`} highlight />
      </View>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
            <Text style={styles.amount}>+₹{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

function Card({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardValue, highlight && { color: colors.danger }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  cards: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cardValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  cardLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  type: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  date: { color: colors.muted, fontSize: 12 },
  amount: { color: colors.success, fontWeight: '800' },
});
