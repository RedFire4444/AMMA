import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

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

  // Build progress segments (12 segments around the circle)
  const totalSegments = 24;
  const filledSegments = Math.round(progress * totalSegments);

  return (
    <Animated.View
      style={{ transform: [{ scale: pulseAnim }] }}
      className="items-center justify-center"
    >
      {/* Outer ring */}
      <View className="w-64 h-64 rounded-full border-4 border-white/10 items-center justify-center">
        {/* Progress ring using overlapping segments */}
        <View className="absolute w-64 h-64 items-center justify-center">
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
                style={{
                  position: 'absolute',
                  left: 128 + x - 4,
                  top: 128 + y - 4,
                }}
                className={`w-2 h-2 rounded-full ${
                  isFilled ? 'bg-accent' : 'bg-white/20'
                }`}
              />
            );
          })}
        </View>

        {/* Inner circle */}
        <View className="w-48 h-48 rounded-full bg-white/5 items-center justify-center">
          <Text className="text-5xl font-bold text-white tracking-wider">
            {formatTime(remaining)}
          </Text>
          <Text className="text-sm text-white/60 mt-2">
            {isRunning ? 'Meditating...' : remaining === total ? 'Ready' : 'Paused'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
