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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CourseCard } from '../components/course/CourseCard';
import { coursesService } from '../services/courses.service';
import { Course, CourseFilters } from '../types/course.types';
import { CoursesStackParamList } from '../navigation/types';

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
  <View className="bg-gray-200 rounded-card h-56 mx-6 mb-4 animate-pulse" />
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
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-serif font-bold text-primary">
          Courses
        </Text>
        <Text className="text-sm text-text-secondary mt-1">
          Explore meditation, yoga, and wellness programs
        </Text>
      </View>

      {/* Search bar */}
      <View className="px-6 mt-3">
        <View className="flex-row items-center bg-surface border border-border rounded-button px-4 py-2.5">
          <Text className="text-base mr-2 text-text-secondary">
            {'\u{1F50D}'}
          </Text>
          <TextInput
            className="flex-1 text-sm text-text-primary"
            placeholder="Search courses..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text className="text-text-secondary text-base">
                {'\u2715'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Difficulty filter pills */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {DIFFICULTY_FILTERS.map((level) => (
            <TouchableOpacity
              key={level}
              className={`mr-2 px-4 py-2 rounded-pill border ${
                selectedDifficulty === level
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-border'
              }`}
              onPress={() => setSelectedDifficulty(level)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedDifficulty === level
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category filter pills */}
      <View className="mt-3 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`mr-2 px-4 py-2 rounded-pill border ${
                selectedCategory === cat
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-border'
              }`}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}
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
      <View className="items-center justify-center py-16 px-6">
        <Text className="text-3xl mb-3">{'\u{1F4DA}'}</Text>
        <Text className="text-lg font-bold text-text-primary mb-1">
          No courses found
        </Text>
        <Text className="text-sm text-text-secondary text-center">
          Try adjusting your filters or search terms
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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
          ListFooterComponent={<View className="h-8" />}
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
        <View className="absolute bottom-4 left-0 right-0 items-center">
          <ActivityIndicator color="#1B4332" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CoursesMain;
