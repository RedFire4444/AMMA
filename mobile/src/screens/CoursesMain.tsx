/**
 * File: CoursesMain.tsx
 *
 * Description: Courses screen with a single meditation course link.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useCallback } from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEDITATION_COURSE_URL =
  'https://na.amma.org/meeting-amma/guides/meditation-course';
const AMMA_THUMBNAIL_URL =
  'https://www.amritapuri.org/images/2020/02/19yatra-28-1200x462.jpg';

const CoursesMain = () => {
  const handleMeditationCoursePress = useCallback(() => {
    Linking.openURL(MEDITATION_COURSE_URL).catch(() => {
      Alert.alert('Error', 'Unable to open meditation course page');
    });
  }, []);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.titleWrap}>
        <Text style={s.pageTitle}>Courses</Text>
        <Text style={s.pageSubtitle}>Explore Amma meditation guidance</Text>
      </View>

      <TouchableOpacity
        style={s.courseCard}
        activeOpacity={0.75}
        onPress={handleMeditationCoursePress}
      >
        <View style={s.courseArtwork}>
          <Image
            source={{ uri: AMMA_THUMBNAIL_URL }}
            style={s.courseImage}
            resizeMode="cover"
          />
        </View>

        <View style={s.courseBody}>
          <Text style={s.courseTitle}>Meditation Course</Text>
          <Text style={s.courseDescription}>
            Learn Amma's meditation practice and course guidance.
          </Text>
          <Text style={s.courseAction}>Open course</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EE',
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
});

export default CoursesMain;
