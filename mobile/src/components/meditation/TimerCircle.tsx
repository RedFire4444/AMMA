import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

interface TimerCircleProps {
  remaining: number;
  total: number;
  isRunning: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const TimerCircle = ({
  remaining,
  total,
  isRunning,
}: TimerCircleProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progress = total > 0 ? (total - remaining) / total : 0;

  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  // Build progress segments (24 segments around the circle)
  const totalSegments = 24;
  const filledSegments = Math.round(progress * totalSegments);

  return (
    <Animated.View
      style={[s.outerWrapper, { transform: [{ scale: pulseAnim }] }]}
    >
      {/* Outer ring */}
      <View style={s.outerRing}>
        {/* Progress ring using overlapping segments */}
        <View style={s.segmentContainer}>
          {Array.from({ length: totalSegments }).map((_, i) => {
            const angle = (i * 360) / totalSegments - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 120;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            const isFilled = i < filledSegments;

            return (
              <View
                key={`seg-${i}`}
                style={[
                  s.segment,
                  isFilled ? s.segmentFilled : s.segmentEmpty,
                  {
                    left: 128 + x - 4,
                    top: 128 + y - 4,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Inner circle */}
        <View style={s.innerCircle}>
          <Text style={s.timerText}>
            {formatTime(remaining)}
          </Text>
          <Text style={s.statusText}>
            {isRunning ? 'Meditating...' : remaining === total ? 'Ready' : 'Paused'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContainer: {
    position: 'absolute',
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentFilled: {
    backgroundColor: '#40916C',
  },
  segmentEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  innerCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
});
