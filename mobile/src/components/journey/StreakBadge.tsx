import React from 'react';
import { View, Text } from 'react-native';

interface StreakBadgeProps {
  count: number;
  label: string;
}

export const StreakBadge = ({ count, label }: StreakBadgeProps) => {
  return (
    <View className="flex-row items-center bg-amber-50 border border-amber-200 rounded-pill px-3 py-1.5">
      <Text className="text-sm mr-1">{'\u{1F525}'}</Text>
      <Text className="text-sm font-bold text-amber-700">{count}</Text>
      <Text className="text-xs text-amber-600 ml-1">{label}</Text>
    </View>
  );
};
