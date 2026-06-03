import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '../theme';
import QtyStepper from './QtyStepper';

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp: number | null;
  image_url: string;
  in_stock: boolean;
}

export default function ProductCard({ product, onPress }: { product: Product; onPress?: () => void }) {
  const { t } = useTranslation();
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View>
          <Image source={{ uri: product.image_url }} style={styles.image} />
          {discount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {discount}% {t('off')}
              </Text>
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
      </TouchableOpacity>
      <View style={styles.bottom}>
        <View>
          <Text style={styles.price}>₹{product.price}</Text>
          {discount > 0 && <Text style={styles.mrp}>₹{product.mrp}</Text>}
        </View>
        {product.in_stock ? (
          <QtyStepper productId={product.id} />
        ) : (
          <Text style={styles.oos}>{t('out_of_stock')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: 110, borderRadius: radius.sm, backgroundColor: '#eee' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  name: { marginTop: 6, fontWeight: '600', color: colors.text, fontSize: 13 },
  unit: { color: colors.muted, fontSize: 12, marginTop: 2 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontWeight: '800', color: colors.text },
  mrp: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' },
  oos: { color: colors.danger, fontSize: 11, fontWeight: '600' },
});
