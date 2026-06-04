import { Platform } from 'react-native';

// Android emulator reaches the host machine via 10.0.2.2; iOS sim uses localhost.
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL = `http://${HOST}:4000/api/v1`;

// Origin that serves uploaded images (strip the /api/v1 suffix), e.g. http://10.0.2.2:4000
export const ASSET_ORIGIN = API_URL.replace(/\/api\/v\d+\/?$/, '');

// Deep link scheme used by the PayU callback redirect (zero://payment/result)
export const APP_SCHEME = 'zero';
