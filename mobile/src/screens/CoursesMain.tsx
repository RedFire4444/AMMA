/**
 * File: CoursesMain.tsx
 *
 * Description: Courses listing screen with search, category filtering,
 * difficulty badges, and navigation to individual course details.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CourseCard } from '../components/course/CourseCard';
import { coursesService } from '../services/courses.service';
import { Course, CourseFilters } from '../types/course.types';
import { CoursesStackParamList } from '../navigation/types';
import { colors } from '../utils/styles';

type CoursesNav = NativeStackNavigationProp<CoursesStackParamList, 'CoursesMain'>;

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

const CATEGORIES = [
  'All',
  'Meditation',
  'Yoga',
  'Pranayama',
  'Mindfulness',
  'Sleep',
  'Stress',
] as const;

// Mock courses as fallback when backend isn't reachable — prevents empty state crash
const MOCK_COURSES: Course[] = [
  {
    id: 'mock-1',
    title: 'Foundations of Meditation',
    description: 'Start your meditation journey with daily practices.',
    instructor_name: 'Swami Prakash',
    thumbnail_url: null,
    difficulty_level: 'beginner',
    category: 'meditation',
    is_premium: false,
    price_cents: 0,
    currency: 'INR',
    status: 'published',
    enrollment_count: 1250,
    rating: 4.8,
    total_lessons: 12,
    estimated_duration_minutes: 180,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
  {
    id: 'mock-2',
    title: 'Pranayama: The Art of Breath',
    description: 'Master breathing techniques for inner peace.',
    instructor_name: 'Dr. Meera Iyer',
    thumbnail_url: null,
    difficulty_level: 'intermediate',
    category: 'pranayama',
    is_premium: false,
    price_cents: 0,
    currency: 'INR',
    status: 'published',
    enrollment_count: 890,
    rating: 4.7,
    total_lessons: 8,
    estimated_duration_minutes: 120,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
  {
    id: 'mock-3',
    title: 'Deep Sleep & Yoga Nidra',
    description: 'Restorative yoga practices for better sleep.',
    instructor_name: 'Ananya Sharma',
    thumbnail_url: null,
    difficulty_level: 'beginner',
    category: 'sleep',
    is_premium: true,
    price_cents: 19900,
    currency: 'INR',
    status: 'published',
    enrollment_count: 543,
    rating: 4.9,
    total_lessons: 10,
    estimated_duration_minutes: 150,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
  {
    id: 'mock-4',
    title: 'Vedic Chanting for Beginners',
    description: 'Learn sacred mantras and their meanings.',
    instructor_name: 'Pandit Raghavendra',
    thumbnail_url: null,
    difficulty_level: 'beginner',
    category: 'meditation',
    is_premium: true,
    price_cents: 19900,
    currency: 'INR',
    status: 'published',
    enrollment_count: 412,
    rating: 4.6,
    total_lessons: 15,
    estimated_duration_minutes: 225,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
  {
    id: 'mock-5',
    title: 'Advanced Vipassana',
    description: 'Deep insight meditation for experienced practitioners.',
    instructor_name: 'Guru Ananda',
    thumbnail_url: null,
    difficulty_level: 'advanced',
    category: 'mindfulness',
    is_premium: true,
    price_cents: 19900,
    currency: 'INR',
    status: 'published',
    enrollment_count: 278,
    rating: 4.9,
    total_lessons: 20,
    estimated_duration_minutes: 600,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
  {
    id: 'mock-6',
    title: 'Stress Relief Yoga',
    description: 'Gentle yoga flows to release tension.',
    instructor_name: 'Dr. Priya Sharma',
    thumbnail_url: null,
    difficulty_level: 'beginner',
    category: 'yoga',
    is_premium: false,
    price_cents: 0,
    currency: 'INR',
    status: 'published',
    enrollment_count: 1820,
    rating: 4.7,
    total_lessons: 8,
    estimated_duration_minutes: 135,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Course,
];

const CoursesMain = () => {
  const navigation = useNavigation<CoursesNav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Client-side filtering from a stable base dataset — avoids keyboard-drop refetches on every keystroke
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const loadCourses = useCallback(async () => {
    try {
      const filters: CourseFilters = {};
      const data = await coursesService.getCourses(filters);
      if (data && data.length > 0) {
        setAllCourses(data);
      } else {
        setAllCourses(MOCK_COURSES);
      }
    } catch (err) {
      console.warn('[Courses] Failed to load from backend, using mock data:', err);
      setAllCourses(MOCK_COURSES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Only load once on mount — client-side filtering handles the rest
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Apply filters client-side whenever search/filter state changes
  useEffect(() => {
    const filtered = allCourses.filter((course) => {
      if (selectedDifficulty !== 'All' && course.difficulty_level !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'All' && course.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const title = (course.title || '').toLowerCase();
        const desc = (course.description || '').toLowerCase();
        const instructor = (course.instructor_name || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !instructor.includes(q)) {
          return false;
        }
      }
      return true;
    });
    setCourses(filtered);
  }, [allCourses, selectedDifficulty, selectedCategory, searchText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // No refetch — filtering is client-side, keyboard stays up
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('CourseDetail', { courseId });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      {/* Header stays mounted — keyboard never drops */}
      <View>
        {/* Title */}
        <View style={s.titleWrap}>
          <Text style={s.pageTitle}>Courses</Text>
          <Text style={s.pageSubtitle}>
            Explore meditation, yoga, and wellness programs
          </Text>
        </View>

        {/* Search bar */}
        <View style={s.searchWrap}>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search courses..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
              blurOnSubmit={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text style={s.searchClear}>{'\u2715'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Difficulty filter pills */}
        <View style={s.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {DIFFICULTY_FILTERS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  s.filterPill,
                  selectedDifficulty === level ? s.filterPillActive : s.filterPillInactive,
                ]}
                onPress={() => setSelectedDifficulty(level)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.filterPillText,
                    selectedDifficulty === level ? s.filterPillTextActive : s.filterPillTextInactive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category filter pills */}
        <View style={s.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  s.filterPill,
                  selectedCategory === cat ? s.catPillActive : s.filterPillInactive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.catPillText,
                    selectedCategory === cat ? s.filterPillTextActive : s.filterPillTextInactive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Courses List */}
      {loading && courses.length === 0 ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading courses...</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={handleCoursePress} />
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>{'\u{1F4DA}'}</Text>
              <Text style={s.emptyTitle}>No courses found</Text>
              <Text style={s.emptyDesc}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          }
          ListFooterComponent={<View style={s.footerSpacer} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchWrap: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  searchClear: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  filterSection: {
    marginTop: 16,
  },
  categorySection: {
    marginTop: 12,
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    paddingRight: 48,
  },
  filterPill: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterPillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  catPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: colors.white,
  },
  filterPillTextInactive: {
    color: colors.textSecondary,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 30,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerSpacer: {
    height: 32,
  },
});

export default CoursesMain;
