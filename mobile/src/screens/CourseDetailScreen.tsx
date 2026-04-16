/**
 * File: CourseDetailScreen.tsx
 *
 * Description: Detailed course view showing description, instructor info,
 * lesson list with progress tracking, and enrollment/continue actions.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonItem } from '../components/course/LessonItem';
import { coursesService } from '../services/courses.service';
import { Course, Lesson, Enrollment, CourseReview } from '../types/course.types';
import { CoursesStackParamList } from '../navigation/types';
import { colors } from '../utils/styles';

type DetailRoute = RouteProp<CoursesStackParamList, 'CourseDetail'>;
type DetailNav = NativeStackNavigationProp<CoursesStackParamList, 'CourseDetail'>;

type TabKey = 'overview' | 'curriculum' | 'reviews';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'reviews', label: 'Reviews' },
];

// Category-driven hero theme so the detail screen feels cohesive with the card
const CATEGORY_THEME: Record<string, { bg: string; accent: string; icon: string }> = {
  meditation: { bg: '#1B4332', accent: '#52B788', icon: '\u{1F9D8}' },
  yoga:       { bg: '#7F5AF0', accent: '#B8A1FF', icon: '\u{1F9D8}\u200D\u2640\uFE0F' },
  pranayama:  { bg: '#2D6A4F', accent: '#95D5B2', icon: '\u{1F4A8}' },
  mindfulness:{ bg: '#264653', accent: '#2A9D8F', icon: '\u{1F9E0}' },
  sleep:      { bg: '#1D3557', accent: '#8ECAE6', icon: '\u{1F319}' },
  stress:     { bg: '#9D4EDD', accent: '#C77DFF', icon: '\u{1F338}' },
  default:    { bg: '#1B4332', accent: '#40916C', icon: '\u{1F54A}' },
};
const getHeroTheme = (cat: string | null | undefined) =>
  CATEGORY_THEME[(cat || '').toLowerCase()] || CATEGORY_THEME.default;

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
    <View style={s.starRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Text key={`star-${i}`} style={s.starFilled}>
              {'\u2605'}
            </Text>
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <Text key={`star-${i}`} style={s.starFilled}>
              {'\u2605'}
            </Text>
          );
        }
        return (
          <Text key={`star-${i}`} style={s.starEmpty}>
            {'\u2605'}
          </Text>
        );
      })}
    </View>
  );
};

const ReviewCard = ({ review }: { review: CourseReview }) => (
  <View style={s.reviewCard}>
    <View style={s.reviewHeader}>
      <View style={s.reviewUserRow}>
        <View style={s.reviewAvatar}>
          <Text style={s.reviewAvatarText}>
            {(review.user_name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={s.reviewUserName}>
          {review.user_name || 'Student'}
        </Text>
      </View>
      <StarRating rating={review.rating} />
    </View>
    <Text style={s.reviewText}>{review.review_text}</Text>
    <Text style={s.reviewDate}>
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
      <SafeAreaView style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1B4332" />
        <Text style={s.loadingText}>Loading course...</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={s.errorContainer}>
        <Text style={s.errorIcon}>{'\u{26A0}'}</Text>
        <Text style={s.errorTitle}>
          Course not found
        </Text>
        <TouchableOpacity
          style={s.goBackBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.goBackBtnText}>Go Back</Text>
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
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
        {/* Header / back */}
        <View style={s.navRow}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.backBtnIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text
            style={s.navTitle}
            numberOfLines={1}
          >
            Course Details
          </Text>
        </View>

        {/* Hero \u2014 category-themed artwork */}
        {(() => {
          const theme = getHeroTheme(course.category);
          return (
            <View style={[s.heroWrap, { backgroundColor: theme.bg }]}>
              <View style={[s.heroDecorLarge, { backgroundColor: theme.accent }]} />
              <View style={[s.heroDecorSmall, { backgroundColor: theme.accent }]} />
              <Text style={s.heroIcon}>{theme.icon}</Text>
              <Text style={s.heroCategory}>
                {(course.category || 'course').toUpperCase()}
              </Text>
              <TouchableOpacity
                style={s.playBtn}
                onPress={() =>
                  Alert.alert(
                    'Preview',
                    'Course preview will play once media streaming is configured.',
                  )
                }
              >
                <Text style={s.playBtnIcon}>{'\u25B6'}</Text>
              </TouchableOpacity>
              {course.is_premium && (
                <View style={s.premiumBadge}>
                  <Text style={s.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Title & meta */}
        <View style={s.metaSection}>
          <Text style={s.courseTitle}>
            {course.title}
          </Text>
          <Text style={s.courseInstructor}>
            by {course.instructor_name}
          </Text>

          <View style={s.metaRow}>
            <View style={s.difficultyBadge}>
              <Text style={s.difficultyText}>
                {course.difficulty_level}
              </Text>
            </View>

            {reviews.length > 0 && (
              <View style={s.ratingRow}>
                <StarRating rating={avgRating} />
                <Text style={s.ratingCount}>
                  ({reviews.length})
                </Text>
              </View>
            )}

            <Text style={s.metaText}>
              {'\u23F1'} {formatDuration(course.estimated_duration_minutes)}
            </Text>

            <Text style={s.metaText}>
              {course.total_lessons} lessons
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                s.tab,
                activeTab === tab.key ? s.tabActive : s.tabInactive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  s.tabText,
                  activeTab === tab.key ? s.tabTextActive : s.tabTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={s.tabContent}>
          {activeTab === 'overview' && (
            <View style={s.overviewPad}>
              <Text style={s.descriptionText}>
                {course.description}
              </Text>

              <Text style={s.learnTitle}>
                What you'll learn
              </Text>
              {(course.tags || []).map((tag, index) => (
                <View
                  key={`learn-${index}`}
                  style={s.learnRow}
                >
                  <Text style={s.learnCheck}>
                    {'\u2713'}
                  </Text>
                  <Text style={s.learnText}>
                    {tag}
                  </Text>
                </View>
              ))}

              {course.tags.length === 0 && (
                <View>
                  <View style={s.learnRow}>
                    <Text style={s.learnCheck}>
                      {'\u2713'}
                    </Text>
                    <Text style={s.learnText}>
                      Core techniques of {course.category.toLowerCase()}
                    </Text>
                  </View>
                  <View style={s.learnRow}>
                    <Text style={s.learnCheck}>
                      {'\u2713'}
                    </Text>
                    <Text style={s.learnText}>
                      Build a consistent daily practice
                    </Text>
                  </View>
                  <View style={s.learnRow}>
                    <Text style={s.learnCheck}>
                      {'\u2713'}
                    </Text>
                    <Text style={s.learnText}>
                      Progress from {course.difficulty_level} to the next level
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'curriculum' && (
            <View>
              <Text style={s.curriculumSummary}>
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
                <View style={s.emptyLessons}>
                  <Text style={s.emptyLessonsText}>
                    No lessons published yet
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {reviews.length > 0 && (
                <View style={s.reviewSummary}>
                  <View style={s.reviewSummaryRow}>
                    <Text style={s.reviewAvgRating}>
                      {avgRating.toFixed(1)}
                    </Text>
                    <View>
                      <StarRating rating={avgRating} />
                      <Text style={s.reviewTotalCount}>
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
                <View style={s.emptyReviews}>
                  <Text style={s.emptyReviewsText}>
                    No reviews yet. Be the first to review!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={s.footer}>
        <View style={s.footerInner}>
          <View>
            <Text style={s.priceText}>
              {formatPrice(course.price_cents)}
            </Text>
            {course.is_premium && course.price_cents > 0 && (
              <Text style={s.priceSubtext}>
                One-time purchase
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[s.enrollBtn, enrolling ? s.enrollBtnDisabled : s.enrollBtnActive]}
            onPress={isEnrolled ? () => setActiveTab('curriculum') : handleEnroll}
            disabled={enrolling}
            activeOpacity={0.8}
          >
            {enrolling ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.enrollBtnText}>
                {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  goBackBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  navRow: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backBtnIcon: {
    fontSize: 18,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  heroWrap: {
    marginHorizontal: 24,
    height: 192,
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroIcon: {
    fontSize: 64,
  },
  heroCategory: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 8,
  },
  heroDecorLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
    top: -40,
    right: -40,
  },
  heroDecorSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.22,
    bottom: -20,
    left: -20,
  },
  playBtn: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabInactive: {
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
  tabContent: {
    marginTop: 16,
    paddingBottom: 112,
  },
  overviewPad: {
    paddingHorizontal: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  learnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  learnCheck: {
    color: colors.accent,
    marginRight: 8,
    fontSize: 14,
  },
  learnText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  curriculumSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyLessonsText: {
    color: colors.textSecondary,
  },
  reviewSummary: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  reviewSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvgRating: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 8,
  },
  reviewTotalCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyReviewsText: {
    color: colors.textSecondary,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starFilled: {
    fontSize: 14,
    color: '#F59E0B',
  },
  starEmpty: {
    fontSize: 14,
    color: colors.gray300,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  priceSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  enrollBtn: {
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  enrollBtnActive: {
    backgroundColor: colors.primary,
  },
  enrollBtnDisabled: {
    backgroundColor: colors.gray400,
  },
  enrollBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CourseDetailScreen;
