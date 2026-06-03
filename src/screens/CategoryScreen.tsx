import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { api, unwrap } from '../api/client';
import ProductCard, { Product } from '../components/ProductCard';
import CartBar from '../components/CartBar';
import { colors, spacing } from '../theme';

export default function CategoryScreen({ route, navigation }: any) {
  const { slug, name } = route.params;
  const [products, setProducts] = useState<Product[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);

  useEffect(() => {
    api.get('/catalog/products', { params: { category: slug, limit: 50 } }).then((r) => setProducts(unwrap(r).items));
  }, [slug]);

  return (
    <View style={styles.root}>
      <FlatList
        data={products}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: spacing.sm }}
        contentContainerStyle={{ paddingVertical: spacing.sm, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />
        )}
      />
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
