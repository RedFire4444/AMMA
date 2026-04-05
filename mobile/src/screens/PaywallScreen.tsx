import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { paymentService } from '../services/payment.service';
import { useSubscription } from '../hooks/useSubscription';

type PlanType = 'monthly' | 'annual';

interface FeatureRow {
  feature: string;
  free: string;
  premium: string;
}

const FEATURES: FeatureRow[] = [
  { feature: 'Guided Meditations', free: '10 sessions', premium: 'Full library (500+)' },
  { feature: 'Courses', free: '1 free course', premium: 'All courses' },
  { feature: 'Meditation Timer', free: 'Basic sounds', premium: 'All sounds' },
  { feature: 'Streak Tracking', free: 'Yes', premium: 'Yes + insights' },
  { feature: 'Live Events', free: 'View only', premium: 'Full access + replay' },
  { feature: 'Offline Downloads', free: 'No', premium: 'Yes' },
  { feature: 'Ad-Free', free: 'No', premium: 'Yes' },
];

const FeatureTableRow = ({ row, isLast }: { row: FeatureRow; isLast: boolean }) => (
  <View
    className={`flex-row py-3 ${isLast ? '' : 'border-b border-border'}`}
  >
    <Text className="flex-1 text-sm text-text-primary font-medium">
      {row.feature}
    </Text>
    <Text className="w-24 text-xs text-text-secondary text-center">
      {row.free}
    </Text>
    <Text className="w-24 text-xs text-primary text-center font-semibold">
      {row.premium}
    </Text>
  </View>
);

const PaywallScreen = () => {
  const navigation = useNavigation();
  const { refresh } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const order = await paymentService.createOrder(selectedPlan);
      // In production, this would open Razorpay SDK with order.gateway_order_id.
      // For now, simulate a successful payment verification.
      await paymentService.verifyPayment(
        order.id,
        `pay_${Date.now()}`,
        `sig_${Date.now()}`,
      );
      await refresh();
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Payment failed. Please try again.';
      Alert.alert('Payment Error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface border border-border"
          >
            <Text className="text-lg text-text-primary">{'\u{2190}'}</Text>
          </TouchableOpacity>
          <View className="flex-1" />
        </View>

        {/* Title */}
        <View className="px-6 mt-4">
          <Text className="text-2xl font-serif font-bold text-primary">
            Enhance Your Practice
          </Text>
          <Text className="text-sm text-text-secondary mt-2 leading-5">
            Unlock the full MAM experience with premium access to all meditations,
            courses, and exclusive content.
          </Text>
        </View>

        {/* Feature Comparison Table */}
        <View className="mx-6 mt-6 bg-surface rounded-card border border-border p-4">
          {/* Table Header */}
          <View className="flex-row pb-3 border-b border-border">
            <Text className="flex-1 text-sm font-bold text-text-primary">
              Feature
            </Text>
            <Text className="w-24 text-xs font-bold text-text-secondary text-center">
              Free
            </Text>
            <Text className="w-24 text-xs font-bold text-primary text-center">
              Premium
            </Text>
          </View>
          {/* Table Rows */}
          {FEATURES.map((row, index) => (
            <FeatureTableRow
              key={row.feature}
              row={row}
              isLast={index === FEATURES.length - 1}
            />
          ))}
        </View>

        {/* Plan Cards */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-text-primary mb-3">
            Choose Your Plan
          </Text>

          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            className={`rounded-card border-2 p-4 mb-3 ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-text-primary">
                  Monthly
                </Text>
                <Text className="text-sm text-text-secondary mt-1">
                  Billed monthly
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold text-primary">
                  {'\u{20B9}'}199
                </Text>
                <Text className="text-xs text-text-secondary">/month</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('annual')}
            className={`rounded-card border-2 p-4 mb-3 ${
              selectedPlan === 'annual'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface'
            }`}
          >
            {/* Save Badge */}
            <View className="absolute -top-3 right-4 bg-accent rounded-pill px-3 py-1">
              <Text className="text-xs font-bold text-white">Save 37%</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-text-primary">
                  Annual
                </Text>
                <Text className="text-sm text-text-secondary mt-1">
                  Billed annually
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold text-primary">
                  {'\u{20B9}'}1,499
                </Text>
                <Text className="text-xs text-text-secondary">/year</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <View className="px-6 mt-4 mb-8">
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={isProcessing}
            className={`py-4 rounded-button items-center ${
              isProcessing ? 'bg-primary/50' : 'bg-primary'
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">
                Subscribe Now
              </Text>
            )}
          </TouchableOpacity>
          <Text className="text-xs text-text-secondary text-center mt-3 leading-4">
            Cancel anytime. You can manage your subscription from your profile
            settings.
          </Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessDismiss}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-surface rounded-card p-6 w-full items-center">
            <View className="w-16 h-16 rounded-full bg-success/10 items-center justify-center mb-4">
              <Text className="text-3xl">{'\u{2713}'}</Text>
            </View>
            <Text className="text-xl font-bold text-text-primary mb-2">
              Welcome to Premium!
            </Text>
            <Text className="text-sm text-text-secondary text-center mb-6 leading-5">
              Your subscription is now active. Enjoy unlimited access to all
              meditations, courses, and premium features.
            </Text>
            <TouchableOpacity
              onPress={handleSuccessDismiss}
              className="bg-primary py-3 px-8 rounded-button"
            >
              <Text className="text-white font-bold">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaywallScreen;
