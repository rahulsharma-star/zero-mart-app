import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, assetUrl } from '../api/client';
import QtyStepper from '../components/QtyStepper';
import CartBar from '../components/CartBar';
import { colors, radius, spacing } from '../theme';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { id } = route.params;
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    api.get(`/catalog/products/${id}`).then((r) => setP(unwrap(r)));
  }, [id]);

  if (!p) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: assetUrl(p.image_url) }} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.unit}>{p.unit}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{p.price}</Text>
            {discount > 0 && <Text style={styles.mrp}>₹{p.mrp}</Text>}
            {discount > 0 && (
              <Text style={styles.off}>
                {discount}% {t('off')}
              </Text>
            )}
            <View style={{ flex: 1 }} />
            {p.in_stock ? <QtyStepper productId={p.id} /> : <Text style={styles.oos}>{t('out_of_stock')}</Text>}
          </View>
          {!!p.description && <Text style={styles.desc}>{p.description}</Text>}
        </View>
      </ScrollView>
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 320, backgroundColor: '#eee' },
  body: { padding: spacing.lg },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  unit: { color: colors.muted, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: 8 },
  price: { fontSize: 22, fontWeight: '900', color: colors.text },
  mrp: { color: colors.muted, textDecorationLine: 'line-through' },
  off: { color: colors.primary, fontWeight: '700' },
  oos: { color: colors.danger, fontWeight: '700' },
  desc: { color: colors.text, marginTop: spacing.lg, lineHeight: 22 },
});
