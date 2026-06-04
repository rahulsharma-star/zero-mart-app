import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../api/client';
import { colors, radius, spacing, shadow } from '../theme';
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
          <Image source={{ uri: assetUrl(product.image_url) }} style={styles.image} />
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
    ...shadow.card,
  },
  image: { width: '100%', height: 118, borderRadius: radius.sm, backgroundColor: '#f1f3f5' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  name: { marginTop: 8, fontWeight: '700', color: colors.text, fontSize: 13, lineHeight: 18 },
  unit: { color: colors.faint, fontSize: 12, marginTop: 2 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  price: { fontWeight: '800', color: colors.text, fontSize: 15 },
  mrp: { color: colors.faint, fontSize: 12, textDecorationLine: 'line-through' },
  oos: { color: colors.danger, fontSize: 11, fontWeight: '700' },
});
