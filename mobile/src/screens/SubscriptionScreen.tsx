/**
 * File: SubscriptionScreen.tsx
 *
 * Description: Subscription management screen displaying current plan status,
 * upgrade CTA, billing history, and cancel subscription controls.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscription } from '../hooks/useSubscription';
import { subscriptionService } from '../services/subscription.service';
import {
  paymentService,
  PaymentRecord,
} from '../services/payment.service';
import { ProfileStackParamList } from '../navigation/types';

type SubscriptionNavProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Subscription'
>;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatAmount = (amountInPaise: number, currency: string): string => {
  const amount = amountInPaise / 100;
  if (currency === 'INR') {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  }
  return `${currency} ${amount}`;
};

const StatusBadge = ({ status }: { status: string }) => {
  const isSuccess = status === 'captured' || status === 'active';
  const isPending = status === 'pending';

  return (
    <View
      className={`rounded-pill px-2 py-1 ${
        isSuccess
          ? 'bg-success/10'
          : isPending
            ? 'bg-yellow-100'
            : 'bg-red-100'
      }`}
    >
      <Text
        className={`text-xs font-semibold capitalize ${
          isSuccess
            ? 'text-success'
            : isPending
              ? 'text-yellow-700'
              : 'text-red-600'
        }`}
      >
        {status}
      </Text>
    </View>
  );
};

const PlanBadge = ({ planType }: { planType: string }) => (
  <View
    className={`rounded-pill px-4 py-2 ${
      planType === 'free' ? 'bg-border' : 'bg-primary/10'
    }`}
  >
    <Text
      className={`text-sm font-bold capitalize ${
        planType === 'free' ? 'text-text-secondary' : 'text-primary'
      }`}
    >
      {planType === 'free' ? 'Free Plan' : `${planType} Premium`}
    </Text>
  </View>
);

const SubscriptionScreen = () => {
  const navigation = useNavigation<SubscriptionNavProp>();
  const { isPremium, planType, expiresAt, isLoading, refresh } =
    useSubscription();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const history = await paymentService.getPaymentHistory();
      setPayments(history);
    } catch {
      // Silently fail
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await subscriptionService.cancelSubscription();
              await refresh();
            } catch (err: unknown) {
              const message =
                err instanceof Error
                  ? err.message
                  : 'Failed to cancel subscription.';
              Alert.alert('Error', message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const renderPaymentItem = ({ item }: { item: PaymentRecord }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-border">
      <View className="flex-1 mr-3">
        <Text className="text-sm font-medium text-text-primary capitalize">
          {item.plan_type} Plan
        </Text>
        <Text className="text-xs text-text-secondary mt-1">
          {formatDate(item.created_at)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-bold text-text-primary">
          {formatAmount(item.amount, item.currency)}
        </Text>
        <View className="mt-1">
          <StatusBadge status={item.status} />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B4332" />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text className="text-lg font-bold text-text-primary ml-3">
            Subscription
          </Text>
          <View className="flex-1" />
        </View>

        {/* Current Plan */}
        <View className="mx-6 mt-6 bg-surface rounded-card border border-border p-5">
          <Text className="text-xs text-text-secondary uppercase tracking-wider mb-3">
            Current Plan
          </Text>
          <View className="flex-row items-center justify-between">
            <PlanBadge planType={planType} />
          </View>

          {isPremium && expiresAt && (
            <View className="mt-4 pt-4 border-t border-border">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">Expires</Text>
                <Text className="text-sm font-semibold text-text-primary">
                  {formatDate(expiresAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="mt-4">
            {isPremium ? (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={cancelling}
                className="py-3 rounded-button items-center border border-red-300 bg-red-50"
              >
                {cancelling ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <Text className="text-red-600 font-semibold text-sm">
                    Cancel Subscription
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Paywall')}
                className="bg-primary py-3 rounded-button items-center"
              >
                <Text className="text-white font-bold text-sm">
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Billing History */}
        <View className="mx-6 mt-6 mb-8">
          <Text className="text-lg font-bold text-text-primary mb-3">
            Billing History
          </Text>
          <View className="bg-surface rounded-card border border-border px-4">
            {paymentsLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#1B4332" />
              </View>
            ) : payments.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-text-secondary">
                  No billing history yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={payments}
                keyExtractor={(item) => item.id}
                renderItem={renderPaymentItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;
