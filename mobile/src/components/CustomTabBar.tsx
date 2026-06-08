import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const TabIcon = ({ name, color }: { name: string; color: string }) => {
  switch (name) {
    case 'Journey':
      return (
        <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <Path
            d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20V19H6.5C6.36739 19 6.24021 19.0527 6.14645 19.1464C6.05268 19.2402 6 19.3674 6 19.5C6 19.6326 6.05268 19.7598 6.14645 19.8536C6.24021 19.9473 6.36739 20 6.5 20H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5ZM19 2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V16.83C4.71 16.28 5.58 16 6.5 16H19V2Z"
            fill={color}
          />
        </Svg>
      );
    case 'Courses':
      return (
        <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <Path
            d="M10 16.5L16 12L10 7.5V16.5ZM20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z"
            fill={color}
          />
        </Svg>
      );
    case 'Home':
      return (
        <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <Path
            d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
            fill={color}
          />
        </Svg>
      );
    case 'Directory':
      return (
        <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <Path
            d="M4 4H8V8H4V4ZM10 4H14V8H10V4ZM16 4H20V8H16V4ZM4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10ZM4 16H8V20H4V16ZM10 16H14V20H10V16ZM16 16H20V20H16V16Z"
            fill={color}
          />
        </Svg>
      );
    case 'Profile':
      return (
        <Svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <Path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill={color}
          />
        </Svg>
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

