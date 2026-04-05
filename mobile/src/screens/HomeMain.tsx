import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeService, HomeFeedData } from '../services/home.service';

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
  <View className="bg-gray-200 rounded-card h-32 w-48 mr-3 animate-pulse" />
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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
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
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <View>
            <Text className="text-2xl font-serif font-bold text-primary">
              {getGreetingTime()},{' '}
              {loading ? '...' : feed?.greeting || 'Friend'}
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center">
            <Text className="text-lg">{'\u{1F514}'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Pills */}
        <View className="flex-row px-6 mt-4 space-x-3">
          <View className="flex-row items-center bg-surface rounded-pill px-4 py-2 border border-border">
            <Text className="text-sm mr-1">{'\u{23F1}'}</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {loading ? '--' : formatMinutes(feed?.stats.totalMinutes ?? 0)}
            </Text>
            <Text className="text-xs text-text-secondary ml-1">Total Time</Text>
          </View>
          <View className="flex-row items-center bg-surface rounded-pill px-4 py-2 border border-border">
            <Text className="text-sm mr-1">{'\u{1F525}'}</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {loading ? '--' : feed?.stats.currentStreak ?? 0}
            </Text>
            <Text className="text-xs text-text-secondary ml-1">Day Streak</Text>
          </View>
        </View>

        {/* Live Events Banner */}
        {feed?.upcomingEvents && feed.upcomingEvents.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold text-text-primary px-6 mb-3">
              Upcoming Events
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              data={feed.upcomingEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity className="bg-primary rounded-card w-64 h-36 mr-3 p-4 justify-end">
                  {item.is_live && (
                    <View className="absolute top-3 left-3 bg-red-500 rounded-pill px-2 py-1">
                      <Text className="text-white text-xs font-bold">LIVE</Text>
                    </View>
                  )}
                  <Text className="text-white font-bold text-base" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-white/70 text-xs mt-1">
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
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-lg font-bold text-text-primary">
              Trending Videos
            </Text>
            <TouchableOpacity>
              <Text className="text-accent text-sm font-semibold">See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View className="flex-row px-6">
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
                <TouchableOpacity className="bg-surface rounded-card w-48 mr-3 border border-border overflow-hidden">
                  <View className="h-28 bg-primary-light/20 items-center justify-center">
                    <Text className="text-3xl">{'\u{1F3AC}'}</Text>
                    <View className="absolute bottom-2 right-2 bg-black/60 rounded-pill px-2 py-0.5">
                      <Text className="text-white text-xs">
                        {formatMinutes(item.estimated_duration_minutes)}
                      </Text>
                    </View>
                  </View>
                  <View className="p-3">
                    <Text
                      className="text-sm font-semibold text-text-primary"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs text-text-secondary mt-1">
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
          <View className="mx-6 mt-6 mb-2 p-5 bg-primary/5 rounded-card border border-primary/20">
            <Text className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">
              Daily Affirmation
            </Text>
            <Text className="text-base font-serif text-text-primary leading-6 italic">
              "{feed.dailyQuote.quote_text}"
            </Text>
            <Text className="text-sm text-text-secondary mt-3">
              — {feed.dailyQuote.author || 'Unknown'}
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeMain;
