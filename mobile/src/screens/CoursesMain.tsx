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

const SkeletonCard = () => (
  <View style={s.skeletonCard} />
);

const CoursesMain = () => {
  const navigation = useNavigation<CoursesNav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildFilters = useCallback((): CourseFilters => {
    const filters: CourseFilters = {};
    if (selectedDifficulty !== 'All') {
      filters.difficulty_level = selectedDifficulty.toLowerCase() as CourseFilters['difficulty_level'];
    }
    if (selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    if (searchText.trim()) {
      filters.search = searchText.trim();
    }
    return filters;
  }, [selectedDifficulty, selectedCategory, searchText]);

  const loadCourses = useCallback(async () => {
    try {
      const filters = buildFilters();
      const data = await coursesService.getCourses(filters);
      setCourses(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildFilters]);

  useEffect(() => {
    setLoading(true);
    loadCourses();
  }, [loadCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setLoading(true);
        loadCourses();
      }, 500);
    },
    [loadCourses],
  );

  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('CourseDetail', { courseId });
    },
    [navigation],
  );

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View style={s.titleWrap}>
        <Text style={s.pageTitle}>
          Courses
        </Text>
        <Text style={s.pageSubtitle}>
          Explore meditation, yoga, and wellness programs
        </Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>
            {'\u{1F50D}'}
          </Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={s.searchClear}>
                {'\u2715'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Difficulty filter pills */}
      <View style={s.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
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
          contentContainerStyle={{ paddingHorizontal: 24 }}
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
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyIcon}>{'\u{1F4DA}'}</Text>
        <Text style={s.emptyTitle}>
          No courses found
        </Text>
        <Text style={s.emptyDesc}>
          Try adjusting your filters or search terms
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      {loading && courses.length === 0 ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <SkeletonCard />}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={handleCoursePress} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={<View style={s.footerSpacer} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1B4332"
            />
          }
        />
      )}
      {loading && courses.length > 0 && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator color="#1B4332" />
        </View>
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
    fontFamily: 'PlayfairDisplay',
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
  loadingOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skeletonCard: {
    backgroundColor: colors.gray200,
    borderRadius: 12,
    height: 224,
    marginHorizontal: 24,
    marginBottom: 16,
  },
});

export default CoursesMain;
