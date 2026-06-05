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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/types';
import { homeService, HomeFeedData } from '../services/home.service';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { getDailyQuote, getRandomQuote } from '../data/ammaQuotes';
import { useLiveEventsStore } from '../store/liveEventsStore';

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
  { id: '1', title: 'Muralidhara Gopala | Soulful Krishna Bhajan', instructor: 'Amma (Mata Amritanandamayi)', duration: '9:15', views: '1.5M', youtubeId: 'US-ejM6b1wE', thumbnailUrl: 'https://i.ytimg.com/vi/US-ejM6b1wE/hqdefault.jpg' },
  { id: '2', title: 'Integrated Amrita Meditation (IAM) Guided Practice', instructor: 'Amrita Live', duration: '20:00', views: '950K', youtubeId: '3DIWMA9OVs0', thumbnailUrl: 'https://i.ytimg.com/vi/3DIWMA9OVs0/hqdefault.jpg' },
  { id: '3', title: 'Varalunna Hridayattil | Soulful Devotional Bhajan', instructor: 'Amma (Mata Amritanandamayi)', duration: '8:30', views: '2.8M', youtubeId: '6QjD_uJ2GIk', thumbnailUrl: 'https://i.ytimg.com/vi/6QjD_uJ2GIk/hqdefault.jpg' },
  { id: '4', title: "7 Steps for a Joyful Life | Amma's Special Message", instructor: 'Amma (Mata Amritanandamayi)', duration: '18:24', views: '1.2M', youtubeId: 'tH_AbG1JMOE', thumbnailUrl: 'https://i.ytimg.com/vi/tH_AbG1JMOE/hqdefault.jpg' },
];

const ALL_TRENDING_VIDEOS: TrendingVideo[] = [
  { id: '1', title: 'Muralidhara Gopala | Soulful Krishna Bhajan', instructor: 'Amma (Mata Amritanandamayi)', duration: '9:15', views: '1.5M', youtubeId: 'US-ejM6b1wE', thumbnailUrl: 'https://i.ytimg.com/vi/US-ejM6b1wE/hqdefault.jpg' },
  { id: '2', title: 'Integrated Amrita Meditation (IAM) Guided Practice', instructor: 'Amrita Live', duration: '20:00', views: '950K', youtubeId: '3DIWMA9OVs0', thumbnailUrl: 'https://i.ytimg.com/vi/3DIWMA9OVs0/hqdefault.jpg' },
  { id: '3', title: 'Varalunna Hridayattil | Soulful Devotional Bhajan', instructor: 'Amma (Mata Amritanandamayi)', duration: '8:30', views: '2.8M', youtubeId: '6QjD_uJ2GIk', thumbnailUrl: 'https://i.ytimg.com/vi/6QjD_uJ2GIk/hqdefault.jpg' },
  { id: '4', title: "7 Steps for a Joyful Life | Amma's Special Message", instructor: 'Amma (Mata Amritanandamayi)', duration: '18:24', views: '1.2M', youtubeId: 'tH_AbG1JMOE', thumbnailUrl: 'https://i.ytimg.com/vi/tH_AbG1JMOE/hqdefault.jpg' },
  { id: '5', title: 'Lokah Samastah Sukhino Bhavantu | Chant for Peace', instructor: 'Amma (Mata Amritanandamayi)', duration: '12:45', views: '2.1M', youtubeId: 'B_iEiNyr88U', thumbnailUrl: 'https://i.ytimg.com/vi/B_iEiNyr88U/hqdefault.jpg' },
  { id: '6', title: 'Conversations with Amma | Wisdom & Teachings', instructor: 'Amma (Mata Amritanandamayi)', duration: '22:15', views: '870K', youtubeId: 'AbpBM_qKZ5g', thumbnailUrl: 'https://i.ytimg.com/vi/AbpBM_qKZ5g/hqdefault.jpg' },
];

const FALLBACK_FEED: HomeFeedData = {
  greeting: '',
  dailyQuote: {
    quote_text: getDailyQuote(),
    author: 'Amma',
    category: 'wisdom',
  },
  trendingCourses: [
    { id: 'tc-1', title: 'Muralidhara Gopala | Soulful Krishna Bhajan', instructor_name: 'Amma (Mata Amritanandamayi)', thumbnail_url: 'https://i.ytimg.com/vi/US-ejM6b1wE/hqdefault.jpg', estimated_duration_minutes: 9, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-2', title: 'Integrated Amrita Meditation (IAM) Guided Practice', instructor_name: 'Amrita Live', thumbnail_url: 'https://i.ytimg.com/vi/3DIWMA9OVs0/hqdefault.jpg', estimated_duration_minutes: 20, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-3', title: 'Varalunna Hridayattil | Soulful Devotional Bhajan', instructor_name: 'Amma (Mata Amritanandamayi)', thumbnail_url: 'https://i.ytimg.com/vi/6QjD_uJ2GIk/hqdefault.jpg', estimated_duration_minutes: 8, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-4', title: 'Conversations with Amma | Wisdom & Teachings', instructor_name: 'Amma (Mata Amritanandamayi)', thumbnail_url: 'https://i.ytimg.com/vi/AbpBM_qKZ5g/hqdefault.jpg', estimated_duration_minutes: 22, difficulty_level: 'intermediate', is_premium: false } as HomeFeedData['trendingCourses'][number],
    { id: 'tc-5', title: 'Guided Meditation & Chanting for Inner Peace', instructor_name: 'Amma (Mata Amritanandamayi)', thumbnail_url: 'https://i.ytimg.com/vi/B_iEiNyr88U/hqdefault.jpg', estimated_duration_minutes: 25, difficulty_level: 'beginner', is_premium: false } as HomeFeedData['trendingCourses'][number],
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
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>>();
  const [feed, setFeed] = useState<HomeFeedData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { liveEvents, fetchEvents: fetchLiveEvents } = useLiveEventsStore();

  const loadFeed = useCallback(async () => {
    try {
      fetchLiveEvents();
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
  }, [fetchLiveEvents]);

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
      Linking.openURL(item.booking_url).catch(() =>
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
            <Image
              source={require('../assets/icons/New folder/Bell.png')}
              style={s.bellIconImg}
            />
          </TouchableOpacity>
        </View>

        {feedError ? <ErrorBanner message={feedError} onRetry={loadFeed} /> : null}

        {/* Daily Quote */}
        {feed?.dailyQuote && (
          <View style={s.quoteCard}>
            <Text style={s.quoteLabel}>Daily Affirmation</Text>
            <Text style={s.quoteText}>"{feed.dailyQuote.quote_text}"</Text>
            <Text style={s.quoteAuthor}>— {feed.dailyQuote.author || 'Unknown'}</Text>
          </View>
        )}
        {/* Stats Pills */}
        <View style={s.statsRow}>
          <View style={s.statPill}>
            <Image
              source={require('../assets/icons/New folder/Clock.png')}
              style={s.statIconImg}
            />
            <Text style={s.statValue}>
              {loading ? '--' : formatMinutes(feed?.stats.totalMinutes ?? 0)}
            </Text>
            <Text style={s.statLabel}>Total Time</Text>
          </View>
          <View style={[s.statPill, s.statPillSpaced]}>
            <Image
              source={require('../assets/icons/New folder/Fire.png')}
              style={s.statIconImg}
            />
            <Text style={s.statValue}>
              {loading ? '--' : feed?.stats.currentStreak ?? 0}
            </Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Live Events Section */}
        <View style={s.sectionWrap}>
          <View style={s.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.sectionTitleInline}>Live Events</Text>
              <View style={s.liveBadgeHome}>
                <View style={s.liveBadgeIndicator} />
                <Text style={s.liveBadgeHomeText}>LIVE</Text>
              </View>
            </View>
          </View>
          {liveEvents && liveEvents.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
              data={liveEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.liveEventCard}
                  onPress={() => navigation.navigate('LiveEventDetails', { eventId: item.id })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/400x200' }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <View style={s.cardOverlay} />
                  <View style={s.liveBadgeCard}>
                    <Text style={s.liveBadgeCardText}>LIVE</Text>
                  </View>
                  <View style={s.liveEventInfo}>
                    <Text style={s.liveEventTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={s.liveEventDetails}>
                      👁️ {item.viewer_count || 0} watching
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={s.emptyLiveContainer}>
              <Text style={s.emptyLiveText}>No active live streams right now</Text>
            </View>
          )}
        </View>

        {/* Recent Events Banner */}
        {feed?.upcomingEvents && feed.upcomingEvents.filter((item: any) => item.category !== 'none').length > 0 && (
          <View style={s.sectionWrap}>
            <Text style={s.sectionTitle}>Upcoming Events</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
              data={feed.upcomingEvents.filter((item: any) => item.category !== 'none')}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isNoLive = item.category === 'none';
                const isNews = item.category === 'news';

                if (isNews) {
                  // Yatra / news card — image with overlay
                  return (
                    <TouchableOpacity
                      style={s.yatraEventCard}
                      onPress={() => handleEventPress(item)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: item.thumbnail_url || 'https://www.amritapuri.org/templates/amritapuri/images/amritapuri-logo.jpg' }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                      <View style={s.yatraEventOverlay} />
                      <View style={s.yatraEventBadge}>
                        <Text style={s.yatraEventBadgeText}>
                          {item.instructor_name || 'YATRA UPDATE'}
                        </Text>
                      </View>
                      <View style={s.yatraEventInfo}>
                        <Text style={s.yatraEventTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        {!!item.event_date && (
                          <Text style={s.yatraEventDate}>
                            {new Date(item.event_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }

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
              onPress={() => setShowAllTrending(true)}
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

        <View style={s.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showAllTrending}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowAllTrending(false);
          setSearchQuery('');
        }}
      >
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity 
              style={s.modalCloseButton} 
              onPress={() => {
                setShowAllTrending(false);
                setSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <Text style={s.modalCloseText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>Trending Videos</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={s.searchBarContainer}>
            <TextInput
              style={s.searchInput}
              placeholder="Search trending videos..."
              placeholderTextColor="#87553E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={ALL_TRENDING_VIDEOS.filter(video => 
              video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              video.instructor.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => `all-${item.id}`}
            contentContainerStyle={s.modalListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.modalVideoCard}
                onPress={() => handleTrendingVideoPress(item)}
                activeOpacity={0.85}
              >
                <View style={s.modalVideoThumb}>
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
                <View style={s.modalVideoInfo}>
                  <Text style={s.modalVideoTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={s.modalVideoInstructor} numberOfLines={1}>
                    {item.instructor}
                  </Text>
                  <Text style={s.modalVideoViews}>
                    {item.views} views
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={s.modalEmptyContainer}>
                <Text style={s.modalEmptyText}>No videos match your search.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
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
  bellIconImg: { width: 20, height: 20, resizeMode: 'contain' },
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
  statIconImg: { width: 18, height: 18, resizeMode: 'contain', marginRight: 4 },
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
  yatraEventCard: {
    borderRadius: 12,
    width: 220,
    height: 160,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#2C1A0E',
    position: 'relative',
  },
  yatraEventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  yatraEventBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(237, 118, 36, 0.92)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  yatraEventBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  yatraEventInfo: {
    padding: 12,
  },
  yatraEventTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 19,
  },
  yatraEventDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
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
    marginTop: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF5EE',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 127, 46, 0.1)',
  },
  modalCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
  },
  modalCloseText: {
    color: '#ED7624',
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
    textAlign: 'center',
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#5C250E',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.15)',
  },
  modalListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalVideoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.1)',
    overflow: 'hidden',
    height: 100,
  },
  modalVideoThumb: {
    width: 140,
    height: '100%',
    backgroundColor: 'rgba(240, 127, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalVideoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  modalVideoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C250E',
    lineHeight: 18,
  },
  modalVideoInstructor: {
    fontSize: 12,
    color: '#87553E',
    marginTop: 4,
  },
  modalVideoViews: {
    fontSize: 11,
    color: '#A0705A',
    marginTop: 2,
  },
  modalEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#87553E',
  },
  liveBadgeHome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  liveBadgeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  liveBadgeHomeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  liveEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 256,
    height: 144,
    marginRight: 12,
    padding: 16,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  liveBadgeCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeCardText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveEventInfo: {
    zIndex: 1,
  },
  liveEventTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 20,
  },
  liveEventDetails: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  emptyLiveContainer: {
    marginHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLiveText: {
    color: '#87553E',
    fontSize: 14,
  },
});

export default HomeMain;
