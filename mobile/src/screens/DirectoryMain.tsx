import React from 'react';
import { View, Text } from 'react-native';

const DirectoryMain = () => {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-2xl font-serif font-bold text-primary mb-2">Directory</Text>
      <Text className="text-text-secondary text-center">
        Browse bhajans, meditations, satsangs and more. Coming in Phase 2.
      </Text>
    </View>
  );
};

export default DirectoryMain;
