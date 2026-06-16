import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Simple icon component using Unicode symbols - no native module required
const TabIcon = ({ name, color }: { name: string; color: string }) => {
  const iconStyle = { width: 24, height: 24, tintColor: color };
  
  switch (name) {
    case 'Journey':
      return (
        <View style={s.iconContainer}>
          <Text style={[s.iconText, { color }]}>📖</Text>
        </View>
      );
    case 'Courses':
      return (
        <View style={s.iconContainer}>
          <Text style={[s.iconText, { color }]}>▶️</Text>
        </View>
      );
    case 'Home':
      return (
        <View style={s.iconContainer}>
          <Text style={[s.iconText, { color }]}>🏠</Text>
        </View>
      );
    case 'Directory':
      return (
        <View style={s.iconContainer}>
          <Text style={[s.iconText, { color }]}>⊞</Text>
        </View>
      );
    case 'Profile':
      return (
        <View style={s.iconContainer}>
          <Text style={[s.iconText, { color }]}>👤</Text>
        </View>
      );
    default:
      return null;
  }
};

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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
        const color = isFocused ? '#ff7a00' : '#A0AEC0'; // Assuming inactive color is gray-ish

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
            style={[s.tabButton, isCenter && s.tabButtonCenter]}
          >
            {isCenter ? (
              <View style={s.centerIconWrapper}>
                <TabIcon name={route.name} color="white" />
              </View>
            ) : (
              <View style={s.iconWrapper}>
                <TabIcon name={route.name} color={color} />
              </View>
            )}
            <Text
              style={[
                s.label,
                { color: color },
                isCenter && s.labelCenter,
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
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    textAlign: 'center',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabButton: {
    alignItems: 'center',
    width: 64,
    marginBottom: 8,
    gap: 4,
  },
  tabButtonCenter: {
    position: 'relative',
    marginTop: -28,
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  centerIconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#ff7a00',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#ff7a00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 12,
      },
      android: {

      },
    }),
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  labelCenter: {
    fontSize: 11,
  },
});

