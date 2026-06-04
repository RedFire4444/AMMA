import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, ImageSourcePropType> = {
  Journey: require('../assets/icons/New folder/My journey.png'),
  Courses: require('../assets/icons/New folder/Courses.png'),
  Home: require('../assets/icons/New folder/Home.png'),
  Directory: require('../assets/icons/New folder/Directory.png'),
  Profile: require('../assets/icons/New folder/Profile.png'),
};

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { bottom: Math.max(insets.bottom, 10) }]}>
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
        const icon = TAB_ICONS[route.name] || TAB_ICONS.Home;

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
              <View style={s.centerIcon}>
                <Image
                  source={icon}
                  style={[
                    s.centerIconImage,
                    isFocused ? s.iconFocused : s.iconUnfocused,
                  ]}
                />
              </View>
            ) : (
              <Image
               source={icon}
                style={[
                  (route.name === 'Journey' || route.name === 'Directory' || route.name === 'Profile')
                    ? s.iconImageBigger
                    : s.iconImage,
                                                      route.name === 'Courses' ? { transform: [{ translateY: 10 }] } : null,
                  route.name === 'Journey' ? { transform: [{ translateY: 10 }] } : null,
                  route.name === 'Profile' ? { transform: [{ translateY: 10 }] } : null,
                                    route.name === 'Directory' ? { transform: [{ translateY: 10 }, { scale: 0.9 }] } : null,

                  isFocused ? s.iconFocused : s.iconUnfocused,
                ]}
              />
            )}
            <Text
              style={[
                s.label,
                route.name === 'Courses' ? { marginTop: 15 } : null,
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
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#FFF9F5',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 116, 45, 0.12)',
    shadowColor: '#7A3E1E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 14,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },

  centerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  centerIconImage: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  iconImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  iconImageBigger: {
    width: 50,
    height: 50,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  iconFocused: {
    opacity: 1,
  },
  iconUnfocused: {
    opacity: 0.55,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  labelFocused: {
    color: '#ED7624',
    fontWeight: '700',
  },
  labelUnfocused: {
    color: '#9F9693',
  },
});
