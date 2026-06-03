import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import ProductCard, { Product } from '../components/ProductCard';
import CartBar from '../components/CartBar';
import { colors, radius, spacing } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [home, setHome] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [h, p] = await Promise.all([
      api.get('/catalog/home'),
      api.get('/catalog/products', { params: { limit: 30 } }),
    ]);
    setHome(unwrap(h));
    setProducts(unwrap(p).items);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const runSearch = async (q: string) => {
    setSearch(q);
    const res = await api.get('/catalog/products', { params: { search: q, limit: 30 } });
    setProducts(unwrap(res).items);
  };

  const storeName = home?.settings?.store?.name?.en ?? t('app_name');

  return (
    <View style={styles.root}>
      <FlatList
        data={products}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />
        )}
        columnWrapperStyle={{ paddingHorizontal: spacing.sm }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.brand}>● {storeName}</Text>
            </View>
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.search}
                placeholder={t('search')}
                value={search}
                onChangeText={runSearch}
              />
            </View>

            {home?.banners?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
                {home.banners.map((b: any) => (
                  <Image key={b.id} source={{ uri: b.image_url }} style={styles.banner} />
                ))}
              </ScrollView>
            )}

            <Text style={styles.section}>{t('categories')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(home?.categories ?? []).map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.cat}
                  onPress={() => navigation.navigate('Category', { slug: c.slug, name: c.name })}
                >
                  <Image source={{ uri: c.image_url }} style={styles.catImg} />
                  <Text numberOfLines={1} style={styles.catName}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.section}>{t('app_name')}</Text>
          </View>
        }
      />
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  brand: { fontSize: 20, fontWeight: '900', color: colors.primary },
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  search: { backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  banner: { width: 300, height: 130, borderRadius: radius.md, marginLeft: spacing.lg, backgroundColor: '#ddd' },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  cat: { alignItems: 'center', width: 80, marginLeft: spacing.lg },
  catImg: { width: 64, height: 64, borderRadius: radius.pill, backgroundColor: '#ddd' },
  catName: { fontSize: 12, color: colors.text, marginTop: 4, textAlign: 'center' },
});
