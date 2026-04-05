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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

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
    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      await requestOTP(fullPhone);
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(message);
    }
  };

  const handleEmailLogin = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    try {
      await emailLogin(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await authService.googleLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setError(message);
    }
  };

  const toggleAuthMode = () => {
    setError('');
    setAuthMode(authMode === 'phone' ? 'email' : 'phone');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-serif font-bold text-primary-dark mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-500 font-sans text-center">
            {authMode === 'phone'
              ? 'Enter your phone number to receive a secure one-time password.'
              : 'Sign in with your email and password.'}
          </Text>
        </View>

        {authMode === 'phone' ? (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
            <View className="flex-row items-center border border-border rounded-xl bg-white overflow-hidden">
              <View className="px-4 py-4 border-r border-border bg-gray-50">
                <Text className="text-base font-semibold text-gray-800">{countryCode}</Text>
              </View>
              <TextInput
                className="flex-1 px-4 py-4 text-base text-gray-800"
                placeholder="9876543210"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                maxLength={15}
              />
            </View>
          </View>
        ) : (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              className="border border-border rounded-xl bg-white px-4 py-4 text-base text-gray-800 mb-4"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text.trim());
                setError('');
              }}
            />
            <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
            <TextInput
              className="border border-border rounded-xl bg-white px-4 py-4 text-base text-gray-800"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
            />
          </View>
        )}

        {error ? (
          <Text className="text-red-500 mb-4 text-sm">{error}</Text>
        ) : null}

        <TouchableOpacity
          className={isLoading ? 'w-full py-4 rounded-xl items-center bg-primary-light' : 'w-full py-4 rounded-xl items-center bg-primary'}
          onPress={authMode === 'phone' ? handleSendOTP : handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {authMode === 'phone' ? 'Send OTP' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleAuthMode} className="mt-4 items-center">
          <Text className="text-primary font-semibold text-sm">
            {authMode === 'phone'
              ? 'Or use your email instead'
              : 'Or use phone number instead'}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 items-center">
          <View className="flex-row items-center mb-4 w-full">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-3 text-gray-400 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <TouchableOpacity
            className="w-full py-4 rounded-xl items-center border border-border bg-white flex-row justify-center"
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Text className="text-gray-800 font-bold text-base">Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
