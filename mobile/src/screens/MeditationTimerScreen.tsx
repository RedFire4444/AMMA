/**
 * File: MeditationTimerScreen.tsx
 *
 * Description: Full-screen meditation timer with animated countdown circle,
 * ambient sound selection, session type picker, and session logging on completion.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TimerCircle } from '../components/meditation/TimerCircle';
import { BreathingGuide } from '../components/meditation/BreathingGuide';
import { useMeditationStore } from '../store/meditationStore';
import { meditationService } from '../services/meditation.service';
import { JourneyStackParamList } from '../navigation/types';
import { audioService, SoundKey } from '../services/audio.service';

type TimerNav = NativeStackNavigationProp<JourneyStackParamList, 'MeditationTimer'>;

interface GuidedSession {
  id: string;
  title: string;
  durationSeconds: number;
  emoji: string;
  description: string;
  soundKey: SoundKey;
}

const GUIDED_SESSIONS: GuidedSession[] = [
  {
    id: 'clarity',
    title: 'Morning Clarity',
    durationSeconds: 80, // Exactly 1m 20s as per the wav file length
    emoji: '\u{1F305}',
    description: 'Awaken your mind and find focus.',
    soundKey: 'morning_clarity',
  },
  {
    id: 'anxiety',
    title: 'Anxiety Relief',
    durationSeconds: 40, // Exactly 40s as per the wav file length
    emoji: '\u{1F343}',
    description: 'Calm your nervous system.',
    soundKey: 'anxiety_relief',
  },
  {
    id: 'sleep',
    title: 'Deep Sleep',
    durationSeconds: 40, // Exactly 40s as per the wav file length
    emoji: '\u{1F30C}',
    description: 'Drift off into restful sleep.',
    soundKey: 'deep_sleep',
  },
  {
    id: 'focus',
    title: 'Mindful Focus',
    durationSeconds: 80, // Temporarily matching morning clarity wav file length
    emoji: '\u{1F9E0}',
    description: 'Sharpen your concentration.',
    soundKey: 'mindful_focus',
  },
];

const formatGuidedDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
};

interface BreathingPhase {
  phase: 'inhale' | 'hold' | 'exhale' | 'hold_out';
  duration: number;
}

interface BreathingPattern {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sequence: BreathingPhase[];
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    title: 'Box Breathing',
    emoji: '\u{1F4E6}',
    description: 'Equal 4s inhale, hold, exhale, hold ratios for deep focus.',
    sequence: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'hold_out', duration: 4 },
    ],
  },
  {
    id: 'relax',
    title: '4-7-8 Relax',
    emoji: '\u{1F343}',
    description: 'A natural tranquilizer that deeply settles the nervous system.',
    sequence: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 },
    ],
  },
  {
    id: 'equal',
    title: 'Equal Balance',
    emoji: '\u{2616}',
    description: 'Simple equal 4s inhale and exhale breaths to center yourself.',
    sequence: [
      { phase: 'inhale', duration: 4 },
      { phase: 'exhale', duration: 4 },
    ],
  },
];

const DURATION_PRESETS = [3, 5, 10, 15, 20, 30] as const;

type SoundOption = 'nature' | 'rain' | 'ocean' | 'birds' | 'bowl';
type SessionType = 'free' | 'guided' | 'breathing';

const SOUND_OPTIONS: Array<{ key: SoundOption; label: string; icon: string }> = [
  { key: 'nature', label: 'Nature', icon: '\u{1F333}' },
  { key: 'rain', label: 'Rain', icon: '\u{1F327}' },
  { key: 'ocean', label: 'Ocean', icon: '\u{1F30A}' },
  { key: 'birds', label: 'Birds', icon: '\u{1F426}' },
  { key: 'bowl', label: 'Bowl', icon: '\u{1F3B6}' },
];

const SESSION_TYPES: Array<{ key: SessionType; label: string }> = [
  { key: 'free', label: 'Free' },
  { key: 'guided', label: 'Guided' },
  { key: 'breathing', label: 'Breathing' },
];

// Animated bars that pulse while a sound is selected \u2014 visual confirmation that
// playback is active. Actual audio playback requires a configured audio CDN.
const SoundWaveIndicator = ({
  soundLabel,
  isPaused,
  onToggle,
}: {
  soundLabel: string;
  isPaused: boolean;
  onToggle: () => void;
}) => {
  const bars = useRef([0, 0, 0, 0].map(() => new Animated.Value(0.3))).current;
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (isPaused) {
      loopsRef.current.forEach((l) => l.stop());
      // Reset bars to resting state when paused
      bars.forEach((bar) =>
        Animated.timing(bar, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }).start()
      );
      return;
    }

    loopsRef.current = bars.map((bar, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1,
            duration: 500 + i * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 500 + i * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loopsRef.current.forEach((l) => l.stop());
  }, [bars, isPaused]);

  return (
    <TouchableOpacity
      style={waveStyles.wrap}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={waveStyles.barsRow}>
        {bars.map((bar, i) => (
          <Animated.View
            key={i}
            style={[
              waveStyles.bar,
              {
                transform: [{ scaleY: bar }],
                opacity: bar.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.5, 1],
                }),
                backgroundColor: isPaused ? 'rgba(255,255,255,0.4)' : '#52B788',
              },
            ]}
          />
        ))}
      </View>
      <Text style={waveStyles.label}>
        {isPaused ? `Paused: ${soundLabel}` : `Now playing: ${soundLabel}`}
      </Text>
    </TouchableOpacity>
  );
};

const waveStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(64,145,108,0.15)',
    borderRadius: 999,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    marginRight: 8,
  },
  bar: {
    width: 3,
    height: 16,
    backgroundColor: '#52B788',
    borderRadius: 2,
    marginHorizontal: 1.5,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
});

const MeditationTimerScreen = () => {
  const navigation = useNavigation<TimerNav>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const [selectedGuidedId, setSelectedGuidedId] = useState<string>('clarity');
  const [selectedBreathingPatternId, setSelectedBreathingPatternId] = useState<string>('box');

  useEffect(() => {
    isMountedRef.current = true;

    // Stop audio immediately if screen loses focus/user navigates away
    const unsubscribe = navigation.addListener('blur', () => {
      audioService.stop();
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      // Always stop audio when screen unmounts
      audioService.stop();
    };
  }, [navigation]);

  const {
    duration,
    remaining,
    isRunning,
    isPaused,
    selectedSound,
    sessionType,
    startedAt,
    setDuration,
    setSound,
    setSessionType,
    start,
    pause,
    resume,
    stop,
    tick,
    reset,
    isEndless,
    elapsedTime,
    intervalChimeEnabled,
    setIntervalChime,
  } = useMeditationStore();

  const selectedMinutes = isEndless ? '\u221E' : duration / 60;

  const handleSoundSelect = useCallback(
    (key: SoundOption) => {
      setSound(key);
      setIsPreviewPaused(false);
    },
    [setSound]
  );

  const getActiveSoundKey = useCallback((): SoundKey | null => {
    if (sessionType === 'guided') {
      const activeSession = GUIDED_SESSIONS.find((s) => s.id === selectedGuidedId);
      return activeSession ? activeSession.soundKey : null;
    }
    return selectedSound ? (selectedSound as SoundKey) : null;
  }, [sessionType, selectedGuidedId, selectedSound]);

  useEffect(() => {
    if (sessionType === 'guided') {
      const activeSession = GUIDED_SESSIONS.find((s) => s.id === selectedGuidedId);
      if (activeSession) {
        setDuration(activeSession.durationSeconds / 60);
      }
    }
  }, [sessionType, selectedGuidedId, setDuration]);

  useEffect(() => {
    if (sessionType === 'breathing') {
      setDuration(2);
    }
  }, [sessionType, setDuration]);

  // -- Audio: play sound immediately when selected, pause if preview paused --
  useEffect(() => {
    // We do NOT want to preview guided voice tracks beforehand
    if (sessionType === 'guided') {
      audioService.stop();
      return;
    }

    const activeKey = getActiveSoundKey();
    if (isPreviewPaused) {
      audioService.pause();
    } else if (showCompletion) {
      audioService.stop();
    } else if (activeKey) {
      audioService.play(activeKey);
    }
  }, [getActiveSoundKey, showCompletion, isPreviewPaused, sessionType]);

  // -- Audio: handle guided mode pause/resume strictly tied to the timer state --
  useEffect(() => {
    if (sessionType === 'guided' || sessionType === 'breathing') {
      if (isPaused) {
        audioService.pause();
      } else if (isRunning) {
        const activeKey = getActiveSoundKey();
        if (activeKey) {
          audioService.play(activeKey);
        }
      }
    }
  }, [sessionType, isRunning, isPaused, getActiveSoundKey]);

  // Countdown interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tick]);

  // Trigger interval chime every 5 minutes
  useEffect(() => {
    if (isRunning && intervalChimeEnabled && elapsedTime > 0 && elapsedTime % 300 === 0) {
      audioService.playChime();
    }
  }, [isRunning, elapsedTime, intervalChimeEnabled]);

  // Detect completion
  useEffect(() => {
    if (!isEndless && remaining === 0 && startedAt && !isRunning && !isPaused) {
      handleCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCompletion is defined below and stable via useCallback
  }, [remaining, startedAt, isRunning, isPaused, isEndless]);

  const handleCompletion = useCallback(async () => {
    if (!startedAt) return;

    // Stop ambient sound on completion
    audioService.stop();
    // Play completion chime
    if (intervalChimeEnabled) {
      audioService.playChime();
    }

    if (isMountedRef.current) setShowCompletion(true);

    try {
      const durationMinutes = duration / 60;
      // Backend createSession also auto-logs the meditation habit, so
      // we don't separately POST to /habits/log here.
      await meditationService.logSession({
        duration_minutes: durationMinutes,
        session_type: sessionType,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      // Session logging is best-effort — never block the user.
      if (__DEV__) console.warn('[MeditationTimer] Session log failed:', err);
    }
  }, [startedAt, duration, sessionType]);

  const handleDismissCompletion = useCallback(() => {
    setShowCompletion(false);
    reset();
    navigation.goBack();
  }, [reset, navigation]);

  const handleStart = useCallback(() => {
    start();
    setIsPreviewPaused(false);
    const activeKey = getActiveSoundKey();
    if (activeKey) {
      audioService.play(activeKey, true); // Force replay from start
    }
  }, [start, getActiveSoundKey]);

  const handleStop = useCallback(() => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end this meditation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            stop();
            setIsPreviewPaused(false);
            const activeKey = getActiveSoundKey();
            if (activeKey && sessionType !== 'guided') {
              audioService.play(activeKey, true); // Restart preview from start on setup screen
            } else {
              audioService.stop(); // Strictly stop for guided mode
            }
          },
        },
      ],
    );
  }, [stop, getActiveSoundKey, sessionType]);

  const isActive = isRunning || isPaused;

  if (showCompletion) {
    return (
      <SafeAreaView style={s.darkContainer} edges={['top', 'bottom']}>
        <View style={s.completionWrap}>
          <Text style={s.completionIcon}>{'\u{1F514}'}</Text>
          <Text style={s.completionTitle}>
            Session Complete
          </Text>
          <Text style={s.completionSubtitle}>
            You meditated for {selectedMinutes} minutes
          </Text>
          <Text style={s.completionNote}>
            Your practice has been logged. Namaste.
          </Text>

          <TouchableOpacity
            style={s.doneButton}
            onPress={handleDismissCompletion}
            activeOpacity={0.8}
          >
            <Text style={s.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.darkContainer} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.headerBackButton}
          onPress={() => {
            if (isActive) {
              handleStop();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={s.headerBackText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          Meditation
        </Text>
      </View>

      <ScrollView
        style={s.flex1}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isActive}
        contentContainerStyle={s.scrollContent}
      >
        {/* Timer circle or Breathing guide */}
        <View style={s.timerWrap}>
          {sessionType === 'breathing' ? (
            <BreathingGuide
              isRunning={isRunning}
              isPaused={isPaused}
              pattern={
                BREATHING_PATTERNS.find((p) => p.id === selectedBreathingPatternId) ||
                BREATHING_PATTERNS[0]
              }
            />
          ) : (
            <TimerCircle
              remaining={remaining}
              total={duration}
              isRunning={isRunning}
              isEndless={isEndless}
              elapsedTime={elapsedTime}
            />
          )}
        </View>

        {/* Duration presets */}
        {!isActive && sessionType === 'free' && (
          <View style={s.durationSection}>
            <Text style={s.sectionLabel}>
              Duration (minutes)
            </Text>
            <View style={s.durationRow}>
              {DURATION_PRESETS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    s.durationPreset,
                    selectedMinutes === mins
                      ? s.durationPresetActive
                      : s.durationPresetInactive,
                  ]}
                  onPress={() => setDuration(mins)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.durationPresetText,
                      selectedMinutes === mins
                        ? s.durationPresetTextActive
                        : s.durationPresetTextInactive,
                    ]}
                  >
                    {mins}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Endless Preset */}
              <TouchableOpacity
                style={[
                  s.durationPreset,
                  isEndless ? s.durationPresetActive : s.durationPresetInactive,
                ]}
                onPress={() => setDuration(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.durationPresetText,
                    isEndless ? s.durationPresetTextActive : s.durationPresetTextInactive,
                  ]}
                >
                  {'\u221E'}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* Breathing Duration presets */}
        {!isActive && sessionType === 'breathing' && (
          <View style={s.durationSection}>
            <Text style={s.sectionLabel}>
              Breathing Duration (minutes)
            </Text>
            <View style={s.durationRow}>
              {[2, 5, 10].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    s.durationPreset,
                    selectedMinutes === mins
                      ? s.durationPresetActive
                      : s.durationPresetInactive,
                  ]}
                  onPress={() => setDuration(mins)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.durationPresetText,
                      selectedMinutes === mins
                        ? s.durationPresetTextActive
                        : s.durationPresetTextInactive,
                    ]}
                  >
                    {mins}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Ambient sound picker */}
        {!isActive && sessionType !== 'guided' && (
          <View style={s.soundSection}>
            <Text style={s.sectionLabel}>
              Ambient Sound
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
            >
              {SOUND_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    s.soundOption,
                    selectedSound === opt.key
                      ? s.soundOptionActive
                      : s.soundOptionInactive,
                  ]}
                  onPress={() => handleSoundSelect(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={s.soundOptionIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      s.soundOptionLabel,
                      selectedSound === opt.key
                        ? s.soundOptionLabelActive
                        : s.soundOptionLabelInactive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedSound && (
              <SoundWaveIndicator
                soundLabel={
                  SOUND_OPTIONS.find((o) => o.key === selectedSound)?.label || ''
                }
                isPaused={isPreviewPaused || isPaused}
                onToggle={() => {
                  if (!isActive) {
                    setIsPreviewPaused(!isPreviewPaused);
                  }
                }}
              />
            )}

            {/* Chime Toggle */}
            <TouchableOpacity
              style={s.chimeToggleWrap}
              onPress={() => setIntervalChime(!intervalChimeEnabled)}
              activeOpacity={0.7}
            >
              <Text style={s.chimeToggleIcon}>{intervalChimeEnabled ? '\u{1F514}' : '\u{1F515}'}</Text>
              <Text style={s.chimeToggleText}>
                {intervalChimeEnabled ? 'Interval Chimes: ON' : 'Interval Chimes: OFF'}
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {/* Guided Sessions selector */}
        {!isActive && sessionType === 'guided' && (
          <View style={s.guidedSection}>
            <Text style={s.sectionLabel}>
              Choose a Guided Session
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
            >
              {GUIDED_SESSIONS.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={[
                    s.guidedCard,
                    selectedGuidedId === session.id
                      ? s.guidedCardActive
                      : s.guidedCardInactive,
                  ]}
                  onPress={() => setSelectedGuidedId(session.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.guidedCardEmoji}>{session.emoji}</Text>
                  <View>
                    <Text
                      style={[
                        s.guidedCardTitle,
                        selectedGuidedId === session.id
                          ? s.guidedCardTitleActive
                          : s.guidedCardTitleInactive,
                      ]}
                    >
                      {session.title}
                    </Text>
                    <Text style={s.guidedCardDuration}>
                      {formatGuidedDuration(session.durationSeconds)}
                    </Text>
                    <Text style={s.guidedCardDescription}>
                      {session.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        )}

        {/* Breathing Patterns selector */}
        {!isActive && sessionType === 'breathing' && (
          <View style={s.guidedSection}>
            <Text style={s.sectionLabel}>
              Choose a Breathing Pattern
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalListPadding}
            >
              {BREATHING_PATTERNS.map((pattern) => (
                <TouchableOpacity
                  key={pattern.id}
                  style={[
                    s.guidedCard,
                    selectedBreathingPatternId === pattern.id
                      ? s.guidedCardActive
                      : s.guidedCardInactive,
                  ]}
                  onPress={() => setSelectedBreathingPatternId(pattern.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.guidedCardEmoji}>{pattern.emoji}</Text>
                  <View>
                    <Text
                      style={[
                        s.guidedCardTitle,
                        selectedBreathingPatternId === pattern.id
                          ? s.guidedCardTitleActive
                          : s.guidedCardTitleInactive,
                      ]}
                    >
                      {pattern.title}
                    </Text>
                    <Text style={s.guidedCardDescription}>
                      {pattern.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Session type picker */}
        {!isActive && (
          <View style={s.sessionTypeSection}>
            <Text style={s.sectionLabel}>
              Session Type
            </Text>
            <View style={s.sessionTypeRow}>
              {SESSION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    s.sessionTypeOption,
                    sessionType === type.key ? s.sessionTypeOptionActive : null,
                  ]}
                  onPress={() => setSessionType(type.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.sessionTypeText,
                      sessionType === type.key
                        ? s.sessionTypeTextActive
                        : s.sessionTypeTextInactive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={s.controlsRow}>
          {!isActive ? (
            <TouchableOpacity
              style={s.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={s.startButtonText}>{'\u25B6'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.activeControlsRow}>
              {/* Stop button */}
              <TouchableOpacity
                style={s.stopButton}
                onPress={handleStop}
                activeOpacity={0.8}
              >
                <Text style={s.stopButtonText}>{'\u25A0'}</Text>
              </TouchableOpacity>

              {/* Pause/Resume Timer */}
              <TouchableOpacity
                style={s.startButton}
                onPress={isRunning ? pause : resume}
                activeOpacity={0.8}
              >
                <Text style={s.startButtonText}>
                  {isRunning ? '\u23F8' : '\u25B6'}
                </Text>
              </TouchableOpacity>

              {/* Ambient Sound Toggle */}
              {sessionType !== 'guided' && (
                <TouchableOpacity
                  style={s.ambientToggleButton}
                  onPress={() => setIsPreviewPaused(!isPreviewPaused)}
                  activeOpacity={0.8}
                >
                  <Text style={s.ambientToggleText}>
                    {isPreviewPaused ? '\u{1F507}' : '\u{1F50A}'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MeditationTimerScreen;

const s = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#0B2B1F',
  },
  scrollContent: { alignItems: 'center', paddingBottom: 32 },
  horizontalListPadding: { paddingHorizontal: 24 },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerBackText: {
    fontSize: 18,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  timerWrap: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 12,
  },
  durationSection: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
  },
  durationPreset: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 8,
  },
  durationPresetActive: {
    backgroundColor: '#40916C',
  },
  durationPresetInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  durationPresetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  durationPresetTextActive: {
    color: '#FFFFFF',
  },
  durationPresetTextInactive: {
    color: 'rgba(255,255,255,0.7)',
  },
  soundSection: {
    marginBottom: 24,
    width: '100%',
  },
  soundOption: {
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  soundOptionActive: {
    backgroundColor: 'rgba(64,145,108,0.2)',
    borderColor: '#40916C',
  },
  soundOptionInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  soundOptionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  soundOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  soundOptionLabelActive: {
    color: '#40916C',
  },
  soundOptionLabelInactive: {
    color: 'rgba(255,255,255,0.6)',
  },
  sessionTypeSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    padding: 4,
  },
  sessionTypeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  sessionTypeOptionActive: {
    backgroundColor: '#40916C',
  },
  sessionTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionTypeTextActive: {
    color: '#FFFFFF',
  },
  sessionTypeTextInactive: {
    color: 'rgba(255,255,255,0.6)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  activeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#40916C',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
    marginLeft: 4,
    includeFontPadding: false,
  },
  stopButton: {
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  stopButtonText: {
    fontSize: 20,
    color: '#F87171',
  },
  ambientToggleButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
  },
  ambientToggleText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  completionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completionIcon: {
    fontSize: 48,
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  completionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  completionNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#40916C',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  chimeToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'center',
    borderRadius: 999,
  },
  chimeToggleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  chimeToggleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  guidedSection: {
    marginBottom: 24,
    width: '100%',
  },
  guidedCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  guidedCardActive: {
    backgroundColor: 'rgba(64,145,108,0.2)',
    borderColor: '#40916C',
  },
  guidedCardInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  guidedCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  guidedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  guidedCardTitleActive: {
    color: '#FFFFFF',
  },
  guidedCardTitleInactive: {
    color: 'rgba(255,255,255,0.85)',
  },
  guidedCardDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#40916C',
    marginBottom: 6,
  },
  guidedCardDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 14,
  },
});
