import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={s.container}>
      {/* Thumbnail */}
      <View style={s.thumbnailCircle}>
        <Text style={s.thumbnailIcon}>{'\u{1F3B5}'}</Text>
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
        {artist && (
          <Text style={s.artist} numberOfLines={1}>
            {artist}
          </Text>
        )}
      </View>

      {/* Controls */}
      <TouchableOpacity
        onPress={onPlayPause}
        style={s.playButton}
      >
        <Text style={s.playIcon}>
          {isPlaying ? '\u{23F8}' : '\u{25B6}'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={s.closeIcon}>{'\u{2715}'}</Text>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={s.progressFill} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4332',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D6A4F',
  },
  thumbnailCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  closeIcon: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    width: '33%',
    backgroundColor: '#40916C',
  },
});
