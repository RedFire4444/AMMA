import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonItem } from '../components/course/LessonItem';
import { coursesService } from '../services/courses.service';
import { Course, Lesson, Enrollment, CourseReview } from '../types/course.types';
import { CoursesStackParamList } from '../navigation/types';

type DetailRoute = RouteProp<CoursesStackParamList, 'CourseDetail'>;
type DetailNav = NativeStackNavigationProp<CoursesStackParamList, 'CourseDetail'>;

type TabKey = 'overview' | 'curriculum' | 'reviews';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'reviews', label: 'Reviews' },
];

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatPrice = (cents: number): string => {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
};

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Text key={`star-${i}`} className="text-sm text-amber-500">
              {'\u2605'}
            </Text>
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <Text key={`star-${i}`} className="text-sm text-amber-500">
              {'\u2605'}
            </Text>
          );
        }
        return (
          <Text key={`star-${i}`} className="text-sm text-gray-300">
            {'\u2605'}
          </Text>
        );
      })}
    </View>
  );
};

const ReviewCard = ({ review }: { review: CourseReview }) => (
  <View className="bg-surface border border-border rounded-card p-4 mb-3 mx-6">
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
          <Text className="text-xs font-bold text-primary">
            {(review.user_name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-text-primary">
          {review.user_name || 'Student'}
        </Text>
      </View>
      <StarRating rating={review.rating} />
    </View>
    <Text className="text-sm text-text-secondary">{review.review_text}</Text>
    <Text className="text-xs text-gray-400 mt-2">
      {new Date(review.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </Text>
  </View>
);

const CourseDetailScreen = () => {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const loadCourseData = useCallback(async () => {
    try {
      const [courseData, enrollmentData, reviewsData] = await Promise.all([
        coursesService.getCourseById(courseId),
        coursesService.getEnrollment(courseId),
        coursesService.getReviews(courseId),
      ]);
      setCourse(courseData.course);
      setLessons(courseData.lessons);
      setEnrollment(enrollmentData);
      setReviews(reviewsData);
    } catch {
      Alert.alert('Error', 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const handleEnroll = useCallback(async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const newEnrollment = await coursesService.enrollInCourse(course.id);
      setEnrollment(newEnrollment);
      Alert.alert('Enrolled!', 'You have been enrolled in this course.');
    } catch {
      Alert.alert('Error', 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  }, [course]);

  const handleLessonPress = useCallback(
    (lessonId: string) => {
      if (!enrollment) return;
      navigation.navigate('Lesson', {
        lessonId,
        courseId,
        enrollmentId: enrollment.id,
      });
    },
    [navigation, courseId, enrollment],
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#1B4332" />
        <Text className="text-text-secondary mt-3">Loading course...</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-3xl mb-2">{'\u{26A0}'}</Text>
        <Text className="text-lg font-bold text-text-primary">
          Course not found
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary rounded-button px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isEnrolled = enrollment !== null;
  const completedLessonIds = new Set<string>();
  // Mark lessons as completed based on enrollment progress
  if (enrollment) {
    for (let i = 0; i < enrollment.lessons_completed; i++) {
      if (lessons[i]) {
        completedLessonIds.add(lessons[i].id);
      }
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header / back */}
        <View className="px-6 pt-3 pb-2 flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-lg">{'\u2190'}</Text>
          </TouchableOpacity>
          <Text
            className="text-lg font-bold text-text-primary flex-1"
            numberOfLines={1}
          >
            Course Details
          </Text>
        </View>

        {/* Hero image placeholder */}
        <View className="mx-6 h-48 bg-primary/10 rounded-card items-center justify-center mb-4">
          <Text className="text-5xl">{'\u{1F3AC}'}</Text>
          <TouchableOpacity className="absolute bg-white/90 rounded-full w-14 h-14 items-center justify-center">
            <Text className="text-2xl text-primary">{'\u25B6'}</Text>
          </TouchableOpacity>
          {course.is_premium && (
            <View className="absolute top-3 right-3 bg-amber-500 rounded-pill px-2.5 py-1">
              <Text className="text-white text-xs font-bold">PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Title & meta */}
        <View className="px-6 mb-4">
          <Text className="text-xl font-serif font-bold text-text-primary mb-1">
            {course.title}
          </Text>
          <Text className="text-sm text-text-secondary mb-3">
            by {course.instructor_name}
          </Text>

          <View className="flex-row items-center flex-wrap">
            <View className="bg-green-100 rounded-pill px-2 py-0.5 mr-2 mb-1">
              <Text className="text-xs font-semibold text-green-800 capitalize">
                {course.difficulty_level}
              </Text>
            </View>

            {reviews.length > 0 && (
              <View className="flex-row items-center mr-3 mb-1">
                <StarRating rating={avgRating} />
                <Text className="text-xs text-text-secondary ml-1">
                  ({reviews.length})
                </Text>
              </View>
            )}

            <Text className="text-xs text-text-secondary mr-3 mb-1">
              {'\u23F1'} {formatDuration(course.estimated_duration_minutes)}
            </Text>

            <Text className="text-xs text-text-secondary mb-1">
              {course.total_lessons} lessons
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-border mx-6">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key
                  ? 'border-primary'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View className="mt-4 pb-28">
          {activeTab === 'overview' && (
            <View className="px-6">
              <Text className="text-base text-text-primary leading-6 mb-4">
                {course.description}
              </Text>

              <Text className="text-base font-bold text-text-primary mb-3">
                What you'll learn
              </Text>
              {(course.tags || []).map((tag, index) => (
                <View
                  key={`learn-${index}`}
                  className="flex-row items-start mb-2"
                >
                  <Text className="text-accent mr-2 text-sm">
                    {'\u2713'}
                  </Text>
                  <Text className="text-sm text-text-secondary flex-1">
                    {tag}
                  </Text>
                </View>
              ))}

              {course.tags.length === 0 && (
                <View>
                  <View className="flex-row items-start mb-2">
                    <Text className="text-accent mr-2 text-sm">
                      {'\u2713'}
                    </Text>
                    <Text className="text-sm text-text-secondary flex-1">
                      Core techniques of {course.category.toLowerCase()}
                    </Text>
                  </View>
                  <View className="flex-row items-start mb-2">
                    <Text className="text-accent mr-2 text-sm">
                      {'\u2713'}
                    </Text>
                    <Text className="text-sm text-text-secondary flex-1">
                      Build a consistent daily practice
                    </Text>
                  </View>
                  <View className="flex-row items-start mb-2">
                    <Text className="text-accent mr-2 text-sm">
                      {'\u2713'}
                    </Text>
                    <Text className="text-sm text-text-secondary flex-1">
                      Progress from {course.difficulty_level} to the next level
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'curriculum' && (
            <View>
              <Text className="text-sm text-text-secondary px-6 mb-3">
                {lessons.length} lessons {'\u00B7'}{' '}
                {formatDuration(course.estimated_duration_minutes)} total
              </Text>
              {lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isEnrolled={isEnrolled}
                  isCompleted={completedLessonIds.has(lesson.id)}
                  onPress={handleLessonPress}
                />
              ))}
              {lessons.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-text-secondary">
                    No lessons published yet
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {reviews.length > 0 && (
                <View className="px-6 mb-4">
                  <View className="flex-row items-center">
                    <Text className="text-3xl font-bold text-text-primary mr-2">
                      {avgRating.toFixed(1)}
                    </Text>
                    <View>
                      <StarRating rating={avgRating} />
                      <Text className="text-xs text-text-secondary mt-0.5">
                        {reviews.length} reviews
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {reviews.length === 0 && (
                <View className="items-center py-8 px-6">
                  <Text className="text-text-secondary">
                    No reviews yet. Be the first to review!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-text-primary">
              {formatPrice(course.price_cents)}
            </Text>
            {course.is_premium && course.price_cents > 0 && (
              <Text className="text-xs text-text-secondary">
                One-time purchase
              </Text>
            )}
          </View>
          <TouchableOpacity
            className={`rounded-button px-8 py-3.5 ${
              enrolling ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={isEnrolled ? () => setActiveTab('curriculum') : handleEnroll}
            disabled={enrolling}
            activeOpacity={0.8}
          >
            {enrolling ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CourseDetailScreen;
