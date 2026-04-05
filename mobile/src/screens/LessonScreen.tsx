import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { coursesService } from '../services/courses.service';
import { Lesson } from '../types/course.types';
import { CoursesStackParamList } from '../navigation/types';

type LessonRoute = RouteProp<CoursesStackParamList, 'Lesson'>;
type LessonNav = NativeStackNavigationProp<CoursesStackParamList, 'Lesson'>;

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LessonScreen = () => {
  const navigation = useNavigation<LessonNav>();
  const route = useRoute<LessonRoute>();
  const { lessonId, courseId, enrollmentId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const totalDuration = lesson ? lesson.duration_minutes * 60 : 0;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const loadLesson = useCallback(async () => {
    try {
      const [lessonData, courseData] = await Promise.all([
        coursesService.getLessonById(lessonId),
        coursesService.getCourseById(courseId),
      ]);
      setLesson(lessonData);
      setAllLessons(courseData.lessons);
    } catch {
      Alert.alert('Error', 'Failed to load lesson.');
    } finally {
      setLoading(false);
    }
  }, [lessonId, courseId]);

  React.useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSkipForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(prev + 15, totalDuration));
  }, [totalDuration]);

  const handleSkipBack = useCallback(() => {
    setCurrentTime((prev) => Math.max(prev - 15, 0));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!lesson || !allLessons.length) return;

    try {
      const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
      const completedCount = currentIndex + 1;
      const totalCount = allLessons.length;
      const progressPct = Math.round((completedCount / totalCount) * 100);

      await coursesService.updateProgress(enrollmentId, {
        lessons_completed: completedCount,
        progress_percentage: progressPct,
        last_lesson_id: lesson.id,
        status: completedCount >= totalCount ? 'completed' : 'active',
      });

      Alert.alert(
        completedCount >= totalCount ? 'Course Completed!' : 'Lesson Complete!',
        completedCount >= totalCount
          ? 'Congratulations! You have completed this course.'
          : 'Great job! Moving to the next lesson.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (completedCount < totalCount) {
                handleNextLesson();
              } else {
                navigation.goBack();
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert('Error', 'Failed to update progress.');
    }
  }, [lesson, allLessons, enrollmentId, navigation]);

  const handleNextLesson = useCallback(() => {
    if (!lesson || !allLessons.length) return;

    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const nextLesson = allLessons[currentIndex + 1];

    if (nextLesson) {
      setLesson(nextLesson);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [lesson, allLessons]);

  const hasNextLesson = (() => {
    if (!lesson || !allLessons.length) return false;
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    return currentIndex < allLessons.length - 1;
  })();

  if (loading || !lesson) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Loading lesson...</Text>
      </SafeAreaView>
    );
  }

  const mediaIcon =
    lesson.lesson_type === 'video'
      ? '\u{1F3AC}'
      : lesson.lesson_type === 'audio'
        ? '\u{1F3B5}'
        : '\u{1F4C4}';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-3 pb-2 border-b border-border">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center mr-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-lg">{'\u2190'}</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-bold text-text-primary"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text className="text-xs text-text-secondary">
            Lesson {lesson.lesson_number}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Media placeholder */}
        <View className="mx-6 mt-4 h-56 bg-primary-dark rounded-card items-center justify-center">
          <Text className="text-5xl mb-2">{mediaIcon}</Text>
          <Text className="text-white/70 text-sm">
            {lesson.lesson_type === 'video'
              ? 'Video Player'
              : lesson.lesson_type === 'audio'
                ? 'Audio Player'
                : 'Reading Material'}
          </Text>
          <Text className="text-white/40 text-xs mt-1">
            Media playback requires native integration
          </Text>
        </View>

        {/* Progress bar */}
        <View className="mx-6 mt-4">
          <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-text-secondary">
              {formatTime(currentTime)}
            </Text>
            <Text className="text-xs text-text-secondary">
              {formatTime(totalDuration)}
            </Text>
          </View>
        </View>

        {/* Controls row */}
        <View className="flex-row items-center justify-center mx-6 mt-6 mb-6">
          {/* Playback speed */}
          <View className="relative">
            <TouchableOpacity
              className="bg-surface border border-border rounded-button px-3 py-2 mr-6"
              onPress={() => setSpeedMenuOpen((prev) => !prev)}
            >
              <Text className="text-sm font-semibold text-text-primary">
                {playbackSpeed}x
              </Text>
            </TouchableOpacity>
            {speedMenuOpen && (
              <View className="absolute top-12 left-0 bg-white border border-border rounded-card shadow-lg z-10 py-1">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    className={`px-4 py-2 ${
                      playbackSpeed === speed ? 'bg-primary/10' : ''
                    }`}
                    onPress={() => {
                      setPlaybackSpeed(speed);
                      setSpeedMenuOpen(false);
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        playbackSpeed === speed
                          ? 'text-primary font-bold'
                          : 'text-text-primary'
                      }`}
                    >
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Skip back */}
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center mr-4"
            onPress={handleSkipBack}
          >
            <Text className="text-base text-text-primary">{'\u23EA'}</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            className="w-16 h-16 rounded-full bg-primary items-center justify-center mx-2"
            onPress={handlePlayPause}
          >
            <Text className="text-2xl text-white">
              {isPlaying ? '\u23F8' : '\u25B6'}
            </Text>
          </TouchableOpacity>

          {/* Skip forward */}
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center ml-4"
            onPress={handleSkipForward}
          >
            <Text className="text-base text-text-primary">{'\u23E9'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson info */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-text-primary mb-2">
            {lesson.title}
          </Text>
          <View className="flex-row items-center mb-3">
            <Text className="text-xs text-text-secondary mr-3">
              {'\u23F1'} {lesson.duration_minutes} min
            </Text>
            <Text className="text-xs text-text-secondary capitalize">
              {lesson.lesson_type}
            </Text>
          </View>
          {lesson.description ? (
            <Text className="text-sm text-text-secondary leading-5">
              {lesson.description}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View className="mx-6">
          <TouchableOpacity
            className="bg-primary rounded-button py-3.5 items-center mb-3"
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              Mark as Complete
            </Text>
          </TouchableOpacity>

          {hasNextLesson && (
            <TouchableOpacity
              className="bg-accent/10 border border-accent rounded-button py-3.5 items-center"
              onPress={handleNextLesson}
              activeOpacity={0.8}
            >
              <Text className="text-accent font-bold text-base">
                Next Lesson {'\u2192'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LessonScreen;
