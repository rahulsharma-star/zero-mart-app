import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, unwrap } from '../api/client';

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  language: 'en' | 'hi';
}

interface AuthState {
  user: User | null;
  booting: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState>({} as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('zero_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(unwrap(res).user);
        } catch {
          await AsyncStorage.removeItem('zero_token');
        }
      }
      setBooting(false);
    })();
  }, []);

  const signIn = async (token: string, u: User) => {
    await AsyncStorage.setItem('zero_token', token);
    setUser(u);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('zero_token');
    setUser(null);
  };

  const refresh = async () => {
    const res = await api.get('/auth/me');
    setUser(unwrap(res).user);
  };

  return <Ctx.Provider value={{ user, booting, signIn, signOut, refresh }}>{children}</Ctx.Provider>;
}
