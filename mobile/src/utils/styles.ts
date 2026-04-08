/**
 * File: styles.ts
 *
 * Description: Centralized StyleSheet definitions replacing NativeWind className
 * utility classes. Provides themed styles matching the MAA design system.
 *
 * Author: Navnit(Ninjacode911)
 */

import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  primaryDark: '#0B2B1F',
  secondary: '#2D6A4F',
  accent: '#40916C',
  background: '#FAFAF5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
};

export const fonts = {
  sans: 'Inter',
  serif: 'PlayfairDisplay',
};

export const gs = StyleSheet.create({
  // Layout
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexWrap: { flexWrap: 'wrap' },
  itemsCenter: { alignItems: 'center' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyEnd: { justifyContent: 'flex-end' },
  selfEnd: { alignSelf: 'flex-end' },

  // Background
  bgBackground: { backgroundColor: colors.background },
  bgSurface: { backgroundColor: colors.surface },
  bgPrimary: { backgroundColor: colors.primary },
  bgPrimaryLight: { backgroundColor: colors.primaryLight },
  bgPrimaryDark: { backgroundColor: colors.primaryDark },
  bgAccent: { backgroundColor: colors.accent },
  bgWhite: { backgroundColor: colors.white },
  bgGray50: { backgroundColor: colors.gray50 },
  bgGray100: { backgroundColor: colors.gray100 },
  bgGray200: { backgroundColor: colors.gray200 },
  bgError: { backgroundColor: colors.error },

  // Text Colors
  textPrimary: { color: colors.primary },
  textPrimaryDark: { color: colors.primaryDark },
  textWhite: { color: colors.white },
  textAccent: { color: colors.accent },
  textMain: { color: colors.textPrimary },
  textSecondary: { color: colors.textSecondary },
  textGray400: { color: colors.gray400 },
  textGray500: { color: colors.gray500 },
  textGray700: { color: colors.gray700 },
  textGray800: { color: colors.gray800 },
  textError: { color: colors.error },

  // Font Sizes
  textXs: { fontSize: 12 },
  textSm: { fontSize: 14 },
  textBase: { fontSize: 16 },
  textLg: { fontSize: 18 },
  textXl: { fontSize: 20 },
  text2xl: { fontSize: 24 },
  text3xl: { fontSize: 30 },
  text4xl: { fontSize: 36 },

  // Font Weight
  fontBold: { fontWeight: 'bold' },
  fontSemibold: { fontWeight: '600' },
  fontMedium: { fontWeight: '500' },

  // Font Family
  fontSerif: { fontFamily: fonts.serif },
  fontSans: { fontFamily: fonts.sans },

  // Spacing
  p4: { padding: 16 },
  p5: { padding: 20 },
  p6: { padding: 24 },
  px4: { paddingHorizontal: 16 },
  px6: { paddingHorizontal: 24 },
  px8: { paddingHorizontal: 32 },
  py2: { paddingVertical: 8 },
  py3: { paddingVertical: 12 },
  py4: { paddingVertical: 16 },
  pt4: { paddingTop: 16 },
  pb2: { paddingBottom: 8 },
  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 12 },
  mt4: { marginTop: 16 },
  mt6: { marginTop: 24 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 12 },
  mb4: { marginBottom: 16 },
  mb6: { marginBottom: 24 },
  mb8: { marginBottom: 32 },
  mb10: { marginBottom: 40 },
  mr2: { marginRight: 8 },
  mr3: { marginRight: 12 },
  mx3: { marginHorizontal: 12 },
  mx6: { marginHorizontal: 24 },

  // Border
  border: { borderWidth: 1, borderColor: colors.border },
  borderR: { borderRightWidth: 1, borderRightColor: colors.border },
  borderT: { borderTopWidth: 1, borderTopColor: colors.border },
  borderB: { borderBottomWidth: 1, borderBottomColor: colors.border },
  roundedXl: { borderRadius: 12 },
  roundedCard: { borderRadius: 12 },
  roundedButton: { borderRadius: 8 },
  roundedPill: { borderRadius: 24 },
  roundedFull: { borderRadius: 9999 },

  // Width/Height
  wFull: { width: '100%' },
  hPx: { height: 1 },

  // Overflow
  overflowHidden: { overflow: 'hidden' },

  // Text align
  textCenter: { textAlign: 'center' },

  // Uppercase
  uppercase: { textTransform: 'uppercase' },
  trackingWide: { letterSpacing: 2 },
});
