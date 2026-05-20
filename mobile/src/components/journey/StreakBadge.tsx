import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakBadgeProps {
  count: number;
  label: string;
}

export const StreakBadge = ({ count, label }: StreakBadgeProps) => {
  return (
    <View style={s.badge}>
      <Text style={s.fireIcon}>{'\u{1F525}'}</Text>
      <Text style={s.count}>{count}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fireIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  count: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ED7624',
  },
  label: {
    fontSize: 12,
    color: '#87553E',
    marginLeft: 4,
  },
});
