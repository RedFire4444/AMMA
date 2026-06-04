/**
 * File: LoginScreen.tsx
 *
 * Description: Handles user authentication via phone OTP, email/password,
 * and Google OAuth. Provides toggle between phone and email login modes.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { colors } from '../utils/styles';

type AuthMode = 'phone' | 'email';
type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { requestOTP, emailLogin, isLoading } = useAuthStore();

  const handleSendOTP = async () => {
    if (!phoneNumber) { setError('Please enter your phone number'); return; }
    if (phoneNumber.length !== 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setError('');
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      await requestOTP(fullPhone);
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] OTP Request Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    }
  };

  const handleEmailLogin = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    if (!EMAIL_REGEX.test(email)) { setError('Please enter a valid email address (e.g., name@domain.com)'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setError('');
    try {
      await emailLogin(email, password);
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] Email Login Error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Check your email and password.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await authService.googleLogin();
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] Google Login Error:', err);
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/welcome-background.jpeg')}
      style={s.backgroundImage}
      imageStyle={s.backgroundImageStyle}
      resizeMode="cover"
      blurRadius={0}
    >
      <View style={s.backgroundOverlay} />
      <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.content}>
            <View style={[s.center, s.headerSection]}>
              <View style={s.logo}><Text style={s.logoEmoji}>{'\u{1F33A}'}</Text></View>
              <Text style={s.title}>Welcome Back</Text>
              <Text style={s.subtitle}>
                {authMode === 'phone'
                  ? 'Enter your phone number to receive a secure one-time password.'
                  : 'Sign in with your email and password.'}
              </Text>
            </View>

            {authMode === 'phone' ? (
              <View style={s.fieldGroup}>
                <Text style={s.label}>Phone Number</Text>
                <View style={s.phoneRow}>
                  <View style={s.codeBox}><Text style={s.codeText}>{countryCode}</Text></View>
                  <TextInput
                    style={s.phoneInput}
                    placeholder="9876543210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    maxLength={10}
                    accessibilityLabel="Phone number"
                    onChangeText={t => {
                      const cleaned = t.replace(/[^0-9]/g, '').slice(0, 10);
                      setPhoneNumber(cleaned);
                      setError('');
                    }}
                  />
                </View>
              </View>
            ) : (
              <View style={s.fieldGroup}>
                <Text style={s.label}>Email</Text>
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  accessibilityLabel="Email address"
                  onChangeText={t => { setEmail(t.trim()); setError(''); }}
                />
                <Text style={[s.label, s.labelSpaced]}>Password</Text>
                <TextInput
                  style={s.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  accessibilityLabel="Password"
                  onChangeText={t => { setPassword(t); setError(''); }}
                />
              </View>
            )}

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btn, isLoading ? s.btnLoading : s.btnPrimary]}
              onPress={authMode === 'phone' ? handleSendOTP : handleEmailLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={authMode === 'phone' ? 'Send OTP' : 'Login'}
            >
              {isLoading ? <ActivityIndicator color="white" /> :
                <Text style={s.btnText}>{authMode === 'phone' ? 'Send OTP' : 'Login'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setError(''); setAuthMode(authMode === 'phone' ? 'email' : 'phone'); }}
              style={[s.center, s.toggleRow]}
              accessibilityRole="button"
            >
              <Text style={s.toggle}>{authMode === 'phone' ? 'Or use your email instead' : 'Or use phone number instead'}</Text>
            </TouchableOpacity>

            <View style={s.divRow}>
              <View style={s.divLine} /><Text style={s.divText}>OR</Text><View style={s.divLine} />
            </View>

            <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin} disabled={isLoading}>
              <Text style={s.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const s = StyleSheet.create({
  flex1: { flex: 1 },
  backgroundImage: { flex: 1, backgroundColor: colors.background },
  backgroundImageStyle: { opacity: 1 },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 4, 0.1)',
  },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  content: {
    width: '100%',
    paddingVertical: 8,
  },
  center: { alignItems: 'center' },
  headerSection: { marginBottom: 32 },
  fieldGroup: { marginBottom: 20 },
  labelSpaced: { marginTop: 16 },
  toggleRow: { marginTop: 16 },
  btnPrimary: { backgroundColor: colors.primary },
  btnLoading: { backgroundColor: colors.primaryLight },
  logoEmoji: { fontSize: 36 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(237, 118, 36, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  codeBox: { paddingHorizontal: 16, paddingVertical: 16, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: 'rgba(249, 250, 251, 0.92)' },
  codeText: { fontSize: 16, fontWeight: '600', color: colors.gray800 },
  phoneInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: colors.gray800 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.gray800,
  },
  error: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textShadowColor: 'rgba(220, 38, 38, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  toggle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  divRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.65)' },
  divText: {
    marginHorizontal: 12,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  googleBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  googleText: { color: colors.gray800, fontWeight: 'bold', fontSize: 16 },
});

export default LoginScreen;
