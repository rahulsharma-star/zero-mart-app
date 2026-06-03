import React, { useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';
import { APP_SCHEME } from '../config';

/**
 * Renders an auto-submitting HTML form that POSTs to PayU's _payment endpoint.
 * The backend success/failure URL verifies the hash and redirects to
 * `zero://payment/result?orderId=..&status=..`, which we intercept here.
 */
export default function PaymentScreen({ route, navigation }: any) {
  const { action, params, orderId } = route.params;
  const handled = useRef(false);

  const fields = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}"/>`)
    .join('');

  const html = `
    <!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
    <body onload="document.forms[0].submit()">
      <form action="${action}" method="post">${fields}</form>
      <p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#555">Redirecting to payment…</p>
    </body></html>`;

  const onNavChange = (navState: { url: string }) => {
    if (handled.current) return;
    if (navState.url.startsWith(`${APP_SCHEME}://`)) {
      handled.current = true;
      const status = /status=([^&]+)/.exec(navState.url)?.[1] ?? 'failed';
      navigation.replace('OrderSuccess', { orderId, status });
    }
  };

  return (
    <View style={styles.root}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onNavigationStateChange={onNavChange}
        onShouldStartLoadWithRequest={(req) => {
          if (req.url.startsWith(`${APP_SCHEME}://`)) {
            onNavChange(req);
            return false;
          }
          return true;
        }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});
