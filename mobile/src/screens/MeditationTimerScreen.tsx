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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TimerCircle } from '../components/meditation/TimerCircle';
import { useMeditationStore } from '../store/meditationStore';
import { meditationService } from '../services/meditation.service';
import { supabase } from '../services/supabase';
import { JourneyStackParamList } from '../navigation/types';

type TimerNav = NativeStackNavigationProp<JourneyStackParamList, 'MeditationTimer'>;

const DURATION_PRESETS = [3, 5, 10, 15, 20, 30] as const;

type SoundOption = 'nature' | 'rain' | 'ocean' | 'birds' | 'bowl' | 'silence';
type SessionType = 'free' | 'guided' | 'breathing';

const SOUND_OPTIONS: Array<{ key: SoundOption; label: string; icon: string }> = [
  { key: 'silence', label: 'Silence', icon: '\u{1F54A}' },
  { key: 'nature', label: 'Nature', icon: '\u{1F33F}' },
  { key: 'rain', label: 'Rain', icon: '\u{1F327}' },
  { key: 'ocean', label: 'Ocean', icon: '\u{1F30A}' },
  { key: 'birds', label: 'Birds', icon: '\u{1F426}' },
  { key: 'bowl', label: 'Bowl', icon: '\u{1F514}' },
];

const SESSION_TYPES: Array<{ key: SessionType; label: string }> = [
  { key: 'free', label: 'Free' },
  { key: 'guided', label: 'Guided' },
  { key: 'breathing', label: 'Breathing' },
];

const MeditationTimerScreen = () => {
  const navigation = useNavigation<TimerNav>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

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
  } = useMeditationStore();

  const selectedMinutes = duration / 60;

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

  // Detect completion
  useEffect(() => {
    if (remaining === 0 && startedAt && !isRunning && !isPaused) {
      handleCompletion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCompletion is defined below and stable via useCallback
  }, [remaining, startedAt, isRunning, isPaused]);

  const handleCompletion = useCallback(async () => {
    if (!startedAt) return;

    setShowCompletion(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const durationMinutes = duration / 60;
      await meditationService.logSession({
        duration_minutes: durationMinutes,
        session_type: sessionType,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      });

      if (user) {
        await meditationService.autoLogHabit(user.id);
      }
    } catch {
      // Session logging is best-effort
    }
  }, [startedAt, duration, sessionType]);

  const handleDismissCompletion = useCallback(() => {
    setShowCompletion(false);
    reset();
    navigation.goBack();
  }, [reset, navigation]);

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
          },
        },
      ],
    );
  }, [stop]);

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
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
      >
        {/* Timer circle */}
        <View style={s.timerWrap}>
          <TimerCircle
            remaining={remaining}
            total={duration}
            isRunning={isRunning}
          />
        </View>

        {/* Duration presets */}
        {!isActive && (
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
            </View>
          </View>
        )}

        {/* Ambient sound picker */}
        {!isActive && (
          <View style={s.soundSection}>
            <Text style={s.sectionLabel}>
              Ambient Sound
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
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
                  onPress={() => setSound(opt.key)}
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
              onPress={start}
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

              {/* Pause/Resume */}
              <TouchableOpacity
                style={s.startButton}
                onPress={isRunning ? pause : resume}
                activeOpacity={0.8}
              >
                <Text style={s.startButtonText}>
                  {isRunning ? '\u23F8' : '\u25B6'}
                </Text>
              </TouchableOpacity>
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
    color: '#FFFFFF',
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
});
