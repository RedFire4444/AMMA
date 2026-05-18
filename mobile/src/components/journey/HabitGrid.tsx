import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  onToggleDate?: (dateStr: string) => void;
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
  onToggleDate,
}: HabitGridProps) => {
  const gridDays = buildGridDays(logs);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.habitIcon}>{habitIcon}</Text>
          <Text style={s.habitName}>
            {habitName}
          </Text>
        </View>
        <StreakBadge count={streakCount} label="Days" />
      </View>

      {/* Grid */}
      <View style={s.gridContainer}>
        {Array.from({ length: GRID_ROWS }).map((_rowItem, row) => (
          <View key={`row-${row}`} style={s.gridRow}>
            {Array.from({ length: GRID_COLS }).map((_colItem, col) => {
              const index = row * GRID_COLS + col;
              const day = gridDays[index];
              if (!day) return null;

              const cellContent = (
                <Text
                  style={[
                    s.gridCellText,
                    day.completed ? s.gridCellTextCompleted : s.gridCellTextEmpty,
                  ]}
                >
                  {new Date(day.date).getDate()}
                </Text>
              );

              if (onToggleDate) {
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      s.gridCell,
                      day.completed ? s.gridCellCompleted : s.gridCellEmpty,
                    ]}
                    onPress={() => onToggleDate(day.date)}
                    activeOpacity={0.7}
                  >
                    {cellContent}
                  </TouchableOpacity>
                );
              }

              return (
                <View
                  key={day.date}
                  style={[
                    s.gridCell,
                    day.completed ? s.gridCellCompleted : s.gridCellEmpty,
                  ]}
                >
                  {cellContent}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Log Today button */}
      <TouchableOpacity
        style={s.logButton}
        onPress={onLogToday}
        activeOpacity={0.7}
      >
        <Text style={s.logButtonText}>
          + Log Today
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  gridContainer: {
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridCell: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellCompleted: {
    backgroundColor: '#40916C',
  },
  gridCellEmpty: {
    backgroundColor: '#F3F4F6',
  },
  gridCellText: {
    fontSize: 12,
  },
  gridCellTextCompleted: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridCellTextEmpty: {
    color: '#9CA3AF',
  },
  logButton: {
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#1B4332',
    fontWeight: '600',
    fontSize: 14,
  },
});
