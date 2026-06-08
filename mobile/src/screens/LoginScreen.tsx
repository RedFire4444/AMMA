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
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/styles';

type AuthMode = 'phone' | 'email';
type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimal inline Google "G" SVG rendered as text — no extra package needed */
const GoogleIcon = () => (
  <View style={s.googleIconWrapper}>
    <Text style={s.googleIconText}>G</Text>
  </View>
);

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { requestOTP, emailLogin, isLoading } = useAuthStore();

  const handleSendOTP = async () => {
    if (!phoneNumber) { setError('Enter your phone number'); return; }
    if (phoneNumber.length !== 10) { setError('Enter a valid 10-digit number'); return; }
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
    if (!email) { setError('Enter your email'); return; }
    if (!EMAIL_REGEX.test(email)) { setError('Invalid email address'); return; }
    if (!password) { setError('Enter your password'); return; }
    setError('');
    try {
      await emailLogin(email, password);
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] Email Login Error:', err);
      setError(err instanceof Error ? err.message : 'Wrong email or password.');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    navigation.navigate('GoogleAuthWebView');
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
            {/* Logo + heading */}
            <View style={[s.center, s.headerSection]}>
              <View style={s.logoContainer}>
                <Image
                  source={require('../assets/images/app-logo.jpg')}
                  style={s.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={s.title}>Welcome Back</Text>
              <Text style={s.subtitle}>
                {authMode === 'phone'
                  ? "We'll text you a code."
                  : 'Sign in with email.'}
              </Text>
            </View>

            {/* Input fields */}
            {authMode === 'phone' ? (
              <View style={s.fieldGroup}>
                <Text style={s.label}>Phone</Text>
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
                <View style={s.passwordContainer}>
                  <TextInput
                    style={s.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    accessibilityLabel="Password"
                    onChangeText={t => { setPassword(t); setError(''); }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={s.eyeButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={[s.eyeIcon, { opacity: showPassword ? 1.0 : 0.4 }]}>👁️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {error ? <Text style={s.error}>{error}</Text> : null}

            {/* Primary CTA */}
            <TouchableOpacity
              style={[s.btn, isLoading ? s.btnLoading : s.btnPrimary]}
              onPress={authMode === 'phone' ? handleSendOTP : handleEmailLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={authMode === 'phone' ? 'Send OTP' : 'Login'}
            >
              {isLoading ? <ActivityIndicator color="white" /> :
                <Text style={s.btnText}>{authMode === 'phone' ? 'Send OTP' : 'Sign In'}</Text>}
            </TouchableOpacity>

            {/* Toggle mode */}
            <TouchableOpacity
              onPress={() => { setError(''); setAuthMode(authMode === 'phone' ? 'email' : 'phone'); }}
              style={[s.center, s.toggleRow]}
              accessibilityRole="button"
            >
              <Text style={s.toggle}>
                {authMode === 'phone' ? 'Use email instead' : 'Use phone instead'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divRow}>
              <View style={s.divLine} /><Text style={s.divText}>OR</Text><View style={s.divLine} />
            </View>

            {/* Google sign-in */}
            <TouchableOpacity
              style={s.googleBtn}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <GoogleIcon />
              <Text style={s.googleText}>Continue with Google</Text>
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
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.gray800,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
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
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  googleText: { color: colors.gray800, fontWeight: '700', fontSize: 16 },
});

export default LoginScreen;