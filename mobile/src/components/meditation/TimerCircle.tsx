import React, { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
} from 'react-native';

interface TimerCircleProps {
  remaining: number;
  total: number;
  isRunning: boolean;
  isEndless?: boolean;
  elapsedTime?: number;
  onPress?: () => void;
  children?: ReactNode;
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
  onPress,
  children,
}: TimerCircleProps) => {
  const initialProgress = isEndless ? 1 : total > 0 ? (total - remaining) / total : 0;
  const progressAnim = useRef(new Animated.Value(initialProgress)).current;
  const progress = isEndless ? 1 : total > 0 ? (total - remaining) / total : 0;

  // Pulse animation removed as requested.


  // Smooth progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: isRunning ? 1000 : 300, // Smooth 1s when running, fast transition when jumping
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress, isRunning, progressAnim]);

  const rotateRight = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });

  const rotateLeft = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const rotateFull = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const dotOpacity = progressAnim.interpolate({
    inputRange: [0, 0.001, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[s.outerWrapper]}
    >
      {/* Outer ring */}
      <View style={s.outerRing}>
        {/* Background track circle with faint circular outline dots */}
        <View style={s.trackRing} />

        {/* Faint static background circular track dots for the original texture */}
        <View style={s.dotsContainer}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24 - 90;
            const radian = (angle * Math.PI) / 180;
            const left = 128 + Math.cos(radian) * 120 - 2;
            const top = 128 + Math.sin(radian) * 120 - 2;
            return (
              <View
                key={i}
                style={[s.trackDot, { left, top }]}
              />
            );
          })}
        </View>

        {/* --- SMOOTH CIRCULAR PROGRESS BAR --- */}
        
        {/* Right Half Mask */}
        <View style={s.halfMaskRight}>
          <Animated.View style={[s.rotatingContainerRight, { transform: [{ rotate: rotateRight }] }]}>
            <View style={s.semiCircleLeft} />
          </Animated.View>
        </View>

        {/* Left Half Mask */}
        <View style={s.halfMaskLeft}>
          <Animated.View style={[s.rotatingContainerLeft, { transform: [{ rotate: rotateLeft }] }]}>
            <View style={s.semiCircleRight} />
          </Animated.View>
        </View>

        {/* Leading edge glowing dot */}
        <Animated.View style={[s.leadingDotContainer, { transform: [{ rotate: rotateFull }], opacity: dotOpacity }]}>
          <View style={s.leadingDot} />
        </Animated.View>

        {/* Inner circle */}
        <Pressable
          style={({ pressed }) => [
            s.innerCircle,
            onPress && pressed ? s.innerCirclePressed : null,
          ]}
          onPress={onPress}
          disabled={!onPress}
        >
          {children || (
            <>
              <Text style={s.timerText}>
                {formatTime(isEndless ? elapsedTime : remaining)}
              </Text>
              <Text style={s.statusText}>
                {isRunning ? 'Meditating...' : (isEndless || remaining === total) ? 'Ready' : 'Paused'}
              </Text>
            </>
          )}
        </Pressable>
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trackRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(240, 127, 46, 0.08)',
  },
  dotsContainer: {
    position: 'absolute',
    width: 256,
    height: 256,
  },
  trackDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(234, 220, 211, 0.4)',
  },
  halfMaskRight: {
    position: 'absolute',
    width: 120,
    height: 240,
    left: 128,
    top: 8,
    overflow: 'hidden',
  },
  halfMaskLeft: {
    position: 'absolute',
    width: 120,
    height: 240,
    left: 8,
    top: 8,
    overflow: 'hidden',
  },
  rotatingContainerRight: {
    position: 'absolute',
    width: 240,
    height: 240,
    left: -120,
    top: 0,
  },
  rotatingContainerLeft: {
    position: 'absolute',
    width: 240,
    height: 240,
    left: 0,
    top: 0,
  },
  semiCircleLeft: {
    position: 'absolute',
    width: 120,
    height: 240,
    left: 0,
    top: 0,
    borderTopLeftRadius: 120,
    borderBottomLeftRadius: 120,
    borderWidth: 4,
    borderRightWidth: 0,
    borderColor: '#ED7624',
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  semiCircleRight: {
    position: 'absolute',
    width: 120,
    height: 240,
    left: 120,
    top: 0,
    borderTopRightRadius: 120,
    borderBottomRightRadius: 120,
    borderWidth: 4,
    borderLeftWidth: 0,
    borderColor: '#ED7624',
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  leadingDotContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    left: 8,
    top: 8,
    alignItems: 'center',
  },
  leadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ED7624',
    top: -4,
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  innerCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  innerCirclePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ED7624',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#A86D53',
    fontWeight: '600',
    marginTop: 6,
  },
});
