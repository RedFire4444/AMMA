/**
 * File: OTPScreen.tsx
 *
 * Description: OTP verification screen with 6-digit input fields, auto-verify
 * on completion, countdown-based resend functionality, and session establishment.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const OTPScreen = ({ route }: Props) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIMER);
  const [error, setError] = useState('');

  const { verifyOTP, requestOTP, isLoading } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const value = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');

    try {
      await verifyOTP(phone, code);
      // Navigation is handled by App navigator based on authStore session state.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please check your OTP.';
      setError(message);
    }
  };

  // Auto verify when all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== '')) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleVerify is stable (only depends on phone which never changes on this screen)
  }, [otp]);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await requestOTP(phone);
      setTimer(RESEND_TIMER);
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP.';
      setError(message);
    }
  };

  const getOtpInputClassName = (digit: string): string => {
    if (digit) {
      return 'w-12 h-14 border rounded-xl text-center text-xl font-bold bg-white border-primary text-primary';
    }
    return 'w-12 h-14 border rounded-xl text-center text-xl font-bold bg-white border-gray-300 text-gray-800';
  };

  const isResendDisabled = timer > 0 || isLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background justify-center px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="items-center mb-10">
        <Text className="text-3xl font-serif font-bold text-primary-dark mb-2">Verification</Text>
        <Text className="text-base text-gray-500 font-sans text-center">
          We've sent a 6-digit verification code to
        </Text>
        <Text className="text-lg font-bold text-gray-800 mt-1">{phone || 'your phone'}</Text>
      </View>

      <View className="flex-row justify-between mb-4 mt-2 px-2">
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputRefs.current[idx] = ref;
            }}
            className={getOtpInputClassName(digit)}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            testID={'otp-input-' + idx}
          />
        ))}
      </View>

      {error ? (
        <Text className="text-red-500 text-center mb-4 text-sm">{error}</Text>
      ) : (
        <View className="h-4 mb-4" />
      )}

      <TouchableOpacity
        className={isLoading ? 'w-full py-4 rounded-xl items-center bg-primary-light' : 'w-full py-4 rounded-xl items-center bg-primary'}
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Verify OTP</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-gray-500 font-sans">Didn't receive the code? </Text>
        <TouchableOpacity onPress={handleResend} disabled={isResendDisabled}>
          <Text className={isResendDisabled ? 'font-bold text-gray-400' : 'font-bold text-primary'}>
            {timer > 0 ? 'Resend in ' + timer + 's' : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;
