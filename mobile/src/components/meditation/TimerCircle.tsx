import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

const TOTAL_SEGMENTS = 24;
const RADIUS = 120;
const CONTAINER_HALF = 128;
const SEGMENT_HALF = 4;

interface SegmentLayout {
  key: string;
  left: number;
  top: number;
}

const SEGMENT_LAYOUTS: SegmentLayout[] = Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
  const angle = (i * 360) / TOTAL_SEGMENTS - 90;
  const radian = (angle * Math.PI) / 180;
  return {
    key: `seg-${i}`,
    left: CONTAINER_HALF + Math.cos(radian) * RADIUS - SEGMENT_HALF,
    top: CONTAINER_HALF + Math.sin(radian) * RADIUS - SEGMENT_HALF,
  };
});

interface TimerCircleProps {
  remaining: number;
  total: number;
  isRunning: boolean;
  isEndless?: boolean;
  elapsedTime?: number;
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
  isEndless = false,
  elapsedTime = 0,
}: TimerCircleProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progress = isEndless ? 1 : total > 0 ? (total - remaining) / total : 0;

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

  const filledSegments = Math.round(progress * TOTAL_SEGMENTS);

  // Memoized so each segment View is only rebuilt when its filled state flips,
  // not on every parent re-render (was causing pulse animation jitter).
  const segments = useMemo(
    () =>
      SEGMENT_LAYOUTS.map((seg, i) => (
        <View
          key={seg.key}
          style={[
            s.segment,
            i < filledSegments ? s.segmentFilled : s.segmentEmpty,
            { left: seg.left, top: seg.top },
          ]}
        />
      )),
    [filledSegments],
  );

  return (
    <Animated.View
      style={[s.outerWrapper, { transform: [{ scale: pulseAnim }] }]}
    >
      {/* Outer ring */}
      <View style={s.outerRing}>
        {/* Progress ring using overlapping segments */}
        <View style={s.segmentContainer}>
          {segments}
        </View>

        {/* Inner circle */}
        <View style={s.innerCircle}>
          <Text style={s.timerText}>
            {formatTime(isEndless ? elapsedTime : remaining)}
          </Text>
          <Text style={s.statusText}>
            {isRunning ? 'Meditating...' : (isEndless || remaining === total) ? 'Ready' : 'Paused'}
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
