/**
 * File: GoogleAuthWebView.tsx
 *
 * Description: Handles Google OAuth login via a WebView. Opens the Supabase Google
 * authorization URL, the backend callback page reads tokens from the URL fragment
 * and posts them back via window.ReactNativeWebView.postMessage(). The onMessage
 * handler here captures them and calls handleGoogleSession.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { SUPABASE_URL } from '@env';

type GoogleAuthNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'GoogleAuthWebView'>;

// Redirect URL that Supabase will call after Google OAuth — must be whitelisted in Supabase dashboard
const REDIRECT_URL = 'http://10.0.2.2:3000/api/auth/google-callback';

// Supabase Google OAuth URL
const GOOGLE_AUTH_URL =
  `${SUPABASE_URL}/auth/v1/authorize` +
  `?provider=google` +
  `&redirect_to=${encodeURIComponent(REDIRECT_URL)}`;

/**
 * Injected JS runs in the WebView page context as a safety net:
 * if the page's inline script fires before the RN bridge is ready,
 * it will find `window.ReactNativeWebView` available now and post the message.
 */
const INJECTED_JS = `
(function() {
  try {
    var fragment = window.location.hash.substring(1) || window.location.search.substring(1);
    var params = new URLSearchParams(fragment);
    var accessToken = params.get('access_token');
    var refreshToken = params.get('refresh_token');
    var errorDesc = params.get('error_description');

    if (accessToken && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'GOOGLE_AUTH_SUCCESS',
        access_token: accessToken,
        refresh_token: refreshToken || ''
      }));
    } else if (errorDesc && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'GOOGLE_AUTH_ERROR',
        error: errorDesc
      }));
    }
  } catch(e) {}
  true; // required for injectedJavaScript
})();
`;

const GoogleAuthWebView = () => {
  const navigation = useNavigation<GoogleAuthNavigationProp>();
  const { handleGoogleSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const handledRef = useRef(false); // prevent double-handling

  /** Handle postMessage from the backend callback page */
  const handleMessage = useCallback(
    async (event: { nativeEvent: { data: string } }) => {
      if (handledRef.current) return;

      try {
        const msg = JSON.parse(event.nativeEvent.data);

        if (msg.type === 'GOOGLE_AUTH_SUCCESS') {
          if (!msg.access_token) {
            setError('Sign-in failed. No token received.');
            return;
          }
          handledRef.current = true;
          await handleGoogleSession(msg.access_token, msg.refresh_token ?? '');
          // RootNavigator auto-redirects to Main once isAuthenticated = true
        } else if (msg.type === 'GOOGLE_AUTH_ERROR') {
          setError(msg.error || 'Google sign-in failed.');
        }
      } catch {
        // Non-JSON message from some other script — ignore
      }
    },
    [handleGoogleSession]
  );

  /** Belt-and-suspenders: also watch URL changes for the callback */
  const handleNavigationChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;
      if (!url || handledRef.current) return;
      // If the navigation lands on our callback URL, injectedJavaScript will fire
      // and postMessage the tokens. Nothing more needed here.
    },
    []
  );

  if (error) {
    return (
      <View style={s.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorTitle}>Sign-in Failed</Text>
        <Text style={s.errorMsg}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => { setError(''); handledRef.current = false; }}>
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
          <Text style={s.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Continue with Google</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Loading overlay */}
      {isLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#ED7624" />
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      )}

      <WebView
        source={{ uri: GOOGLE_AUTH_URL }}
        onNavigationStateChange={handleNavigationChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setError('Failed to load sign-in page. Check your connection.')}
        onMessage={handleMessage}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        style={s.webview}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFF8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  closeIcon: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 36,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#87553E',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFF8F0',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#ED7624',
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  backBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    width: '100%',
    alignItems: 'center',
  },
  backText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GoogleAuthWebView;
