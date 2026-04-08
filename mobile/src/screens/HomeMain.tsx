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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeService, HomeFeedData } from '../services/home.service';
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

const SkeletonCard = () => (
  <View style={s.skeletonCard} />
);

const HomeMain = () => {
  const [feed, setFeed] = useState<HomeFeedData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const data = await homeService.getHomeFeed();
      setFeed(data);
    } catch {
      // Silently fail — show what we can
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

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.flex1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1B4332"
          />
        }
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>
              {getGreetingTime()},{' '}
              {loading ? '...' : feed?.greeting || 'Friend'}
            </Text>
          </View>
          <TouchableOpacity style={s.bellBtn}>
            <Text style={s.bellIcon}>{'\u{1F514}'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Pills */}
        <View style={s.statsRow}>
          <View style={s.statPill}>
            <Text style={s.statIcon}>{'\u{23F1}'}</Text>
            <Text style={s.statValue}>
              {loading ? '--' : formatMinutes(feed?.stats.totalMinutes ?? 0)}
            </Text>
            <Text style={s.statLabel}>Total Time</Text>
          </View>
          <View style={[s.statPill, { marginLeft: 12 }]}>
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
            <Text style={s.sectionTitle}>
              Upcoming Events
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              data={feed.upcomingEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.eventCard}>
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
            <Text style={s.sectionTitle}>
              Trending Videos
            </Text>
            <TouchableOpacity>
              <Text style={s.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={s.skeletonRow}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              data={feed?.trendingCourses || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.trendingCard}>
                  <View style={s.trendingThumb}>
                    <Text style={s.trendingThumbIcon}>{'\u{1F3AC}'}</Text>
                    <View style={s.durationBadge}>
                      <Text style={s.durationBadgeText}>
                        {formatMinutes(item.estimated_duration_minutes)}
                      </Text>
                    </View>
                  </View>
                  <View style={s.trendingInfo}>
                    <Text
                      style={s.trendingTitle}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text style={s.trendingInstructor}>
                      {item.instructor_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Daily Quote */}
        {feed?.dailyQuote && (
          <View style={s.quoteCard}>
            <Text style={s.quoteLabel}>
              Daily Affirmation
            </Text>
            <Text style={s.quoteText}>
              "{feed.dailyQuote.quote_text}"
            </Text>
            <Text style={s.quoteAuthor}>
              — {feed.dailyQuote.author || 'Unknown'}
            </Text>
          </View>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: colors.primary,
  },
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
  bellIcon: {
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
  },
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
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  sectionWrap: {
    marginTop: 24,
  },
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
  seeAllText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
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
  liveBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
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
  trendingThumbIcon: {
    fontSize: 30,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationBadgeText: {
    color: colors.white,
    fontSize: 12,
  },
  trendingInfo: {
    padding: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  trendingInstructor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
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
  quoteText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay',
    color: colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default HomeMain;
