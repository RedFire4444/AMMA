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
      <SafeAreaView className="flex-1 bg-[#0B2B1F]" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">{'\u{1F514}'}</Text>
          <Text className="text-2xl font-serif font-bold text-white mb-3">
            Session Complete
          </Text>
          <Text className="text-base text-white/70 text-center mb-2">
            You meditated for {selectedMinutes} minutes
          </Text>
          <Text className="text-sm text-white/50 text-center mb-8">
            Your practice has been logged. Namaste.
          </Text>

          <TouchableOpacity
            className="bg-accent rounded-button px-8 py-3.5"
            onPress={handleDismissCompletion}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0B2B1F]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-3 pb-2">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3"
          onPress={() => {
            if (isActive) {
              handleStop();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text className="text-lg text-white">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1">
          Meditation
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isActive}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
      >
        {/* Timer circle */}
        <View className="mt-8 mb-8">
          <TimerCircle
            remaining={remaining}
            total={duration}
            isRunning={isRunning}
          />
        </View>

        {/* Duration presets */}
        {!isActive && (
          <View className="mb-6">
            <Text className="text-sm text-white/60 text-center mb-3">
              Duration (minutes)
            </Text>
            <View className="flex-row justify-center flex-wrap px-6">
              {DURATION_PRESETS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  className={`w-14 h-14 rounded-full items-center justify-center mx-1.5 mb-2 ${
                    selectedMinutes === mins
                      ? 'bg-accent'
                      : 'bg-white/10'
                  }`}
                  onPress={() => setDuration(mins)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-bold ${
                      selectedMinutes === mins
                        ? 'text-white'
                        : 'text-white/70'
                    }`}
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
          <View className="mb-6 w-full">
            <Text className="text-sm text-white/60 text-center mb-3">
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
                  className={`items-center mr-4 px-3 py-2 rounded-card ${
                    selectedSound === opt.key
                      ? 'bg-accent/20 border border-accent'
                      : 'bg-white/5 border border-white/10'
                  }`}
                  onPress={() => setSound(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl mb-1">{opt.icon}</Text>
                  <Text
                    className={`text-xs font-medium ${
                      selectedSound === opt.key
                        ? 'text-accent'
                        : 'text-white/60'
                    }`}
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
          <View className="mb-8 px-6">
            <Text className="text-sm text-white/60 text-center mb-3">
              Session Type
            </Text>
            <View className="flex-row bg-white/10 rounded-pill p-1">
              {SESSION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  className={`flex-1 py-2.5 rounded-pill items-center ${
                    sessionType === type.key ? 'bg-accent' : ''
                  }`}
                  onPress={() => setSessionType(type.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      sessionType === type.key
                        ? 'text-white'
                        : 'text-white/60'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Controls */}
        <View className="flex-row items-center justify-center px-6">
          {!isActive ? (
            <TouchableOpacity
              className="bg-accent rounded-full w-20 h-20 items-center justify-center"
              onPress={start}
              activeOpacity={0.8}
            >
              <Text className="text-3xl text-white">{'\u25B6'}</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center">
              {/* Stop button */}
              <TouchableOpacity
                className="bg-red-500/20 border border-red-500 rounded-full w-14 h-14 items-center justify-center mr-6"
                onPress={handleStop}
                activeOpacity={0.8}
              >
                <Text className="text-xl text-red-400">{'\u25A0'}</Text>
              </TouchableOpacity>

              {/* Pause/Resume */}
              <TouchableOpacity
                className="bg-accent rounded-full w-20 h-20 items-center justify-center"
                onPress={isRunning ? pause : resume}
                activeOpacity={0.8}
              >
                <Text className="text-3xl text-white">
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
