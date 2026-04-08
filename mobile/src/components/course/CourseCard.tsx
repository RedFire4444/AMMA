import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const CourseCard = ({ course, onPress }: CourseCardProps) => {
  const diffBg = DIFFICULTY_BG[course.difficulty_level] || '#F3F4F6';
  const diffText = DIFFICULTY_TEXT[course.difficulty_level] || '#1F2937';

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress(course.id)}
      activeOpacity={0.7}
    >
      {/* Thumbnail placeholder */}
      <View style={s.thumbnail}>
        <Text style={s.thumbnailEmoji}>{'\u{1F9D8}'}</Text>
        {course.is_premium && (
          <View style={[s.badge, s.badgePremium]}>
            <Text style={s.badgeText}>PREMIUM</Text>
          </View>
        )}
        {!course.is_premium && (
          <View style={[s.badge, s.badgeFree]}>
            <Text style={s.badgeText}>FREE</Text>
          </View>
        )}
        <View style={s.durationBadge}>
          <Text style={s.durationText}>
            {formatDuration(course.estimated_duration_minutes)}
          </Text>
        </View>
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
  },
  thumbnailEmoji: {
    fontSize: 32,
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
