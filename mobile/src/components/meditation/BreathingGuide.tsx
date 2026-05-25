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
  embedded?: boolean;
}

const PHASE_LABELS: Record<BreathingPhase['phase'], string> = {
  inhale: 'INHALE',
  hold: 'HOLD',
  exhale: 'EXHALE',
  hold_out: 'HOLD',
};

const PHASE_COLORS: Record<BreathingPhase['phase'], string> = {
  inhale: '#ED7624', // Premium Vibrant Orange
  hold: '#FF9F59',   // Soft warm glowing orange
  exhale: '#FF8C3A', // Glowing deep orange
  hold_out: '#E06B1F', // Rich warm orange
};

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  isRunning,
  isPaused,
  pattern,
  embedded = false,
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
    <View style={embedded ? styles.embeddedContainer : styles.container}>
      {/* Outer pulsing shadow container */}
      <View style={embedded ? styles.embeddedGuideWrapper : styles.guideWrapper}>
        <Animated.View
          style={[
            embedded ? styles.embeddedBreathingCircle : styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        >
          {/* Inner ring overlay */}
          <View style={embedded ? styles.embeddedInnerRing : styles.innerRing} />
        </Animated.View>

        {/* Text indicators layer (absolutely centered over the circle) */}
        <View style={styles.textLayer}>
          <Text style={embedded ? styles.embeddedPhaseLabel : styles.phaseLabel}>
            {PHASE_LABELS[activePhase.phase]}
          </Text>
          <Text style={embedded ? styles.embeddedCountdownText : styles.countdownText}>
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
  embeddedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 192,
    width: 192,
  },
  guideWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  embeddedGuideWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 192,
    height: 192,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  embeddedBreathingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
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
  embeddedInnerRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
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
  embeddedPhaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 2,
    opacity: 0.9,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  embeddedCountdownText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
