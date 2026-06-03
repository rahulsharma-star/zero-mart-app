import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCart } from '../store/CartContext';
import { colors, radius, spacing } from '../theme';

export default function CartBar({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { count, totals } = useCart();
  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.bar} onPress={onPress} activeOpacity={0.9}>
      <View>
        <Text style={styles.count}>
          {count} {t('cart')}
        </Text>
        {totals && <Text style={styles.total}>₹{totals.total.toFixed(0)}</Text>}
      </View>
      <Text style={styles.view}>{t('view_cart')} →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { color: '#fff', fontWeight: '700' },
  total: { color: '#eafaf1', fontSize: 12 },
  view: { color: '#fff', fontWeight: '800' },
});
