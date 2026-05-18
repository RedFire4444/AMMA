import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Vibration, Easing } from 'react-native';

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

interface BreathingGuideProps {
  isRunning: boolean;
  isPaused: boolean;
  pattern: BreathingPattern;
}

const PHASE_LABELS: Record<BreathingPhase['phase'], string> = {
  inhale: 'INHALE',
  hold: 'HOLD',
  exhale: 'EXHALE',
  hold_out: 'HOLD',
};

const PHASE_COLORS: Record<BreathingPhase['phase'], string> = {
  inhale: '#40916C', // Premium Soft Green
  hold: '#2D6A4F',   // Darker Green
  exhale: '#52B788', // Lighter Soft Green
  hold_out: '#1B4332', // Deep forest Green
};

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  isRunning,
  isPaused,
  pattern,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(pattern.sequence[0].duration);
  
  // Animation scale ref
  const scaleAnim = useRef(new Animated.Value(1.0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhase = pattern.sequence[phaseIndex];

  // Helper to trigger circle scaling animation
  const animateToPhase = (phase: BreathingPhase['phase'], durationSeconds: number) => {
    let targetScale = 1.0;
    if (phase === 'inhale') {
      targetScale = 1.6;
    } else if (phase === 'hold') {
      targetScale = 1.6;
    } else if (phase === 'exhale') {
      targetScale = 1.0;
    } else if (phase === 'hold_out') {
      targetScale = 1.0;
    }

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: durationSeconds * 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Reset breathing state when stopped/started
  useEffect(() => {
    const isActive = isRunning || isPaused;
    if (!isActive) {
      setPhaseIndex(0);
      setTimeLeft(pattern.sequence[0].duration);
      scaleAnim.setValue(1.0);
    } else if (isRunning && !isPaused) {
      // Start the animation for the initial phase
      animateToPhase(pattern.sequence[phaseIndex].phase, timeLeft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when isRunning or isPaused changes
  }, [isRunning, isPaused]);

  // Handle local ticking and transitions
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch to next phase
            const nextIndex = (phaseIndex + 1) % pattern.sequence.length;
            const nextPhase = pattern.sequence[nextIndex];
            
            setPhaseIndex(nextIndex);
            
            // Trigger strong notification vibration (500ms) on transition safely
            try {
              Vibration.vibrate([0, 500]);
            } catch (err) {
              if (__DEV__) console.warn('Vibration failed:', err);
            }

            // Animate scale to match the new phase's duration
            animateToPhase(nextPhase.phase, nextPhase.duration);

            return nextPhase.duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // If paused, stop the ongoing animations in place
      if (isPaused) {
        scaleAnim.stopAnimation();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, phaseIndex, pattern]);

  const activeColor = PHASE_COLORS[activePhase.phase];

  return (
    <View style={styles.container}>
      {/* Outer pulsing shadow container */}
      <View style={styles.guideWrapper}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        >
          {/* Inner ring overlay */}
          <View style={styles.innerRing} />
        </Animated.View>

        {/* Text indicators layer (absolutely centered over the circle) */}
        <View style={styles.textLayer}>
          <Text style={styles.phaseLabel}>
            {PHASE_LABELS[activePhase.phase]}
          </Text>
          <Text style={styles.countdownText}>
            {timeLeft}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    width: '100%',
  },
  guideWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.9,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
