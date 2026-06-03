import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, unwrap } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  cart_item_id: string;
  quantity: number;
  line_total: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
  };
}

export interface CartTotals {
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  free_delivery_above: number;
  min_order_value: number;
  currency: string;
}

interface CartState {
  items: CartItem[];
  totals: CartTotals | null;
  count: number;
  loading: boolean;
  reload: () => Promise<void>;
  add: (productId: string, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  quantityOf: (productId: string) => number;
}

const Ctx = createContext<CartState>({} as CartState);
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = (data: { items: CartItem[]; totals: CartTotals }) => {
    setItems(data.items);
    setTotals(data.totals);
  };

  const reload = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotals(null);
      return;
    }
    setLoading(true);
    try {
      apply(unwrap(await api.get('/cart')));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = async (productId: string, qty = 1) => {
    apply(unwrap(await api.post('/cart/items', { product_id: productId, quantity: qty })));
  };

  const setQty = async (productId: string, qty: number) => {
    apply(unwrap(await api.put('/cart/items', { product_id: productId, quantity: qty })));
  };

  const clear = async () => {
    await api.delete('/cart');
    setItems([]);
    setTotals(null);
  };

  const quantityOf = (productId: string) =>
    items.find((i) => i.product.id === productId)?.quantity ?? 0;

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, totals, count, loading, reload, add, setQty, clear, quantityOf }}>
      {children}
    </Ctx.Provider>
  );
}
