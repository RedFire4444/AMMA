import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

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

export const ContentCard = ({
  title,
  instructorName,
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
      className="flex-row bg-surface rounded-card mb-3 border border-border overflow-hidden"
    >
      {/* Thumbnail */}
      <View className="w-32 h-24 bg-primary-light/20 items-center justify-center relative">
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-2xl">{'\u{1F3B5}'}</Text>
        )}
        {durationSeconds ? (
          <View className="absolute bottom-1 right-1 bg-black/70 rounded-pill px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">
              {formatDuration(durationSeconds)}
            </Text>
          </View>
        ) : null}
        {isPremium && (
          <View className="absolute top-1 left-1 bg-accent rounded-pill px-2 py-0.5">
            <Text className="text-white text-xs font-bold">PRO</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
          {title}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Text className="text-xs text-text-secondary">
              {'\u{25B6}'} {viewCount >= 1000 ? `${Math.floor(viewCount / 1000)}k` : viewCount}
            </Text>
          </View>
          <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text className={`text-lg ${isBookmarked ? 'text-accent' : 'text-gray-300'}`}>
              {isBookmarked ? '\u{1F516}' : '\u{1F517}'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
