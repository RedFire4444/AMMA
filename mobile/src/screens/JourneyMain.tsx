/**
 * File: JourneyMain.tsx
 *
 * Description: Journey tracking screen displaying meditation streaks, habit
 * grids, weekly progress stats, and session history for the user.
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HabitGrid } from '../components/journey/HabitGrid';
import {
  habitsService,
  HabitLog,
  PerformanceRating,
  VisionBoardImage,
  DayJourneyEntry,
} from '../services/habits.service';
import { homeService } from '../services/home.service';
import { JourneyStackParamList } from '../navigation/types';

type JourneyNav = NativeStackNavigationProp<JourneyStackParamList, 'JourneyMain'>;

interface HabitConfig {
  type: string;
  name: string;
  icon: string;
}

const HABITS: HabitConfig[] = [
  { type: 'meditation', name: 'Meditation', icon: '\u{1F9D8}' },
  { type: 'exercise', name: 'Exercise', icon: '\u{1F3CB}' },
  { type: 'cold_shower', name: 'Cold Shower', icon: '\u{1F6BF}' },
  { type: 'early_wakeup', name: 'Early Wakeup', icon: '\u{23F0}' },
];

const DAY_PERIODS: Array<{
  period: 'morning' | 'afternoon' | 'night';
  label: string;
  timeRange: string;
  icon: string;
}> = [
  { period: 'morning', label: 'Morning', timeRange: '5:00 - 12:00', icon: '\u{1F305}' },
  { period: 'afternoon', label: 'Afternoon', timeRange: '12:00 - 18:00', icon: '\u{2600}' },
  { period: 'night', label: 'Night', timeRange: '18:00 - 22:00', icon: '\u{1F319}' },
];

interface JourneyData {
  habitLogs: HabitLog[];
  streaks: Record<string, { current_streak: number; longest_streak: number }>;
  weeklyPerformance: PerformanceRating[];
  dailyQuote: { quote_text: string; author: string } | null;
  visionBoard: VisionBoardImage[];
  dayJourney: DayJourneyEntry[];
}

const SkeletonBlock = ({ height }: { height: number }) => (
  <View
    className="bg-gray-200 rounded-card mx-6 mb-4 animate-pulse"
    style={{ height }}
  />
);

const PerformanceBar = ({
  rating,
  dayLabel,
}: {
  rating: number;
  dayLabel: string;
}) => {
  const barHeight = Math.max(rating * 10, 4);
  return (
    <View className="items-center flex-1">
      <View
        className="w-6 bg-accent rounded-t-sm"
        style={{ height: barHeight }}
      />
      <Text className="text-xs text-text-secondary mt-1">{dayLabel}</Text>
    </View>
  );
};

const JourneyMain = () => {
  const navigation = useNavigation<JourneyNav>();
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [habitsData, perfData, feedData, visionData, journeyData] =
        await Promise.allSettled([
          habitsService.getAllHabits(),
          habitsService.getWeeklyPerformance(),
          homeService.getHomeFeed(),
          habitsService.getVisionBoard(),
          habitsService.getDayJourney(),
        ]);

      const habits =
        habitsData.status === 'fulfilled' ? habitsData.value : { streaks: {}, logs: [] };
      const perf =
        perfData.status === 'fulfilled' ? perfData.value : [];
      const feed =
        feedData.status === 'fulfilled' ? feedData.value : null;
      const vision =
        visionData.status === 'fulfilled' ? visionData.value : [];
      const journey =
        journeyData.status === 'fulfilled' ? journeyData.value : [];

      setData({
        habitLogs: habits.logs,
        streaks: habits.streaks,
        weeklyPerformance: perf,
        dailyQuote: feed?.dailyQuote ?? null,
        visionBoard: vision,
        dayJourney: journey,
      });
    } catch {
      // Best effort
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLogHabit = useCallback(
    async (habitType: string) => {
      try {
        await habitsService.logHabit(habitType, { completed: true });
        Alert.alert('Logged!', `${habitType} logged for today.`);
        loadData();
      } catch {
        Alert.alert('Error', 'Failed to log habit.');
      }
    },
    [loadData],
  );

  const getHabitLogs = (
    habitType: string,
  ): Array<{ date: string; completed: boolean }> => {
    if (!data) return [];
    return data.habitLogs
      .filter((log) => log.habit_type === habitType)
      .map((log) => ({
        date: log.logged_at,
        completed: log.completed,
      }));
  };

  const getStreakCount = (habitType: string): number => {
    if (!data) return 0;
    return data.streaks[habitType]?.current_streak ?? 0;
  };

  const getWeekDayLabels = (): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(days[d.getDay()]);
    }
    return result;
  };

  const getPerformanceForDay = (daysAgo: number): number => {
    if (!data) return 0;
    const d = new Date();
    d.setDate(d.getDate() - (6 - daysAgo));
    const dateStr = d.toISOString().split('T')[0];
    const entry = data.weeklyPerformance.find((p) => p.rated_at === dateStr);
    return entry?.rating ?? 0;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-4 pb-2">
            <View className="bg-gray-200 h-8 w-40 rounded-card animate-pulse" />
          </View>
          <SkeletonBlock height={200} />
          <SkeletonBlock height={200} />
          <SkeletonBlock height={120} />
          <SkeletonBlock height={100} />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-serif font-bold text-primary">
            My Journey
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            Track your daily sadhana
          </Text>
        </View>

        {/* Start Meditation button */}
        <TouchableOpacity
          className="mx-6 mt-3 mb-4 bg-primary rounded-card py-4 px-5 flex-row items-center justify-between"
          onPress={() => navigation.navigate('MeditationTimer')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\u{1F9D8}'}</Text>
            <View>
              <Text className="text-white font-bold text-base">
                Start Meditation
              </Text>
              <Text className="text-white/70 text-xs mt-0.5">
                Begin your daily practice
              </Text>
            </View>
          </View>
          <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center">
            <Text className="text-white text-lg">{'\u25B6'}</Text>
          </View>
        </TouchableOpacity>

        {/* Habit Grids */}
        {HABITS.map((habit) => (
          <HabitGrid
            key={habit.type}
            habitType={habit.type}
            habitIcon={habit.icon}
            habitName={habit.name}
            logs={getHabitLogs(habit.type)}
            streakCount={getStreakCount(habit.type)}
            onLogToday={() => handleLogHabit(habit.type)}
          />
        ))}

        {/* Performance Tracker */}
        <View className="bg-surface rounded-card border border-border mx-6 mb-4 p-4">
          <Text className="text-base font-bold text-text-primary mb-1">
            Performance Tracker
          </Text>
          <Text className="text-xs text-text-secondary mb-4">
            Rate your daily performance
          </Text>

          <View className="flex-row items-end h-28 border-b border-border pb-2">
            {getWeekDayLabels().map((dayLabel, index) => (
              <PerformanceBar
                key={`perf-${index}`}
                rating={getPerformanceForDay(index)}
                dayLabel={dayLabel}
              />
            ))}
          </View>

          <TouchableOpacity
            className="bg-primary/10 rounded-button py-2.5 items-center mt-3"
            onPress={async () => {
              try {
                await habitsService.ratePerformance(8);
                Alert.alert('Rated!', 'Performance logged for today.');
                loadData();
              } catch {
                Alert.alert('Error', 'Failed to rate performance.');
              }
            }}
            activeOpacity={0.7}
          >
            <Text className="text-primary font-semibold text-sm">
              Rate Today
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Affirmation */}
        {data?.dailyQuote && (
          <View className="mx-6 mb-4 p-5 bg-primary/5 rounded-card border border-primary/20">
            <Text className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">
              Daily Affirmation
            </Text>
            <Text className="text-base font-serif text-text-primary leading-6 italic">
              "{data.dailyQuote.quote_text}"
            </Text>
            <Text className="text-sm text-text-secondary mt-3">
              — {data.dailyQuote.author || 'Unknown'}
            </Text>
          </View>
        )}

        {/* Vision Board */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-base font-bold text-text-primary">
              Vision Board
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Add Image',
                  'Image picker will be integrated with device camera/gallery.',
                );
              }}
            >
              <Text className="text-accent text-sm font-semibold">
                + Add
              </Text>
            </TouchableOpacity>
          </View>

          {data && data.visionBoard.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              data={data.visionBoard}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface border border-border rounded-card w-36 h-44 mr-3 overflow-hidden">
                  <View className="flex-1 bg-primary/10 items-center justify-center">
                    <Text className="text-3xl">{'\u{1F5BC}'}</Text>
                  </View>
                  {item.caption && (
                    <View className="p-2">
                      <Text
                        className="text-xs text-text-secondary"
                        numberOfLines={2}
                      >
                        {item.caption}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          ) : (
            <View className="mx-6 bg-surface border border-dashed border-border rounded-card py-8 items-center">
              <Text className="text-2xl mb-2">{'\u{1F5BC}'}</Text>
              <Text className="text-sm text-text-secondary">
                Add images to your vision board
              </Text>
            </View>
          )}
        </View>

        {/* Day Journey */}
        <View className="mb-4">
          <Text className="text-base font-bold text-text-primary px-6 mb-3">
            Day Journey
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            data={DAY_PERIODS}
            keyExtractor={(item) => item.period}
            renderItem={({ item }) => {
              const journeyEntry = data?.dayJourney.find(
                (j) => j.period === item.period,
              );
              const isCompleted = journeyEntry?.completed ?? false;

              return (
                <View
                  className={`w-40 mr-3 rounded-card border p-4 ${
                    isCompleted
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-2xl mb-2">{item.icon}</Text>
                  <Text className="text-sm font-bold text-text-primary mb-0.5">
                    {item.label}
                  </Text>
                  <Text className="text-xs text-text-secondary mb-2">
                    {item.timeRange}
                  </Text>
                  {isCompleted ? (
                    <View className="bg-accent rounded-pill px-2 py-0.5 self-start">
                      <Text className="text-white text-xs font-semibold">
                        Done
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-gray-100 rounded-pill px-2 py-0.5 self-start">
                      <Text className="text-text-secondary text-xs">
                        Pending
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JourneyMain;
