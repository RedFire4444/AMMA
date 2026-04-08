import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={s.wrapper}>
      {/* Render children underneath the overlay */}
      <View style={s.childrenDimmed}>{children}</View>

      {/* Dark overlay with lock and CTA */}
      <View style={s.overlay}>
        {/* Lock Icon */}
        <View style={s.lockCircle}>
          <Text style={s.lockIcon}>{'\u{1F512}'}</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={onUpgrade}
          style={s.upgradeButton}
        >
          <Text style={s.upgradeText}>
            Upgrade to Premium
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  childrenDimmed: {
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lockIcon: {
    fontSize: 24,
  },
  upgradeButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
