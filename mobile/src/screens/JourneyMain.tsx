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
  StyleSheet,
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
    style={[s.skeletonBlock, { height }]}
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
    <View style={s.perfBarWrap}>
      <View
        style={[s.perfBar, { height: barHeight }]}
      />
      <Text style={s.perfBarLabel}>{dayLabel}</Text>
    </View>
  );
};

const JourneyMain = () => {
  const navigation = useNavigation<JourneyNav>();
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Local-only state so the "Log Today" button works even without backend connectivity
  const [localLogs, setLocalLogs] = useState<Record<string, Set<string>>>({
    meditation: new Set(),
    exercise: new Set(),
    cold_shower: new Set(),
    early_wakeup: new Set(),
  });
  const [localStreaks, setLocalStreaks] = useState<Record<string, number>>({
    meditation: 0,
    exercise: 0,
    cold_shower: 0,
    early_wakeup: 0,
  });

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
      const today = new Date().toISOString().split('T')[0];
      const alreadyLogged = localLogs[habitType]?.has(today);

      if (alreadyLogged) {
        Alert.alert('Already Logged', 'You already logged this habit today.');
        return;
      }

      // Update local state immediately for responsive UX
      setLocalLogs((prev) => {
        const next = { ...prev };
        const set = new Set(next[habitType] || []);
        set.add(today);
        next[habitType] = set;
        return next;
      });
      setLocalStreaks((prev) => ({
        ...prev,
        [habitType]: (prev[habitType] || 0) + 1,
      }));

      const habitName = HABITS.find((h) => h.type === habitType)?.name || habitType;
      Alert.alert('Logged!', `${habitName} logged for today. Keep it up!`);

      // Best-effort backend sync — don't fail if offline
      habitsService.logHabit(habitType, { completed: true }).catch(() => {
        // Silent fail — local state already updated
      });
    },
    [localLogs],
  );

  const getHabitLogs = (
    habitType: string,
  ): Array<{ date: string; completed: boolean }> => {
    const remoteLogs = data
      ? data.habitLogs
          .filter((log) => log.habit_type === habitType)
          .map((log) => ({
            date: log.logged_at,
            completed: log.completed,
          }))
      : [];
    // Merge local logs — local takes precedence
    const localSet = localLogs[habitType] || new Set();
    const localOnly = Array.from(localSet).map((date) => ({ date, completed: true }));
    const seen = new Set(localOnly.map((l) => l.date));
    return [...localOnly, ...remoteLogs.filter((l) => !seen.has(l.date))];
  };

  const getStreakCount = (habitType: string): number => {
    const remote = data?.streaks[habitType]?.current_streak ?? 0;
    const local = localStreaks[habitType] ?? 0;
    return Math.max(remote, local);
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
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
          <View style={s.skeletonHeaderWrap}>
            <View style={s.skeletonHeaderBar} />
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
    <SafeAreaView style={s.container} edges={['top']}>
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
        <View style={s.headerWrap}>
          <Text style={s.headerTitle}>
            My Journey
          </Text>
          <Text style={s.headerSubtitle}>
            Track your daily sadhana
          </Text>
        </View>

        {/* Start Meditation button */}
        <TouchableOpacity
          style={s.meditationCta}
          onPress={() => navigation.navigate('MeditationTimer')}
          activeOpacity={0.8}
        >
          <View style={s.meditationCtaLeft}>
            <Text style={s.meditationCtaIcon}>{'\u{1F9D8}'}</Text>
            <View>
              <Text style={s.meditationCtaTitle}>
                Start Meditation
              </Text>
              <Text style={s.meditationCtaSubtitle}>
                Begin your daily practice
              </Text>
            </View>
          </View>
          <View style={s.meditationCtaPlayWrap}>
            <Text style={s.meditationCtaPlayText}>{'\u25B6'}</Text>
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
        <View style={s.perfCard}>
          <Text style={s.perfCardTitle}>
            Performance Tracker
          </Text>
          <Text style={s.perfCardSubtitle}>
            Rate your daily performance
          </Text>

          <View style={s.perfChartRow}>
            {getWeekDayLabels().map((dayLabel, index) => (
              <PerformanceBar
                key={`perf-${index}`}
                rating={getPerformanceForDay(index)}
                dayLabel={dayLabel}
              />
            ))}
          </View>

          <TouchableOpacity
            style={s.rateTodayButton}
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
            <Text style={s.rateTodayText}>
              Rate Today
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Affirmation */}
        {data?.dailyQuote && (
          <View style={s.affirmationCard}>
            <Text style={s.affirmationLabel}>
              Daily Affirmation
            </Text>
            <Text style={s.affirmationQuote}>
              "{data.dailyQuote.quote_text}"
            </Text>
            <Text style={s.affirmationAuthor}>
              — {data.dailyQuote.author || 'Unknown'}
            </Text>
          </View>
        )}

        {/* Vision Board */}
        <View style={s.visionBoardSection}>
          <View style={s.visionBoardHeader}>
            <Text style={s.visionBoardTitle}>
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
              <Text style={s.visionBoardAdd}>
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
                <View style={s.visionCard}>
                  <View style={s.visionCardImage}>
                    <Text style={s.visionCardIcon}>{'\u{1F5BC}'}</Text>
                  </View>
                  {item.caption && (
                    <View style={s.visionCardCaption}>
                      <Text
                        style={s.visionCardCaptionText}
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
            <View style={s.visionBoardEmpty}>
              <Text style={s.visionBoardEmptyIcon}>{'\u{1F5BC}'}</Text>
              <Text style={s.visionBoardEmptyText}>
                Add images to your vision board
              </Text>
            </View>
          )}
        </View>

        {/* Day Journey */}
        <View style={s.dayJourneySection}>
          <Text style={s.dayJourneyTitle}>
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
                  style={[
                    s.dayJourneyCard,
                    isCompleted
                      ? s.dayJourneyCardCompleted
                      : s.dayJourneyCardPending,
                  ]}
                >
                  <Text style={s.dayJourneyCardIcon}>{item.icon}</Text>
                  <Text style={s.dayJourneyCardLabel}>
                    {item.label}
                  </Text>
                  <Text style={s.dayJourneyCardTime}>
                    {item.timeRange}
                  </Text>
                  {isCompleted ? (
                    <View style={s.dayJourneyBadgeDone}>
                      <Text style={s.dayJourneyBadgeDoneText}>
                        Done
                      </Text>
                    </View>
                  ) : (
                    <View style={s.dayJourneyBadgePending}>
                      <Text style={s.dayJourneyBadgePendingText}>
                        Pending
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JourneyMain;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  flex1: {
    flex: 1,
  },
  skeletonBlock: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  skeletonHeaderWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skeletonHeaderBar: {
    backgroundColor: '#E5E7EB',
    height: 32,
    width: 160,
    borderRadius: 12,
  },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B4332',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  meditationCta: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#1B4332',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meditationCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meditationCtaIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  meditationCtaTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  meditationCtaSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  meditationCtaPlayWrap: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meditationCtaPlayText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  perfCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
  },
  perfCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  perfCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  perfChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 112,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  perfBarWrap: {
    alignItems: 'center',
    flex: 1,
  },
  perfBar: {
    width: 24,
    backgroundColor: '#40916C',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  perfBarLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  rateTodayButton: {
    backgroundColor: 'rgba(27,67,50,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  rateTodayText: {
    color: '#1B4332',
    fontWeight: '600',
    fontSize: 14,
  },
  affirmationCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(27,67,50,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27,67,50,0.2)',
  },
  affirmationLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#40916C',
    marginBottom: 12,
    fontWeight: '600',
  },
  affirmationQuote: {
    fontSize: 16,
    color: '#1A1A2E',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  affirmationAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  visionBoardSection: {
    marginBottom: 16,
  },
  visionBoardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  visionBoardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  visionBoardAdd: {
    color: '#40916C',
    fontSize: 14,
    fontWeight: '600',
  },
  visionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    width: 144,
    height: 176,
    marginRight: 12,
    overflow: 'hidden',
  },
  visionCardImage: {
    flex: 1,
    backgroundColor: 'rgba(27,67,50,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionCardIcon: {
    fontSize: 30,
  },
  visionCardCaption: {
    padding: 8,
  },
  visionCardCaptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  visionBoardEmpty: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
  },
  visionBoardEmptyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  visionBoardEmptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dayJourneySection: {
    marginBottom: 16,
  },
  dayJourneyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  dayJourneyCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  dayJourneyCardCompleted: {
    backgroundColor: 'rgba(64,145,108,0.1)',
    borderColor: 'rgba(64,145,108,0.3)',
  },
  dayJourneyCardPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  dayJourneyCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dayJourneyCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  dayJourneyCardTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  dayJourneyBadgeDone: {
    backgroundColor: '#40916C',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dayJourneyBadgeDoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dayJourneyBadgePending: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dayJourneyBadgePendingText: {
    color: '#6B7280',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});
