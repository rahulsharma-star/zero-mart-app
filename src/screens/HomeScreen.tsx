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
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, unwrap, assetUrl, errMsg } from '../api/client';
import ProductCard, { Product } from '../components/ProductCard';
import CartBar from '../components/CartBar';
import BannerSlot from '../components/BannerSlot';
import SupportButtons from '../components/SupportButtons';
import VoiceSearchButton from '../components/VoiceSearchButton';
import { colors, radius, spacing, shadow } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
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

  const sendOpenRequest = async () => {
    const text = search.trim();
    if (text.length < 3) return;
    try {
      let pincode = '110001';
      try {
        const addrs = unwrap(await api.get('/addresses'));
        if (addrs[0]?.pincode) pincode = addrs[0].pincode;
      } catch { /* use default */ }
      const res = unwrap(await api.post('/requests', { request_text: text, pincode }));
      navigation.navigate('OpenRequest', { requestId: res.id, requestText: text });
    } catch (e) {
      Alert.alert(t('error'), errMsg(e));
    }
  };

  const storeNameMl = home?.settings?.store?.name;
  const storeName = storeNameMl?.[i18n.language] ?? storeNameMl?.hi ?? storeNameMl?.en ?? t('app_name');

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
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>{t('greeting')}</Text>
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
                <VoiceSearchButton onResult={(text) => runSearch(text)} color={colors.primary} />
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
            {search.trim().length >= 3 && products.length === 0 && (
              <TouchableOpacity style={styles.openReq} onPress={sendOpenRequest}>
                <Text style={styles.openReqTitle}>{t('not_found_ask_shops')}</Text>
                <Text style={styles.openReqSub}>{t('not_found_ask_shops_desc')}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          <View>
            <BannerSlot screen="home" position="bottom" />
            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>{t('need_help')}</Text>
              <Text style={styles.helpDesc}>{t('help_desc')}</Text>
              <SupportButtons />
            </View>
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
  greeting: { fontSize: 15, fontWeight: '800', color: colors.primary },
  brand: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 2 },
  helpCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginHorizontal: spacing.lg, marginTop: spacing.lg, ...shadow.card },
  helpTitle: { fontSize: 16, fontWeight: '900', color: colors.text },
  helpDesc: { color: colors.muted, marginTop: 2, marginBottom: spacing.md },
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 14, ...shadow.card },
  searchIcon: { fontSize: 15, marginRight: 8, color: colors.muted },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: colors.text },
  section: { fontSize: 17, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionRow: { },
  openReq: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.primaryTint, borderRadius: radius.md, padding: spacing.md },
  openReqTitle: { fontWeight: '800', color: colors.primary },
  openReqSub: { color: colors.muted, marginTop: 4, fontSize: 13 },
  cat: { alignItems: 'center', width: 76, marginLeft: spacing.lg },
  catImg: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primaryTint },
  catName: { fontSize: 12, color: colors.text, marginTop: 6, textAlign: 'center', fontWeight: '600' },
});
