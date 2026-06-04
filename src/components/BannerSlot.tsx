import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, unwrap, assetUrl } from '../api/client';
import { radius, spacing } from '../theme';

export type BannerPosition = 'top' | 'middle' | 'bottom' | 'footer';

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  action_type: 'category' | 'product' | 'url' | 'none';
  action_value: string | null;
  screen: string;
  position: BannerPosition;
}

// Small in-memory cache so multiple slots on one screen share a single fetch.
const cache = new Map<string, { at: number; data: Banner[] }>();
const TTL = 60_000;

async function fetchBanners(screen: string): Promise<Banner[]> {
  const hit = cache.get(screen);
  // Date.now is fine in the app runtime (this is not a workflow script).
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const data = unwrap(await api.get('/catalog/banners', { params: { screen } })) as Banner[];
  cache.set(screen, { at: Date.now(), data });
  return data;
}

/** Renders the active promotional banners an admin placed on `screen` at `position`. */
export default function BannerSlot({
  screen,
  position,
  height,
}: {
  screen: string;
  position: BannerPosition;
  height?: number;
}) {
  const navigation = useNavigation<any>();
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let alive = true;
    fetchBanners(screen)
      .then((all) => {
        if (alive) setBanners(all.filter((b) => (b.position ?? 'top') === position));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [screen, position]);

  if (banners.length === 0) return null;

  const h = height ?? (position === 'top' ? 130 : 90);

  const onPress = (b: Banner) => {
    if (b.action_type === 'category' && b.action_value) {
      navigation.navigate('Category', { slug: b.action_value, name: b.title });
    } else if (b.action_type === 'product' && b.action_value) {
      navigation.navigate('ProductDetail', { id: b.action_value });
    } else if (b.action_type === 'url' && b.action_value) {
      Linking.openURL(b.action_value).catch(() => {});
    }
  };

  // Single banner → full-width strip; multiple → horizontal carousel.
  if (banners.length === 1) {
    const b = banners[0];
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(b)} style={styles.wrap}>
        <Image source={{ uri: assetUrl(b.image_url) }} style={[styles.full, { height: h }]} />
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap} contentContainerStyle={{ paddingRight: spacing.lg }}>
      {banners.map((b) => (
        <TouchableOpacity key={b.id} activeOpacity={0.9} onPress={() => onPress(b)}>
          <Image source={{ uri: assetUrl(b.image_url) }} style={[styles.card, { height: h }]} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  full: { marginHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: '#e5e7eb' },
  card: { width: 300, marginLeft: spacing.lg, borderRadius: radius.md, backgroundColor: '#e5e7eb' },
});
