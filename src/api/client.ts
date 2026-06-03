import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import i18n from '../i18n';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('zero_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-lang'] = i18n.language || 'en';
  return config;
});

export function unwrap<T = any>(res: { data: { data: T } }): T {
  return res.data.data;
}

export function apiMessage(res: any): string {
  return res?.data?.message ?? '';
}

export function errMsg(err: any): string {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}
