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
  Modal,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HabitGrid } from '../components/journey/HabitGrid';
import { ErrorBanner } from '../components/shared/ErrorBanner';
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
  icon: any;
}

const HABITS: HabitConfig[] = [
  { type: 'meditation', name: 'Meditation', icon: require('../assets/icons/New folder/Yoga.png') },
  { type: 'exercise', name: 'Exercise', icon: require('../assets/icons/New folder/Exercise.png') },
  { type: 'cold_shower', name: 'Cold Shower', icon: require('../assets/icons/New folder/Shower.png') },
  { type: 'early_wakeup', name: 'Early Wakeup', icon: require('../assets/icons/New folder/Clock.png') },
];

const DAY_PERIODS: Array<{
  period: 'morning' | 'afternoon' | 'night';
  label: string;
  timeRange: string;
  icon: any;
}> = [
  { period: 'morning', label: 'Morning', timeRange: '5:00 - 12:00', icon: require('../assets/icons/New folder/Morning.png') },
  { period: 'afternoon', label: 'Afternoon', timeRange: '12:00 - 18:00', icon: require('../assets/icons/New folder/Afternoon.png') },
  { period: 'night', label: 'Night', timeRange: '18:00 - 22:00', icon: require('../assets/icons/New folder/Night.png') },
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
  const [loadError, setLoadError] = useState<string | null>(null);
  // Local-only state so the "Log Today" button works even without backend connectivity
  const [localLogs, setLocalLogs] = useState<Record<string, Record<string, boolean>>>({
    meditation: {},
    exercise: {},
    cold_shower: {},
    early_wakeup: {},
  });
  const [localStreaks, setLocalStreaks] = useState<Record<string, number>>({
    meditation: 0,
    exercise: 0,
    cold_shower: 0,
    early_wakeup: 0,
  });
  // Local-only state so Rate Today and Vision Board Add work even without backend
  const [localRatings, setLocalRatings] = useState<Record<string, number>>({});
  const [localVisionImages, setLocalVisionImages] = useState<
    Array<{ id: string; icon: string; caption: string }>
  >([]);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [visionModalOpen, setVisionModalOpen] = useState(false);
  const [ratedAlertOpen, setRatedAlertOpen] = useState(false);
  const [ratedRatingValue, setRatedRatingValue] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        habitsService.getAllHabits(),
        habitsService.getWeeklyPerformance(),
        homeService.getHomeFeed(),
        habitsService.getVisionBoard(),
        habitsService.getDayJourney(),
      ]);
      const [habitsData, perfData, feedData, visionData, journeyData] = results;

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
        habitLogs: habits.logs || [],
        streaks: habits.streaks || {},
        weeklyPerformance: perf || [],
        dailyQuote: feed?.dailyQuote ?? null,
        visionBoard: vision || [],
        dayJourney: journey || [],
      });

      // Track which sub-fetches failed so we can show one consolidated banner
      // instead of swallowing the failures silently.
      const failed = results
        .map((r, i) => (r.status === 'rejected' ? i : -1))
        .filter((i) => i >= 0);
      if (failed.length === results.length) {
        setLoadError("Couldn't reach the backend. Pull to refresh once you're connected.");
      } else if (failed.length > 0) {
        setLoadError('Some sections of your journey failed to load. Pull to refresh to try again.');
      } else {
        setLoadError(null);
      }
      if (__DEV__ && failed.length > 0) {
        const sectionNames = ['habits', 'performance', 'feed', 'vision-board', 'day-journey'];
        failed.forEach((i) =>
          console.warn(`[Journey] ${sectionNames[i]} fetch failed:`, (results[i] as PromiseRejectedResult).reason),
        );
      }
    } catch (err) {
      if (__DEV__) console.warn('[Journey] Unexpected loadData error:', err);
      setLoadError('Something went wrong loading your journey. Pull to refresh.');
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
      const alreadyLogged = localLogs[habitType]?.[today] === true;

      if (alreadyLogged) {
        Alert.alert('Already Logged', 'You already logged this habit today.');
        return;
      }

      // Update local state immediately for responsive UX
      setLocalLogs((prev) => {
        const next = { ...prev };
        next[habitType] = { ...next[habitType], [today]: true };
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

  const getHabitLogs = useCallback(
    (habitType: string): Array<{ date: string; completed: boolean }> => {
      const logsArray = Array.isArray(data?.habitLogs) ? data.habitLogs : [];

      const remoteLogs = logsArray
        .filter((log) => log && log.habit_type === habitType)
        .map((log) => ({
          date: log.logged_at,
          completed: log.completed,
        }));

      const localMap = localLogs[habitType] || {};
      const mergedMap = new Map<string, boolean>();

      for (const log of remoteLogs) {
        mergedMap.set(log.date, log.completed);
      }
      for (const [dateStr, isCompleted] of Object.entries(localMap)) {
        mergedMap.set(dateStr, isCompleted);
      }

      return Array.from(mergedMap.entries()).map(([date, completed]) => ({
        date,
        completed,
      }));
    },
    [data, localLogs],
  );

  const handleToggleHabitDate = useCallback(
    async (habitType: string, dateStr: string) => {
      const currentLogs = getHabitLogs(habitType);
      const wasCompleted = currentLogs.find((l) => l.date === dateStr)?.completed ?? false;
      const nextCompleted = !wasCompleted;

      // Update local state immediately for instant responsive UI feedback
      setLocalLogs((prev) => {
        const next = { ...prev };
        next[habitType] = { ...next[habitType], [dateStr]: nextCompleted };
        return next;
      });

      // Adjust streak count based on toggle
      setLocalStreaks((prev) => {
        const currentStreak = prev[habitType] || 0;
        return {
          ...prev,
          [habitType]: nextCompleted ? currentStreak + 1 : Math.max(0, currentStreak - 1),
        };
      });

      // Best-effort backend sync — don't fail if offline
      try {
        await habitsService.logHabit(habitType, { completed: nextCompleted, logged_at: dateStr } as any);
      } catch {
        // Silent fail — local state already holds the true value
      }
    },
    [getHabitLogs],
  );

  const getStreakCount = (habitType: string): number => {
    const remote = data?.streaks?.[habitType]?.current_streak ?? 0;
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
    const d = new Date();
    d.setDate(d.getDate() - (6 - daysAgo));
    const dateStr = d.toISOString().split('T')[0];
    
    const local = localRatings[dateStr];
    if (local !== undefined) return local;

    const perfArray = Array.isArray(data?.weeklyPerformance) ? data.weeklyPerformance : [];
    if (perfArray.length === 0) return 0;

    const entry = perfArray.find((p) => p && p.rated_at === dateStr);
    return entry?.rating ?? 0;
  };

  const handleRateToday = useCallback(
    (rating: number) => {
      const today = new Date().toISOString().split('T')[0];
      setLocalRatings((prev) => ({ ...prev, [today]: rating }));
      setRatingModalOpen(false);
      setRatedRatingValue(rating);
      setRatedAlertOpen(true);
      // Best-effort backend sync — don't fail on offline
      habitsService.ratePerformance(rating).catch(() => {});
    },
    [],
  );

  const addVisionImage = useCallback(
    (icon: string, caption: string) => {
      const id = `vision-${Date.now()}`;
      setLocalVisionImages((prev) => [...prev, { id, icon, caption }]);
      setVisionModalOpen(false);
    },
    [],
  );

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
        contentContainerStyle={s.scrollContent}
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
        <View style={s.headerWrap}>
          <Text style={s.headerTitle}>
            My Journey
          </Text>
          <Text style={s.headerSubtitle}>
            Track your daily sadhana
          </Text>
        </View>

        {loadError ? <ErrorBanner message={loadError} onRetry={loadData} /> : null}

        {/* Start Meditation Giant CTA */}
        <TouchableOpacity
          style={s.meditationCta}
          onPress={() => navigation.navigate('MeditationTimer')}
          activeOpacity={0.85}
        >
          <View style={s.meditationCtaContent}>
            <View style={s.meditationCtaIconWrap}>
              <Image source={require('../assets/icons/New folder/Yoga.png')} style={s.meditationCtaIconImage} />
            </View>
            <View style={s.meditationCtaTextWrap}>
              <Text style={s.meditationCtaTitle}>
                Start Meditation
              </Text>
              <Text style={s.meditationCtaSubtitle}>
                Find your center. Begin your daily practice now.
              </Text>
            </View>
          </View>
          <View style={s.meditationCtaPlayWrap}>
            <Text style={s.meditationCtaPlayText}>{'\u25B6'}   BEGIN</Text>
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
            onToggleDate={(dateStr) => handleToggleHabitDate(habit.type, dateStr)}
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
            onPress={() => setRatingModalOpen(true)}
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
            <TouchableOpacity onPress={() => setVisionModalOpen(true)}>
              <Text style={s.visionBoardAdd}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>

          {(() => {
            const remoteItems = (data?.visionBoard ?? []).map((v) => ({
              id: v.id,
              icon: require('../assets/icons/New folder/Vision Board.png'),
              caption: v.caption ?? '',
            }));
            const combined = [...localVisionImages, ...remoteItems];
            return combined.length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.horizontalListPadding}
                data={combined}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={s.visionCard}>
                    <View style={s.visionCardImage}>
                      {typeof item.icon === 'string' ? (
                        <Text style={s.visionCardIcon}>{item.icon}</Text>
                      ) : (
                        <Image source={item.icon} style={s.visionCardIconImage} />
                      )}
                    </View>
                    {!!item.caption && (
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
                <Image source={require('../assets/icons/New folder/Vision Board.png')} style={s.visionBoardEmptyIconImage} />
                <Text style={s.visionBoardEmptyText}>
                  Add images to your vision board
                </Text>
              </View>
            );
          })()}
        </View>

        {/* Day Journey */}
        <View style={s.dayJourneySection}>
          <Text style={s.dayJourneyTitle}>
            Day Journey
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.horizontalListPadding}
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
                  {typeof item.icon === 'string' ? (
                    <Text style={s.dayJourneyCardIcon}>{item.icon}</Text>
                  ) : (
                    <Image source={item.icon} style={s.dayJourneyCardIconImage} />
                  )}
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

      {/* Rating Modal */}
      <Modal
        visible={ratingModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Rate Today</Text>
            <Text style={s.modalSubtitle}>
              How was your practice today? Tap a number from 1 to 10.
            </Text>
            <View style={s.ratingGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={s.ratingChip}
                  onPress={() => handleRateToday(n)}
                  activeOpacity={0.7}
                >
                  <Text style={s.ratingChipText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => setRatingModalOpen(false)}
            >
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rated! Success Modal */}
      <Modal
        visible={ratedAlertOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRatedAlertOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { alignItems: 'center', padding: 24 }]}>
            <View style={s.modalCheckWrap}>
              <Text style={s.modalCheckIcon}>{'\u{2713}'}</Text>
            </View>
            <Text style={[s.modalTitle, { textAlign: 'center' }]}>Rated!</Text>
            <Text style={s.modalBody}>
              Today's performance logged as {ratedRatingValue}/10. Keep it up!
            </Text>
            <TouchableOpacity
              onPress={() => setRatedAlertOpen(false)}
              style={s.modalButton}
              activeOpacity={0.8}
            >
              <Text style={s.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vision Board Add Modal */}
      <Modal
        visible={visionModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setVisionModalOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Add to Vision Board</Text>
            <Text style={s.modalSubtitle}>
              Pick an intention for your board.
            </Text>
            <View style={s.visionPresetGrid}>
              {[
                { icon: '\u{1F9D8}', caption: 'Inner Peace' },
                { icon: '\u{1F33F}', caption: 'Growth' },
                { icon: '\u{1F31E}', caption: 'Joy' },
                { icon: '\u{1F4AA}', caption: 'Strength' },
                { icon: '\u{1F4DA}', caption: 'Wisdom' },
                { icon: '\u{1F3AF}', caption: 'Focus' },
                { icon: '\u{1F64F}', caption: 'Gratitude' },
                { icon: '\u{2764}', caption: 'Love' },
                { icon: '\u{2728}', caption: 'Clarity' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.caption}
                  style={s.visionPresetItem}
                  onPress={() => addVisionImage(item.icon, item.caption)}
                  activeOpacity={0.7}
                >
                  <Text style={s.visionPresetIcon}>{item.icon}</Text>
                  <Text style={s.visionPresetCaption}>{item.caption}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => setVisionModalOpen(false)}
            >
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JourneyMain;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EE',
  },
  horizontalListPadding: { paddingHorizontal: 24 },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  skeletonBlock: {
    backgroundColor: 'rgba(240, 127, 46, 0.12)',
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
    backgroundColor: 'rgba(240, 127, 46, 0.12)',
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
    color: '#5C250E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#87553E',
    marginTop: 4,
  },
  meditationCta: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#ED7624',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  meditationCtaContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  meditationCtaIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  meditationCtaIcon: {
    fontSize: 48,
  },
  meditationCtaIconImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  meditationCtaTextWrap: {
    alignItems: 'center',
  },
  meditationCtaTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 8,
    textAlign: 'center',
  },
  meditationCtaSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  meditationCtaPlayWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  meditationCtaPlayText: {
    color: '#ED7624',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  perfCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
  },
  perfCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C250E',
    marginBottom: 4,
  },
  perfCardSubtitle: {
    fontSize: 12,
    color: '#87553E',
    marginBottom: 16,
  },
  perfChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 112,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 127, 46, 0.12)',
    paddingBottom: 8,
  },
  perfBarWrap: {
    alignItems: 'center',
    flex: 1,
  },
  perfBar: {
    width: 24,
    backgroundColor: '#ED7624',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  perfBarLabel: {
    fontSize: 12,
    color: '#87553E',
    marginTop: 4,
  },
  rateTodayButton: {
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  rateTodayText: {
    color: '#5C250E',
    fontWeight: '600',
    fontSize: 14,
  },
  affirmationCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.15)',
  },
  affirmationLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#ED7624',
    marginBottom: 12,
    fontWeight: '600',
  },
  affirmationQuote: {
    fontSize: 16,
    color: '#5C250E',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  affirmationAuthor: {
    fontSize: 14,
    color: '#87553E',
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
    color: '#5C250E',
  },
  visionBoardAdd: {
    color: '#ED7624',
    fontSize: 14,
    fontWeight: '600',
  },
  visionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    borderRadius: 12,
    width: 144,
    height: 176,
    marginRight: 12,
    overflow: 'hidden',
  },
  visionCardImage: {
    flex: 1,
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionCardIcon: {
    fontSize: 30,
  },
  visionCardIconImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  visionCardCaption: {
    padding: 8,
  },
  visionCardCaptionText: {
    fontSize: 12,
    color: '#87553E',
  },
  visionBoardEmpty: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(240, 127, 46, 0.12)',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
  },
  visionBoardEmptyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  visionBoardEmptyIconImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  visionBoardEmptyText: {
    fontSize: 14,
    color: '#87553E',
  },
  dayJourneySection: {
    marginBottom: 16,
  },
  dayJourneyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C250E',
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
    borderColor: 'rgba(240, 127, 46, 0.12)',
  },
  dayJourneyCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dayJourneyCardIconImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  dayJourneyCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C250E',
    marginBottom: 2,
  },
  dayJourneyCardTime: {
    fontSize: 12,
    color: '#87553E',
    marginBottom: 8,
  },
  dayJourneyBadgeDone: {
    backgroundColor: '#ED7624',
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
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dayJourneyBadgePendingText: {
    color: '#87553E',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C250E',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#87553E',
    marginBottom: 16,
    lineHeight: 18,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingChip: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(240, 127, 46, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingChipText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C250E',
  },
  visionPresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  visionPresetItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 127, 46, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  visionPresetIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  visionPresetCaption: {
    fontSize: 11,
    color: '#5C250E',
    fontWeight: '600',
  },
  modalCancel: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
  },
  modalCancelText: {
    color: '#87553E',
    fontWeight: '600',
    fontSize: 14,
  },
  modalCheckWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(240, 127, 46, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalCheckIcon: {
    fontSize: 30,
    color: '#ED7624',
  },
  modalBody: {
    fontSize: 14,
    color: '#87553E',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#ED7624',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
