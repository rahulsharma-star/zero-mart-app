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
import { api, unwrap, assetUrl } from '../api/client';
import ProductCard, { Product } from '../components/ProductCard';
import CartBar from '../components/CartBar';
import BannerSlot from '../components/BannerSlot';
import { colors, radius, spacing, shadow } from '../theme';

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
              <View>
                <Text style={styles.deliverTo}>DELIVERING TO</Text>
                <Text style={styles.brand}>📍 {storeName}</Text>
              </View>
            </View>
            <View style={styles.searchWrap}>
              <View style={styles.search}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('search')}
                  placeholderTextColor={colors.faint}
                  value={search}
                  onChangeText={runSearch}
                />
              </View>
            </View>

            <BannerSlot screen="home" position="top" />

            <Text style={styles.section}>{t('categories')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(home?.categories ?? []).map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.cat}
                  onPress={() => navigation.navigate('Category', { slug: c.slug, name: c.name })}
                >
                  <Image source={{ uri: assetUrl(c.image_url) }} style={styles.catImg} />
                  <Text numberOfLines={1} style={styles.catName}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <BannerSlot screen="home" position="middle" />

            <View style={styles.sectionRow}>
              <Text style={styles.section}>{search ? t('search') : 'Popular near you'}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View>
            <BannerSlot screen="home" position="bottom" />
            <BannerSlot screen="home" position="footer" />
          </View>
        }
      />
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deliverTo: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  brand: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 14, ...shadow.card },
  searchIcon: { fontSize: 15, marginRight: 8, color: colors.muted },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: colors.text },
  section: { fontSize: 17, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionRow: { },
  cat: { alignItems: 'center', width: 76, marginLeft: spacing.lg },
  catImg: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primaryTint },
  catName: { fontSize: 12, color: colors.text, marginTop: 6, textAlign: 'center', fontWeight: '600' },
});
