/**
 * File: CoursesMain.tsx
 *
 * Description: Courses screen with an active meditation course link and several
 * beautiful dummy placeholders for future meditation courses.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useCallback } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface CourseItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url?: string;
  actionText: string;
  isDummy?: boolean;
}

const COURSES_DATA: CourseItem[] = [
  {
    id: '1',
    title: 'Meditation Course',
    description: "Learn Amma's meditation practice and course guidance.",
    thumbnail: 'https://www.amritapuri.org/images/2020/02/19yatra-28-1200x462.jpg',
    url: 'https://na.amma.org/meeting-amma/guides/meditation-course',
    actionText: 'Open course',
  },
  {
    id: '2',
    title: 'Integrated Amrita Meditation (IAM)',
    description: 'A powerful combination of yoga, breathing exercises, and meditation for holistic stress management.',
    thumbnail: 'https://i.ytimg.com/vi/3DIWMA9OVs0/hqdefault.jpg',
    url: 'https://na.amma.org/meeting-amma/guides/meditation-course',
    actionText: 'Coming Soon',
    isDummy: true,
  },
  {
    id: '3',
    title: 'Amrita Yoga Foundations',
    description: "Explore physical yoga postures integrated with Amma's spiritual teachings to harmonize mind, body, and breath.",
    thumbnail: 'https://i.ytimg.com/vi/B_iEiNyr88U/hqdefault.jpg',
    url: 'https://na.amma.org/meeting-amma/guides/meditation-course',
    actionText: 'Coming Soon',
    isDummy: true,
  },
  {
    id: '4',
    title: 'Chantings & Bhajans Practice',
    description: 'Master spiritual chants and traditional bhajans to evoke devotion, peace, and inner vibration alignment.',
    thumbnail: 'https://i.ytimg.com/vi/6QjD_uJ2GIk/hqdefault.jpg',
    url: 'https://na.amma.org/meeting-amma/guides/meditation-course',
    actionText: 'Coming Soon',
    isDummy: true,
  },
];

const CoursesMain = () => {
  const insets = useSafeAreaInsets();
  const handleCoursePress = useCallback((course: CourseItem) => {
    if (course.isDummy) {
      Alert.alert(
        'Coming Soon',
        `The "${course.title}" course will be available soon. Stay tuned for future updates!`
      );
      return;
    }
    if (course.url) {
      Linking.openURL(course.url).catch(() => {
        Alert.alert('Error', 'Unable to open meditation course page');
      });
    }
  }, []);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.titleWrap}>
        <Text style={s.pageTitle}>Courses</Text>
        <Text style={s.pageSubtitle}>Explore Amma meditation guidance</Text>
      </View>

      <ScrollView
        style={s.flex1}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {COURSES_DATA.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={[s.courseCard, course.isDummy && s.dummyCard]}
            activeOpacity={0.75}
            onPress={() => handleCoursePress(course)}
          >
            <View style={s.courseArtwork}>
              <Image
                source={{ uri: course.thumbnail }}
                style={s.courseImage}
                resizeMode="cover"
              />
              {course.isDummy && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>Placeholder</Text>
                </View>
              )}
            </View>

            <View style={s.courseBody}>
              <Text style={s.courseTitle}>{course.title}</Text>
              <Text style={s.courseDescription}>
                {course.description}
              </Text>
              <Text style={[s.courseAction, course.isDummy && s.dummyAction]}>
                {course.actionText}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EE',
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom is calculated dynamically in contentContainerStyle
  },
  titleWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C250E',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#87553E',
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    overflow: 'hidden',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#5C250E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dummyCard: {
    opacity: 0.9,
  },
  courseArtwork: {
    height: 160,
    overflow: 'hidden',
    backgroundColor: '#87553E',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(92, 37, 14, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  courseBody: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
    marginBottom: 6,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#87553E',
    marginBottom: 12,
  },
  courseAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED7624',
  },
  dummyAction: {
    color: '#87553E',
  },
});

export default CoursesMain;
