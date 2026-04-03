import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

const LoginScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const { requestOTP, isLoading } = useAuthStore();
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background justify-center px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="items-center mb-10">
        <Text className="text-3xl font-serif font-bold text-primary-dark mb-2">Welcome Back</Text>
        <Text className="text-base text-gray-500 font-sans text-center">
          Enter your phone number to receive a secure one-time password.
        </Text>
      </View>

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
        {error ? <Text className="text-red-500 mt-2 text-sm">{error}</Text> : null}
      </View>

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center \${isLoading ? 'bg-primary-light' : 'bg-primary'}`}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Send OTP</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
