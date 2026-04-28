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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeService, HomeFeedData } from '../services/home.service';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { colors } from '../utils/styles';

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
const FALLBACK_FEED: HomeFeedData = {
  greeting: 'Friend',
  dailyQuote: {
    quote_text:
      'Love is our true essence. Love has no limitations of caste, religion, race, or nationality.',
    author: 'Amma',
    category: 'wisdom',
  },
  trendingCourses: [
    {
      id: 'fc-1',
      title: 'Guided Morning Meditation',
      instructor_name: 'Amma',
      thumbnail_url: null,
      estimated_duration_minutes: 15,
      difficulty_level: 'beginner',
      is_premium: false,
    } as HomeFeedData['trendingCourses'][number],
    {
      id: 'fc-2',
      title: 'Amritavarsham 70 Discourse',
      instructor_name: 'Swami Amritaswarupananda',
      thumbnail_url: null,
      estimated_duration_minutes: 45,
      difficulty_level: 'intermediate',
      is_premium: false,
    } as HomeFeedData['trendingCourses'][number],
    {
      id: 'fc-3',
      title: 'Pranayama: Art of Breath',
      instructor_name: 'Dr. Meera Iyer',
      thumbnail_url: null,
      estimated_duration_minutes: 20,
      difficulty_level: 'intermediate',
      is_premium: false,
    } as HomeFeedData['trendingCourses'][number],
    {
      id: 'fc-4',
      title: 'Deep Sleep Yoga Nidra',
      instructor_name: 'Ananya Sharma',
      thumbnail_url: null,
      estimated_duration_minutes: 30,
      difficulty_level: 'beginner',
      is_premium: true,
    } as HomeFeedData['trendingCourses'][number],
  ],
  upcomingEvents: [
    {
      id: 'ev-1',
      title: 'Global Sunday Satsang & Meditation',
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      instructor_name: 'Swami Prakash',
      thumbnail_url: null,
      is_live: true,
      category: 'satsang',
    } as HomeFeedData['upcomingEvents'][number],
    {
      id: 'ev-2',
      title: 'Full Moon Meditation Circle',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      instructor_name: 'Dr. Meera Iyer',
      thumbnail_url: null,
      is_live: false,
      category: 'meditation',
    } as HomeFeedData['upcomingEvents'][number],
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
    loadFeed();
  }, [loadFeed]);

  const handleBellPress = () => {
    Alert.alert(
      'Notifications',
      'You have no new notifications.',
      [{ text: 'OK', style: 'default' }],
    );
  };

  const handleCoursePress = (title: string) => {
    Alert.alert('Course', `Opening "${title}"...\n\nFull course player available after backend setup.`);
  };

  const handleEventPress = (title: string) => {
    Alert.alert('Event', `Opening "${title}"...\n\nEvent details available after backend setup.`);
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
            tintColor={colors.primary}
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.eventCard}
                  onPress={() => handleEventPress(item.title)}
                  activeOpacity={0.8}
                >
                  {item.is_live && (
                    <View style={s.liveBadge}>
                      <Text style={s.liveBadgeText}>LIVE</Text>
                    </View>
                  )}
                  <Text style={s.eventTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={s.eventDate}>
                    {new Date(item.event_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              )}
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
          ) : (feed?.trendingCourses?.length ?? 0) > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
              data={feed?.trendingCourses || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.trendingCard}
                  onPress={() => handleCoursePress(item.title)}
                  activeOpacity={0.85}
                >
                  <View style={s.trendingThumb}>
                    <Text style={s.trendingThumbIcon}>{'\u{1F3AC}'}</Text>
                    <View style={s.durationBadge}>
                      <Text style={s.durationBadgeText}>
                        {formatMinutes(item.estimated_duration_minutes)}
                      </Text>
                    </View>
                  </View>
                  <View style={s.trendingInfo}>
                    <Text style={s.trendingTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={s.trendingInstructor}>{item.instructor_name}</Text>
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
  safeArea: { flex: 1, backgroundColor: colors.background },
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
  greeting: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 16 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 14, marginRight: 4 },
  statValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
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
    color: colors.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitleInline: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  seeAllText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  skeletonRow: { flexDirection: 'row', paddingHorizontal: 24 },
  skeletonCard: {
    backgroundColor: colors.gray200,
    borderRadius: 12,
    height: 128,
    width: 192,
    marginRight: 12,
  },
  eventCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 256,
    height: 144,
    marginRight: 12,
    padding: 16,
    justifyContent: 'flex-end',
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
  liveBadgeText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  eventTitle: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  eventDate: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginTop: 4 },
  trendingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: 192,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  trendingThumb: {
    height: 112,
    backgroundColor: 'rgba(45, 106, 79, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  durationBadgeText: { color: colors.white, fontSize: 12 },
  trendingInfo: { padding: 12 },
  trendingTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  trendingInstructor: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  emptyTrendingWrap: { paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  emptyTrendingText: { fontSize: 14, color: colors.textSecondary },
  quoteCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
    padding: 20,
    backgroundColor: 'rgba(27, 67, 50, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 67, 50, 0.2)',
  },
  quoteLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.accent,
    marginBottom: 12,
    fontWeight: '600',
  },
  quoteText: { fontSize: 16, color: colors.textPrimary, lineHeight: 24, fontStyle: 'italic' },
  quoteAuthor: { fontSize: 14, color: colors.textSecondary, marginTop: 12 },
  bottomSpacer: { height: 32 },
});

export default HomeMain;
