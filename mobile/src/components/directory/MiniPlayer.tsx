import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MiniPlayerProps {
  title: string;
  artist: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

export const MiniPlayer = ({
  title,
  artist,
  isPlaying,
  onPlayPause,
  onClose,
}: MiniPlayerProps) => {
  return (
    <View className="flex-row items-center bg-primary px-4 py-3 border-t border-primary-light">
      {/* Thumbnail */}
      <View className="w-10 h-10 rounded-button bg-white/20 items-center justify-center mr-3">
        <Text className="text-lg text-white">{'\u{1F3B5}'}</Text>
      </View>

      {/* Info */}
      <View className="flex-1 mr-3">
        <Text className="text-white text-sm font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {artist && (
          <Text className="text-white/60 text-xs" numberOfLines={1}>
            {artist}
          </Text>
        )}
      </View>

      {/* Controls */}
      <TouchableOpacity
        onPress={onPlayPause}
        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-2"
      >
        <Text className="text-white text-lg">
          {isPlaying ? '\u{23F8}' : '\u{25B6}'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-white/60 text-lg">{'\u{2715}'}</Text>
      </TouchableOpacity>

      {/* Progress bar */}
      <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <View className="h-full w-1/3 bg-accent" />
      </View>
    </View>
  );
};
