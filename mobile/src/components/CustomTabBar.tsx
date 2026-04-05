import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, string> = {
  Journey: '\u{1F4D6}',
  Courses: '\u{25B6}',
  Home: '\u{1F3E0}',
  Directory: '\u{25A6}',
  Profile: '\u{1F464}',
};

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View className="flex-row bg-white pb-6 pt-3 px-2 border-t border-border">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;
        const isCenter = route.name === 'Home';
        const icon = TAB_ICONS[route.name] || '\u{2B55}';

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
            testID={`tab-${route.name}`}
            onPress={onPress}
            className="flex-1 items-center justify-center"
          >
            {isCenter ? (
              <View
                className={`w-12 h-12 rounded-full items-center justify-center -mt-4 ${
                  isFocused ? 'bg-primary' : 'bg-primary-light'
                }`}
              >
                <Text className="text-xl text-white">{icon}</Text>
              </View>
            ) : (
              <Text
                className={`text-xl ${isFocused ? 'text-primary' : 'text-gray-400'}`}
              >
                {icon}
              </Text>
            )}
            <Text
              className={`text-xs mt-1 ${
                isFocused ? 'text-primary font-bold' : 'text-gray-400'
              }`}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
