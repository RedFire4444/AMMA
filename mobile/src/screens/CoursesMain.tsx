import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoursesMain = () => {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl mb-2">{'\u{1F4DA}'}</Text>
        <Text className="text-2xl font-serif font-bold text-primary mb-2">
          Courses
        </Text>
        <Text className="text-base text-text-secondary text-center">
          Browse meditation, yoga, pranayama courses and more. Full implementation coming in Phase 2.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default CoursesMain;
