import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PremiumLockProps {
  children: React.ReactNode;
  isPremium: boolean;
  onUpgrade: () => void;
}

export const PremiumLock = ({
  children,
  isPremium,
  onUpgrade,
}: PremiumLockProps) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View className="relative overflow-hidden rounded-card">
      {/* Render children underneath the overlay */}
      <View className="opacity-40">{children}</View>

      {/* Dark overlay with lock and CTA */}
      <View className="absolute inset-0 bg-black/50 rounded-card items-center justify-center px-4">
        {/* Lock Icon */}
        <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-3">
          <Text className="text-2xl">{'\u{1F512}'}</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={onUpgrade}
          className="bg-primary py-2 px-5 rounded-button"
        >
          <Text className="text-white font-bold text-sm">
            Upgrade to Premium
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
