import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../api/client';
import { useCart } from '../store/CartContext';
import QtyStepper from '../components/QtyStepper';
import BannerSlot from '../components/BannerSlot';
import { colors, radius, spacing, shadow } from '../theme';

export default function CartScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { items, totals } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('cart_empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.cart_item_id}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={<BannerSlot screen="cart" position="top" />}
        ListFooterComponent={<BannerSlot screen="cart" position="bottom" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: assetUrl(item.product.image_url) }} style={styles.img} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.unit}>{item.product.unit}</Text>
              <Text style={styles.price}>₹{item.product.price}</Text>
            </View>
            <QtyStepper productId={item.product.id} />
          </View>
        )}
      />

      {totals && (
        <View style={styles.summary}>
          <Row label={t('subtotal')} value={`₹${totals.subtotal.toFixed(2)}`} />
          <Row
            label={t('delivery')}
            value={totals.delivery_fee === 0 ? t('free') : `₹${totals.delivery_fee.toFixed(2)}`}
          />
          <View style={styles.divider} />
          <Row label={t('total')} value={`₹${totals.total.toFixed(2)}`} bold />
          <TouchableOpacity style={styles.checkout} onPress={() => navigation.navigate('Checkout')}>
            <Text style={styles.checkoutText}>{t('checkout')} • ₹{totals.total.toFixed(0)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[styles.sumLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.sumValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  emptyText: { color: colors.muted, fontSize: 16 },
  row: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: 'center', ...shadow.card },
  img: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: '#f1f3f5' },
  name: { fontWeight: '600', color: colors.text },
  unit: { color: colors.muted, fontSize: 12 },
  price: { fontWeight: '800', color: colors.text, marginTop: 2 },
  summary: { backgroundColor: colors.card, padding: spacing.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: 1, borderColor: colors.border },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sumLabel: { color: colors.muted },
  sumValue: { color: colors.text },
  bold: { fontWeight: '800', color: colors.text, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  checkout: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: spacing.md, ...shadow.card },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
