import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, unwrap } from '../api/client';

interface Ml {
  en?: string;
  hi?: string;
}

export interface AppSettings {
  whatsapp_number?: string;
  support_phone?: string;
  store?: { name?: Ml; tagline?: Ml };
  free_delivery_above?: number;
  min_order_value?: number;
  delivery_fee?: number;
  [key: string]: unknown;
}

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  reload: () => Promise<void>;
}

const Ctx = createContext<SettingsState>({ settings: {}, loading: true, reload: async () => {} });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/catalog/home');
      setSettings((unwrap(res).settings ?? {}) as AppSettings);
    } catch {
      /* offline / not logged in yet — keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return <Ctx.Provider value={{ settings, loading, reload }}>{children}</Ctx.Provider>;
}
