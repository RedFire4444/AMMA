import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Course } from '../../types/course.types';

interface CourseCardProps {
  course: Course;
  onPress: (courseId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const CourseCard = ({ course, onPress }: CourseCardProps) => {
  const difficultyStyle =
    DIFFICULTY_COLORS[course.difficulty_level] ||
    'bg-gray-100 text-gray-800';
  const bgClass = difficultyStyle.split(' ')[0];
  const textClass = difficultyStyle.split(' ')[1];

  return (
    <TouchableOpacity
      className="bg-surface rounded-card border border-border overflow-hidden mb-4 mx-6"
      onPress={() => onPress(course.id)}
      activeOpacity={0.7}
    >
      {/* Thumbnail placeholder */}
      <View className="h-40 bg-primary/10 items-center justify-center">
        <Text className="text-4xl">{'\u{1F9D8}'}</Text>
        {course.is_premium && (
          <View className="absolute top-3 right-3 bg-amber-500 rounded-pill px-2.5 py-1">
            <Text className="text-white text-xs font-bold">PREMIUM</Text>
          </View>
        )}
        {!course.is_premium && (
          <View className="absolute top-3 right-3 bg-green-600 rounded-pill px-2.5 py-1">
            <Text className="text-white text-xs font-bold">FREE</Text>
          </View>
        )}
        <View className="absolute bottom-2 right-2 bg-black/60 rounded-pill px-2 py-0.5">
          <Text className="text-white text-xs">
            {formatDuration(course.estimated_duration_minutes)}
          </Text>
        </View>
      </View>

      {/* Card body */}
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className={`${bgClass} rounded-pill px-2 py-0.5 mr-2`}>
            <Text className={`text-xs font-semibold capitalize ${textClass}`}>
              {course.difficulty_level}
            </Text>
          </View>
          <Text className="text-xs text-text-secondary">
            {course.total_lessons} lessons
          </Text>
        </View>

        <Text
          className="text-base font-bold text-text-primary mb-1"
          numberOfLines={2}
        >
          {course.title}
        </Text>

        <Text className="text-sm text-text-secondary mb-2" numberOfLines={1}>
          {course.instructor_name}
        </Text>

        {course.short_description ? (
          <Text
            className="text-xs text-text-secondary mb-2"
            numberOfLines={2}
          >
            {course.short_description}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-xs text-amber-500 mr-1">
              {'\u2B50'}
            </Text>
            <Text className="text-xs text-text-secondary">
              {course.enrollment_count} enrolled
            </Text>
          </View>
          <Text className="text-xs text-accent font-semibold">
            {course.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
