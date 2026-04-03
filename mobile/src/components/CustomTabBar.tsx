import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View className="flex-row bg-white pb-6 pt-3 px-4 border-t border-border shadow-sm">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            className="flex-1 items-center justify-center space-y-1"
          >
            {/* Placeholder for Icon, requires vector-icons or svgs */}
            <View className={`w-6 h-6 rounded-full \${isFocused ? 'bg-primary' : 'bg-gray-300'}`} />
            <Text className={`text-xs \${isFocused ? 'text-primary font-bold' : 'text-gray-500'}`}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
