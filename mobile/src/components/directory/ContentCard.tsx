import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ContentCardProps {
  id: string;
  title: string;
  instructorName: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  category: string;
  viewCount: number;
  isPremium: boolean;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmark: () => void;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, '0')}:00`;
};

const FONT_FAMILY = 'Manrope';
const palette = {
  primaryContainer: '#EE9F27',
  accentOrange: '#FF7A00',
  surface: '#FFFFFF',
  mainText: '#2F2F2F',
  secondaryText: '#8A7360',
  white: '#FFFFFF',
  cardBorder: '#F7E7C9',
};

export const ContentCard = ({
  title,
  instructorName: _instructorName,
  thumbnailUrl,
  durationSeconds,
  viewCount,
  isPremium,
  isBookmarked,
  onPress,
  onBookmark,
}: ContentCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.card}
    >
      {/* Thumbnail */}
      <View style={s.thumbnail}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={s.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={s.thumbnailEmoji}>{'\u{1F3B5}'}</Text>
        )}
        {durationSeconds ? (
          <View style={s.durationBadge}>
            <Text style={s.durationText}>
              {formatDuration(durationSeconds)}
            </Text>
          </View>
        ) : null}
        {isPremium && (
          <View style={s.proBadge}>
            <Text style={s.proText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={s.footer}>
          <View style={s.viewRow}>
            <Text style={s.viewText}>
              {'\u{25B6}'} {viewCount >= 1000 ? `${Math.floor(viewCount / 1000)}k` : viewCount}
            </Text>
          </View>
          <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[s.bookmarkIcon, isBookmarked ? s.bookmarkActive : s.bookmarkInactive]}>
              {isBookmarked ? '\u{1F516}' : '\u{1F517}'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 128,
    height: 96,
    backgroundColor: 'rgba(45, 106, 79, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationText: {
    fontFamily: FONT_FAMILY,
    color: palette.white,
    fontSize: 10,
    fontWeight: '700',
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: palette.accentOrange,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proText: {
    fontFamily: FONT_FAMILY,
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    color: palette.mainText,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    color: palette.secondaryText,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  bookmarkActive: {
    color: palette.accentOrange,
  },
  bookmarkInactive: {
    color: palette.secondaryText,
  },
});
