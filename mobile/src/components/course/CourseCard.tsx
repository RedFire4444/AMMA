import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Course } from '../../types/course.types';

interface CourseCardProps {
  course: Course;
  onPress: (courseId: string) => void;
}

const DIFFICULTY_BG: Record<string, string> = {
  beginner: '#DCFCE7',
  intermediate: '#FEF9C3',
  advanced: '#FEE2E2',
};

const DIFFICULTY_TEXT: Record<string, string> = {
  beginner: '#166534',
  intermediate: '#854D0E',
  advanced: '#991B1B',
};

// Category-driven visual theme so cards feel distinct even without real images
const CATEGORY_THEME: Record<string, { bg: string; accent: string; icon: string }> = {
  meditation: { bg: '#1B4332', accent: '#52B788', icon: '\u{1F9D8}' },
  yoga:       { bg: '#7F5AF0', accent: '#B8A1FF', icon: '\u{1F9D8}\u200D\u2640\uFE0F' },
  pranayama:  { bg: '#2D6A4F', accent: '#95D5B2', icon: '\u{1F4A8}' },
  mindfulness:{ bg: '#264653', accent: '#2A9D8F', icon: '\u{1F9E0}' },
  sleep:      { bg: '#1D3557', accent: '#8ECAE6', icon: '\u{1F319}' },
  stress:     { bg: '#9D4EDD', accent: '#C77DFF', icon: '\u{1F338}' },
  default:    { bg: '#1B4332', accent: '#40916C', icon: '\u{1F54A}' },
};

const getCategoryTheme = (category: string | null | undefined) =>
  CATEGORY_THEME[(category || '').toLowerCase()] || CATEGORY_THEME.default;

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const CourseCard = ({ course, onPress }: CourseCardProps) => {
  const diffBg = DIFFICULTY_BG[course.difficulty_level] || '#F3F4F6';
  const diffText = DIFFICULTY_TEXT[course.difficulty_level] || '#1F2937';
  const theme = getCategoryTheme(course.category);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress(course.id)}
      activeOpacity={0.7}
    >
      {/* Thumbnail \u2014 real image if provided, otherwise category-themed artwork */}
      {course.thumbnail_url ? (
        <View style={s.thumbnail}>
          <Image
            source={{ uri: course.thumbnail_url }}
            style={s.thumbnailImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={[s.thumbnail, { backgroundColor: theme.bg }]}>
          {/* decorative accent circles */}
          <View style={[s.decorCircleLarge, { backgroundColor: theme.accent }]} />
          <View style={[s.decorCircleSmall, { backgroundColor: theme.accent }]} />
          <Text style={s.thumbnailEmoji}>{theme.icon}</Text>
          <Text style={s.thumbnailCategory}>{(course.category || '').toUpperCase()}</Text>
        </View>
      )}
      {course.is_premium ? (
        <View style={[s.badge, s.badgePremium]}>
          <Text style={s.badgeText}>PREMIUM</Text>
        </View>
      ) : (
        <View style={[s.badge, s.badgeFree]}>
          <Text style={s.badgeText}>FREE</Text>
        </View>
      )}
      <View style={s.durationBadge}>
        <Text style={s.durationText}>
          {formatDuration(course.estimated_duration_minutes)}
        </Text>
      </View>

      {/* Card body */}
      <View style={s.body}>
        <View style={s.metaRow}>
          <View style={[s.difficultyBadge, { backgroundColor: diffBg }]}>
            <Text
              style={[s.difficultyText, { color: diffText }]}
            >
              {course.difficulty_level}
            </Text>
          </View>
          <Text style={s.lessonCount}>
            {course.total_lessons} lessons
          </Text>
        </View>

        <Text style={s.title} numberOfLines={2}>
          {course.title}
        </Text>

        <Text style={s.instructor} numberOfLines={1}>
          {course.instructor_name}
        </Text>

        {course.short_description ? (
          <Text style={s.description} numberOfLines={2}>
            {course.short_description}
          </Text>
        ) : null}

        <View style={s.footer}>
          <View style={s.enrollRow}>
            <Text style={s.starIcon}>
              {'\u2B50'}
            </Text>
            <Text style={s.enrollText}>
              {course.enrollment_count} enrolled
            </Text>
          </View>
          <Text style={s.category}>
            {course.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  thumbnail: {
    height: 160,
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailEmoji: {
    fontSize: 44,
  },
  thumbnailCategory: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.15,
    top: -20,
    right: -30,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
    bottom: -10,
    left: -10,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePremium: {
    backgroundColor: '#F59E0B',
  },
  badgeFree: {
    backgroundColor: '#16A34A',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  body: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lessonCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    color: '#F59E0B',
    marginRight: 4,
  },
  enrollText: {
    fontSize: 12,
    color: '#6B7280',
  },
  category: {
    fontSize: 12,
    color: '#40916C',
    fontWeight: '600',
  },
});
