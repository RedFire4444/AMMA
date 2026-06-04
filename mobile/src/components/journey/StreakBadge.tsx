import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface StreakBadgeProps {
  count: number;
  label: string;
}

export const StreakBadge = ({ count, label }: StreakBadgeProps) => {
  return (
    <View style={s.badge}>
      <Image
        source={require('../../assets/icons/New folder/Fire.png')}
        style={s.fireIcon}
      />
      <Text style={s.count}>{count}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
};

const FONT_FAMILY = 'Manrope';
const palette = {
  background: '#FFFDF9',
  border: '#F7E7C9',
  streak: '#FF7A00',
  secondaryText: '#524435',
};

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fireIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 4,
  },
  count: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.streak,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: palette.secondaryText,
    marginLeft: 4,
  },
});
