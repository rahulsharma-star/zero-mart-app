import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '../theme';

// Loaded defensively: if the native module isn't linked (e.g. before a rebuild)
// the app keeps working and the mic button simply hides.
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch {
  Voice = null;
}

interface Props {
  onResult: (text: string) => void;
  color?: string;
}

export default function VoiceSearchButton({ onResult, color }: Props) {
  const { t, i18n } = useTranslation();
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const pulse = useRef(new Animated.Value(1)).current;

  const stop = useCallback(async () => {
    try {
      await Voice?.stop?.();
    } catch {
      /* ignore */
    }
    setListening(false);
    setPartial('');
  }, []);

  useEffect(() => {
    if (!Voice) return;

    Voice.onSpeechResults = (e: any) => {
      const text = e?.value?.[0];
      if (text) {
        setPartial(text);
        onResult(text);
        setTimeout(() => stop(), 350);
      }
    };
    Voice.onSpeechPartialResults = (e: any) => {
      const text = e?.value?.[0];
      if (text) setPartial(text);
    };
    Voice.onSpeechError = () => {
      stop();
    };

    return () => {
      Voice?.destroy?.()
        .then(() => Voice?.removeAllListeners?.())
        .catch(() => {});
    };
  }, [onResult, stop]);

  // Pulsing mic animation while listening.
  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [listening, pulse]);

  const ensurePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
        title: t('mic_permission_title'),
        message: t('mic_permission_msg'),
        buttonPositive: t('continue'),
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const start = async () => {
    if (!Voice) {
      Alert.alert(t('voice_unavailable'));
      return;
    }
    const allowed = await ensurePermission();
    if (!allowed) {
      Alert.alert(t('mic_permission_denied'));
      return;
    }
    setPartial('');
    setListening(true);
    const locale = i18n.language === 'en' ? 'en-IN' : 'hi-IN';
    try {
      await Voice.start(locale);
    } catch {
      setListening(false);
      Alert.alert(t('voice_unavailable'));
    }
  };

  if (!Voice) return null;

  return (
    <>
      <TouchableOpacity onPress={start} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={[styles.mic, !!color && { color }]}>🎤</Text>
      </TouchableOpacity>

      <Modal visible={listening} transparent animationType="fade" onRequestClose={stop}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{t('listening')}</Text>
            <Animated.View style={[styles.circle, { transform: [{ scale: pulse }] }]}>
              <Text style={styles.micBig}>🎤</Text>
            </Animated.View>
            <Text style={styles.partial}>{partial || t('speak_now')}</Text>
            <Text style={styles.hint}>{t('voice_hint')}</Text>
            <TouchableOpacity style={styles.cancel} onPress={stop}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mic: { fontSize: 18, marginLeft: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '900', color: colors.text },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  micBig: { fontSize: 40 },
  partial: { fontSize: 18, fontWeight: '700', color: colors.primary, textAlign: 'center', minHeight: 26 },
  hint: { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
  cancel: { marginTop: spacing.lg, paddingVertical: 12, paddingHorizontal: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.muted, fontWeight: '700' },
});
