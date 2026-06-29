/**
 * File: RegisterScreen.tsx
 *
 * Description: User registration screen with email/password or phone signup.
 * Provides validation, password confirmation, and terms acceptance.
 *
 * Author: AI Assistant
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
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/styles';

type RegisterMode = 'email' | 'phone';
type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [registerMode, setRegisterMode] = useState<RegisterMode>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const { emailSignup, requestOTP, isLoading } = useAuthStore();

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (registerMode === 'email') {
      if (!email.trim()) {
        setError('Please enter your email');
        return false;
      }
      if (!EMAIL_REGEX.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!password) {
        setError('Please enter a password');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      if (!phoneNumber) {
        setError('Please enter your phone number');
        return false;
      }
      if (phoneNumber.length !== 10) {
        setError('Please enter a valid 10-digit number');
        return false;
      }
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleEmailRegister = async () => {
    if (!validateForm()) return;
    setError('');
    
    try {
      await emailSignup(email, password);
      Alert.alert(
        'Success!',
        'Your account has been created. Please login with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] Email Registration Error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const handlePhoneRegister = async () => {
    if (!validateForm()) return;
    setError('');
    
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      await requestOTP(fullPhone, 'signup');
      navigation.navigate('OTP', { phone: fullPhone, purpose: 'signup' });
    } catch (err: unknown) {
      if (__DEV__) console.warn('[Auth] Phone Registration Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    }
  };

  const handleRegister = () => {
    if (registerMode === 'email') {
      handleEmailRegister();
    } else {
      handlePhoneRegister();
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
            {/* Logo + heading */}
            <View style={[s.center, s.headerSection]}>
              <View style={s.logoContainer}>
                <Image
                  source={require('../assets/images/app-logo.jpg')}
                  style={s.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={s.title}>Create Account</Text>
              <Text style={s.subtitle}>
                {registerMode === 'email'
                  ? 'Sign up with your email'
                  : "We'll send you a verification code"}
              </Text>
            </View>

            {/* Full Name Field */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                autoCapitalize="words"
                accessibilityLabel="Full name"
                onChangeText={t => { setFullName(t); setError(''); }}
              />
            </View>

            {/* Email or Phone Fields */}
            {registerMode === 'email' ? (
              <>
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
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>Password</Text>
                  <View style={s.passwordContainer}>
                    <TextInput
                      style={s.passwordInput}
                      placeholder="At least 6 characters"
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

                <View style={s.fieldGroup}>
                  <Text style={s.label}>Confirm Password</Text>
                  <View style={s.passwordContainer}>
                    <TextInput
                      style={s.passwordInput}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      accessibilityLabel="Confirm password"
                      onChangeText={t => { setConfirmPassword(t); setError(''); }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={s.eyeButton}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <Text style={[s.eyeIcon, { opacity: showConfirmPassword ? 1.0 : 0.4 }]}>👁️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
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
            )}

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={s.checkboxRow}
              onPress={() => {
                Alert.alert(
                  'Terms & Conditions',
                  'By creating an account, you agree to our Terms of Service and Privacy Policy.',
                  [
                    { text: 'View Terms', onPress: () => navigation.navigate('TermsPrivacy') },
                    { text: 'OK', style: 'cancel', onPress: () => setAcceptedTerms(true) },
                  ]
                );
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
            >
              <View style={[s.checkbox, acceptedTerms && s.checkboxChecked]}>
                {acceptedTerms && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkboxLabel}>
                I agree to the <Text style={s.link}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {error ? <Text style={s.error}>{error}</Text> : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[s.btn, isLoading ? s.btnLoading : s.btnPrimary]}
              onPress={handleRegister}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isLoading ? <ActivityIndicator color="white" /> :
                <Text style={s.btnText}>Create Account</Text>}
            </TouchableOpacity>

            {/* Toggle register mode */}
            <TouchableOpacity
              onPress={() => { setError(''); setRegisterMode(registerMode === 'email' ? 'phone' : 'email'); }}
              style={[s.center, s.toggleRow]}
              accessibilityRole="button"
            >
              <Text style={s.toggle}>
                {registerMode === 'email' ? 'Use phone instead' : 'Use email instead'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={[s.center, s.loginRow]}>
              <Text style={s.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
              >
                <Text style={s.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  headerSection: { marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  toggleRow: { marginTop: 16 },
  loginRow: { marginTop: 20, flexDirection: 'row' },
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
    marginBottom: 16,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 15,
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
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray800,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  codeBox: { paddingHorizontal: 16, paddingVertical: 14, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: 'rgba(249, 250, 251, 0.92)' },
  codeText: { fontSize: 16, fontWeight: '600', color: colors.gray800 },
  phoneInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.gray800 },
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
    paddingVertical: 14,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.white,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
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
  loginText: {
    fontSize: 14,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default RegisterScreen;
