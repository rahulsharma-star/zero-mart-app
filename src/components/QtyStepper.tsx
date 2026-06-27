import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '../theme';
import { useCart } from '../store/CartContext';

export default function QtyStepper({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { t } = useTranslation();
  const { quantityOf, add, setQty } = useCart();
  const qty = quantityOf(productId);
  const [busy, setBusy] = React.useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: any) {
      Alert.alert(t('cart'), e?.message ?? t('error'));
    } finally {
      setBusy(false);
    }
  };

  if (qty === 0) {
    return (
      <TouchableOpacity
        style={[styles.addBtn, disabled && styles.disabled]}
        disabled={disabled || busy}
        onPress={() => run(() => add(productId))}
      >
        {busy ? <ActivityIndicator color={colors.primary} size="small" /> : <Text style={styles.addText}>{t('add')}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} disabled={busy} onPress={() => run(() => setQty(productId, qty - 1))}>
        <Text style={styles.stepText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.qty}>{qty}</Text>
      <TouchableOpacity style={styles.stepBtn} disabled={busy} onPress={() => run(() => setQty(productId, qty + 1))}>
        <Text style={styles.stepText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: '#eafaf1',
    minWidth: 74,
  },
  addText: { color: colors.primary, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    overflow: 'hidden',
    minWidth: 74,
    justifyContent: 'space-between',
  },
  stepBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  stepText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  qty: { color: '#fff', fontWeight: '700' },
});
