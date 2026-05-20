/**
 * File: HomeMain.tsx
 *
 * Description: Main home screen displaying personalized greeting, daily quote,
 * meditation streak, quick-start actions, and featured content sections.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeService, HomeFeedData } from '../services/home.service';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { getDailyQuote, getRandomQuote } from '../data/ammaQuotes';

const getGreetingTime = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Fallback data shown when backend is unreachable — keeps the screen populated for demo
interface TrendingVideo {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  views: string;
  youtubeId: string;
  thumbnailUrl: string;
}

const TRENDING_VIDEOS: TrendingVideo[] = [
  { id: '1', title: '10-Minute Meditation For Beginners', instructor: 'Goodful', duration: '10:00', views: '12M', youtubeId: 'U9YKY7fdwyg', thumbnailUrl: 'https://i.ytimg.com/vi/U9YKY7fdwyg/hqdefault.jpg' },
  { id: '2', title: '5-Minute Meditation You Can Do Anywhere', instructor: 'Goodful', duration: '5:15', views: '5.1M', youtubeId: 'inpok4MKVLM', thumbnailUrl: 'https://i.ytimg.com/vi/inpok4MKVLM/hqdefault.jpg' },
  { id: '3', title: 'Daily Calm | 10 Minute Mindfulness Meditation', instructor: 'Calm', duration: '10:20', views: '35M', youtubeId: 'syx3a1_LeFo', thumbnailUrl: 'https://i.ytimg.com/vi/syx3a1_LeFo/hqdefault.jpg' },
  { id: '4', title: 'Shree Hanuman Chalisa Original', instructor: 'T-Series Bhakti Sagar', duration: '9:45', views: '3.4B', youtubeId: 'AETFvQonfV8', thumbnailUrl: 'https://i.ytimg.com/vi/AETFvQonfV8/hqdefault.jpg' },
];

const FALLBACK_FEED: HomeFeedData = {
  greeting: 'Friend',
  dailyQuote: {
    quote_text: getDailyQuote(),
    author: 'Amma',
    category: 'wisdom',
  },
  trendingCourses: [
    { id: 'tc-1', title: '10-Minute Meditation For Beginners', instructor_name: 'Goodful', thumbnail_url: 'https://i.ytimg.com/vi/U9YKY7fdwyg/hqdefault.jpg', estimated_duration_minutes: 10, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-2', title: 'Daily Calm | Mindfulness Meditation', instructor_name: 'Calm', thumbnail_url: 'https://i.ytimg.com/vi/syx3a1_LeFo/hqdefault.jpg', estimated_duration_minutes: 10, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-3', title: 'Shree Hanuman Chalisa', instructor_name: 'T-Series Bhakti Sagar', thumbnail_url: 'https://i.ytimg.com/vi/AETFvQonfV8/hqdefault.jpg', estimated_duration_minutes: 10, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-4', title: 'Unwavering Focus | Dandapani', instructor_name: 'TEDx Talks', thumbnail_url: 'https://i.ytimg.com/vi/4O2JK_94g3Y/hqdefault.jpg', estimated_duration_minutes: 18, difficulty_level: 'intermediate', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-5', title: 'Meditation For Anxiety', instructor_name: 'Goodful', thumbnail_url: 'https://i.ytimg.com/vi/O-6f5wQXSu8/hqdefault.jpg', estimated_duration_minutes: 10, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
  ],
  upcomingEvents: [
    { id: 'ev-0', title: 'No Live Events', event_date: new Date().toISOString(), instructor_name: '', thumbnail_url: null, is_live: false, category: 'none' } as any,
    { id: 'ev-1', title: 'IAM-20 Course & Refresher in Person', event_date: '2026-05-31T09:00:00.000Z', instructor_name: 'Amma IAM Team', thumbnail_url: null, is_live: false, category: 'meditation', booking_url: 'https://na.amma.org/groups/north-america/iam-meditation/events/iam-20-course-refresher-person' } as any,
    { id: 'ev-2', title: 'IAM-20 Course & 8-Day Guided Immersion', event_date: '2026-06-11T09:00:00.000Z', instructor_name: 'Amma IAM Team', thumbnail_url: null, is_live: false, category: 'meditation', booking_url: 'https://na.amma.org/groups/north-america/iam-meditation/events/iam-20-course-southern-california-iam-team' } as any,
  ],
  stats: {
    totalMinutes: 0,
    currentStreak: 0,
  },
};

const SkeletonCard = () => <View style={s.skeletonCard} />;

const HomeMain = () => {
  const [feed, setFeed] = useState<HomeFeedData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      const data = await homeService.getHomeFeed();
      // If backend returns empty content, fall back to curated content
      const hasContent =
        data &&
        (data.trendingCourses?.length > 0 ||
          data.upcomingEvents?.length > 0 ||
          data.dailyQuote);
      setFeed(hasContent ? data : { ...FALLBACK_FEED, stats: data?.stats || FALLBACK_FEED.stats });
      setFeedError(null);
    } catch (err) {
      // Network or auth error — surface a banner so the user can retry,
      // but keep showing fallback content so the screen isn't empty.
      if (__DEV__) console.warn('[Home] Feed fetch failed:', err);
      setFeed(FALLBACK_FEED);
      setFeedError("We couldn't load your latest feed. Showing offline content.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Pick a fresh random Amma quote on every pull-to-refresh
    setFeed((prev) => prev ? {
      ...prev,
      dailyQuote: { quote_text: getRandomQuote(), author: 'Amma', category: 'wisdom' },
    } : prev);
    loadFeed();
  }, [loadFeed]);

  const handleBellPress = () => {
    Alert.alert(
      'Notifications',
      'You have no new notifications.',
      [{ text: 'OK', style: 'default' }],
    );
  };

  const handleTrendingVideoPress = (item: TrendingVideo) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${item.youtubeId}`).catch(() =>
      Alert.alert('Error', 'Unable to open video')
    );
  };

  const handleEventPress = (item: any) => {
    if (item.booking_url) {
      Linking.openURL(item.booking_url).catch((err) =>
        Alert.alert('Error', 'Unable to open booking page')
      );
    } else {
      Alert.alert('Event', `Opening "${item.title}"...\n\nEvent details available after backend setup.`);
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.flex1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ED7624"
          />
        }
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>
              {getGreetingTime()}, {loading ? '...' : feed?.greeting || 'Friend'}
            </Text>
          </View>
          <TouchableOpacity
            style={s.bellBtn}
            onPress={handleBellPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Text style={s.bellIcon}>{'\u{1F514}'}</Text>
          </TouchableOpacity>
        </View>

        {feedError ? <ErrorBanner message={feedError} onRetry={loadFeed} /> : null}

        {/* Stats Pills */}
        <View style={s.statsRow}>
          <View style={s.statPill}>
            <Text style={s.statIcon}>{'\u{23F1}'}</Text>
            <Text style={s.statValue}>
              {loading ? '--' : formatMinutes(feed?.stats.totalMinutes ?? 0)}
            </Text>
            <Text style={s.statLabel}>Total Time</Text>
          </View>
          <View style={[s.statPill, s.statPillSpaced]}>
            <Text style={s.statIcon}>{'\u{1F525}'}</Text>
            <Text style={s.statValue}>
              {loading ? '--' : feed?.stats.currentStreak ?? 0}
            </Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Live Events Banner */}
        {feed?.upcomingEvents && feed.upcomingEvents.length > 0 && (
          <View style={s.sectionWrap}>
            <Text style={s.sectionTitle}>Upcoming Events</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
              data={feed.upcomingEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isNoLive = item.category === 'none';
                return (
                  <TouchableOpacity
                    style={[s.eventCard, isNoLive && s.eventCardMuted]}
                    onPress={() => isNoLive ? null : handleEventPress(item)}
                    activeOpacity={isNoLive ? 1 : 0.8}
                  >
                    {item.is_live ? (
                      <View style={s.liveBadge}>
                        <Text style={s.liveBadgeText}>LIVE</Text>
                      </View>
                    ) : isNoLive ? (
                      <View style={s.liveBadgeMuted}>
                        <Text style={s.liveBadgeMutedText}>NO LIVE</Text>
                      </View>
                    ) : null}
                    <Text style={[s.eventTitle, isNoLive && s.eventTitleMuted]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {!isNoLive && (
                      <Text style={s.eventDate}>
                        {new Date(item.event_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Trending Videos / Courses */}
        <View style={s.sectionWrap}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitleInline}>Trending Videos</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Trending', 'Full trending list coming soon.')}
            >
              <Text style={s.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={s.skeletonRow}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : TRENDING_VIDEOS.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
              data={TRENDING_VIDEOS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.trendingCard}
                  onPress={() => handleTrendingVideoPress(item)}
                  activeOpacity={0.85}
                >
                  <View style={s.trendingThumb}>
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                    <View style={s.durationBadge}>
                      <Text style={s.durationBadgeText}>{item.duration}</Text>
                    </View>
                    <View style={s.playOverlay}>
                      <Text style={s.playIcon}>{'\u{25B6}'}</Text>
                    </View>
                  </View>
                  <View style={s.trendingInfo}>
                    <Text style={s.trendingTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={s.trendingInstructor} numberOfLines={1}>
                      {item.instructor} · {item.views}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={s.emptyTrendingWrap}>
              <Text style={s.emptyTrendingText}>No trending videos right now</Text>
            </View>
          )}
        </View>

        {/* Daily Quote */}
        {feed?.dailyQuote && (
          <View style={s.quoteCard}>
            <Text style={s.quoteLabel}>Daily Affirmation</Text>
            <Text style={s.quoteText}>"{feed.dailyQuote.quote_text}"</Text>
            <Text style={s.quoteAuthor}>— {feed.dailyQuote.author || 'Unknown'}</Text>
          </View>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF5EE' },
  flex1: { flex: 1 },
  statPillSpaced: { marginLeft: 12 },
  horizontalListPadding: { paddingHorizontal: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#5C250E' },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 16 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
  },
  statIcon: { fontSize: 14, marginRight: 4 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#5C250E' },
  statLabel: { fontSize: 12, color: '#87553E', marginLeft: 4 },
  sectionWrap: { marginTop: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitleInline: { fontSize: 18, fontWeight: 'bold', color: '#5C250E' },
  seeAllText: { color: '#ED7624', fontSize: 14, fontWeight: '600' },
  skeletonRow: { flexDirection: 'row', paddingHorizontal: 24 },
  skeletonCard: {
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    borderRadius: 12,
    height: 128,
    width: 192,
    marginRight: 12,
  },
  eventCard: {
    backgroundColor: '#ED7624',
    borderRadius: 12,
    width: 256,
    height: 144,
    marginRight: 12,
    padding: 16,
    justifyContent: 'flex-end',
  },
  eventCardMuted: {
    backgroundColor: '#C4B5A8',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DC2626',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  liveBadgeMuted: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeMutedText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  eventTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  eventTitleMuted: { color: 'rgba(255,255,255,0.6)' },
  eventDate: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginTop: 4 },
  trendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 192,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    overflow: 'hidden',
  },
  trendingThumb: {
    height: 112,
    backgroundColor: 'rgba(240, 127, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trendingThumbIcon: { fontSize: 30 },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationBadgeText: { color: '#FFFFFF', fontSize: 12 },
  playOverlay: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  trendingInfo: { padding: 12 },
  trendingTitle: { fontSize: 14, fontWeight: '600', color: '#5C250E' },
  trendingInstructor: { fontSize: 12, color: '#87553E', marginTop: 4 },
  emptyTrendingWrap: { paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  emptyTrendingText: { fontSize: 14, color: '#87553E' },
  quoteCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
    padding: 20,
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.2)',
  },
  quoteLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#ED7624',
    marginBottom: 12,
    fontWeight: '600',
  },
  quoteText: { fontSize: 16, color: '#5C250E', lineHeight: 24, fontStyle: 'italic' },
  quoteAuthor: { fontSize: 14, color: '#87553E', marginTop: 12 },
  bottomSpacer: { height: 110 },
});

export default HomeMain;
