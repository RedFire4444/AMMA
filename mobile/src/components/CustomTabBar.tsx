import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={s.container}>
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
            style={s.tabButton}
          >
            {isCenter ? (
              <View
                style={[
                  s.centerIcon,
                  isFocused ? s.centerIconFocused : s.centerIconUnfocused,
                ]}
              >
                <Text style={s.centerIconText}>{icon}</Text>
              </View>
            ) : (
              <Text
                style={[s.iconText, isFocused ? s.iconFocused : s.iconUnfocused]}
              >
                {icon}
              </Text>
            )}
            <Text
              style={[
                s.label,
                isFocused ? s.labelFocused : s.labelUnfocused,
              ]}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerIconFocused: {
    backgroundColor: '#1B4332',
  },
  centerIconUnfocused: {
    backgroundColor: '#2D6A4F',
  },
  centerIconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  iconText: {
    fontSize: 20,
  },
  iconFocused: {
    color: '#1B4332',
  },
  iconUnfocused: {
    color: '#9CA3AF',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  labelFocused: {
    color: '#1B4332',
    fontWeight: 'bold',
  },
  labelUnfocused: {
    color: '#9CA3AF',
  },
});
