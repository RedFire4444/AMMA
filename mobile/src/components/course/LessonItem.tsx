import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lesson } from '../../types/course.types';

interface LessonItemProps {
  lesson: Lesson;
  isEnrolled: boolean;
  isCompleted: boolean;
  onPress: (lessonId: string) => void;
}

const LESSON_TYPE_ICONS: Record<string, string> = {
  video: '\u{1F3AC}',
  audio: '\u{1F3B5}',
  text: '\u{1F4C4}',
  exercise: '\u{1F3CB}',
};

export const LessonItem = ({
  lesson,
  isEnrolled,
  isCompleted,
  onPress,
}: LessonItemProps) => {
  const icon = LESSON_TYPE_ICONS[lesson.lesson_type] || '\u{1F4C4}';
  const isLocked = !isEnrolled && !lesson.is_preview;

  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-3 border-b border-border ${
        isLocked ? 'opacity-50' : ''
      }`}
      onPress={() => {
        if (!isLocked) {
          onPress(lesson.id);
        }
      }}
      activeOpacity={isLocked ? 1 : 0.7}
      disabled={isLocked}
    >
      {/* Lesson number */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
          isCompleted ? 'bg-green-600' : 'bg-primary/10'
        }`}
      >
        {isCompleted ? (
          <Text className="text-white text-xs font-bold">{'\u2713'}</Text>
        ) : (
          <Text className="text-primary text-xs font-bold">
            {lesson.lesson_number}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 mr-3">
        <View className="flex-row items-center mb-0.5">
          <Text className="text-sm mr-1">{icon}</Text>
          <Text
            className="text-sm font-semibold text-text-primary flex-1"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
        </View>
        <Text className="text-xs text-text-secondary">
          {lesson.duration_minutes} min {'\u00B7'}{' '}
          {lesson.lesson_type.charAt(0).toUpperCase() +
            lesson.lesson_type.slice(1)}
          {lesson.is_preview ? ' \u00B7 Preview' : ''}
        </Text>
      </View>

      {/* Status icon */}
      {isLocked ? (
        <Text className="text-base text-gray-400">{'\u{1F512}'}</Text>
      ) : (
        <Text className="text-base text-accent">{'\u{25B6}'}</Text>
      )}
    </TouchableOpacity>
  );
};
