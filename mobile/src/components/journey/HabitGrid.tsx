import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StreakBadge } from './StreakBadge';

interface HabitLogEntry {
  date: string;
  completed: boolean;
}

interface HabitGridProps {
  habitType: string;
  habitIcon: string;
  habitName: string;
  logs: HabitLogEntry[];
  streakCount: number;
  onLogToday: () => void;
}

const GRID_ROWS = 5;
const GRID_COLS = 7;

const buildGridDays = (
  logs: HabitLogEntry[],
): Array<{ date: string; completed: boolean }> => {
  const grid: Array<{ date: string; completed: boolean }> = [];
  const logMap = new Map<string, boolean>();

  for (const log of logs) {
    logMap.set(log.date, log.completed);
  }

  const today = new Date();
  const totalDays = GRID_ROWS * GRID_COLS;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    grid.push({
      date: dateStr,
      completed: logMap.get(dateStr) ?? false,
    });
  }

  return grid;
};

export const HabitGrid = ({
  habitIcon,
  habitName,
  logs,
  streakCount,
  onLogToday,
}: HabitGridProps) => {
  const gridDays = buildGridDays(logs);

  return (
    <View className="bg-surface rounded-card border border-border mx-6 mb-4 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">{habitIcon}</Text>
          <Text className="text-base font-bold text-text-primary">
            {habitName}
          </Text>
        </View>
        <StreakBadge count={streakCount} label="Days" />
      </View>

      {/* Grid */}
      <View className="mb-3">
        {Array.from({ length: GRID_ROWS }).map((_, row) => (
          <View key={`row-${row}`} className="flex-row justify-between mb-1">
            {Array.from({ length: GRID_COLS }).map((_, col) => {
              const index = row * GRID_COLS + col;
              const day = gridDays[index];
              if (!day) return null;

              return (
                <View
                  key={day.date}
                  className={`w-8 h-8 rounded-sm items-center justify-center ${
                    day.completed ? 'bg-accent' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      day.completed
                        ? 'text-white font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Log Today button */}
      <TouchableOpacity
        className="bg-primary/10 rounded-button py-2.5 items-center"
        onPress={onLogToday}
        activeOpacity={0.7}
      >
        <Text className="text-primary font-semibold text-sm">
          + Log Today
        </Text>
      </TouchableOpacity>
    </View>
  );
};
