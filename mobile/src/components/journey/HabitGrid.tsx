import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StreakBadge } from './StreakBadge';

interface HabitLogEntry {
  date: string;
  completed: boolean;
}

interface HabitGridProps {
  habitType: string;
  habitIcon: any;
  habitName: string;
  logs: HabitLogEntry[];
  streakCount: number;
  onLogToday: () => void;
  onToggleDate?: (dateStr: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FONT_FAMILY = 'Manrope';
const palette = {
  primary: '#EE9F27',
  primaryDark: '#855400',
  background: '#FFFDF9',
  surface: '#FFFFFF',
  mainText: '#1B1C1C',
  secondaryText: '#524435',
  border: '#F7E7C9',
  outline: '#857462',
  white: '#FFFFFF',
};

export const HabitGrid = ({
  habitIcon,
  habitName,
  logs,
  streakCount,
  onLogToday,
  onToggleDate,
}: HabitGridProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const logMap = new Map<string, boolean>();
  for (const log of logs) {
    logMap.set(log.date, log.completed);
  }

  // Get current date details
  const today = new Date();
  
  // Format to local date string matching log entries (YYYY-MM-DD)
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Day of week of the 1st of the month (0 = Sun, 6 = Sat)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create an array for calendar cells (including empty padding for start of month)
  const calendarCells = [];
  
  // Padding cells at start
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dateStr = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, '0'),
      String(dateObj.getDate()).padStart(2, '0'),
    ].join('-');
    
    calendarCells.push({
      day: d,
      dateStr: dateStr,
      isToday: dateStr === todayStr,
      completed: logMap.get(dateStr) ?? false,
    });
  }

  // Padding cells at end to complete the last week
  const totalCells = calendarCells.length;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push(null);
  }

  // Group cells into weeks (rows of 7)
  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <View style={s.card}>
      {/* Compact Header row */}
      <TouchableOpacity 
        style={s.header} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={s.headerLeft}>
          {typeof habitIcon === 'string' ? (
            <Text style={s.habitIcon}>{habitIcon}</Text>
          ) : (
            <Image source={habitIcon} style={s.habitIconImage} />
          )}
          <Text style={s.habitName}>{habitName}</Text>
        </View>

        <View style={s.headerRight}>
          <StreakBadge count={streakCount} label="Days" />
          <TouchableOpacity 
            style={s.addButton} 
            onPress={(e) => {
              e?.stopPropagation?.(); // Prevent expanding the card when clicking + Add
              onLogToday();
            }}
            activeOpacity={0.7}
          >
            <Text style={s.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded Calendar View */}
      {isExpanded && (
        <View style={s.calendarContainer}>
          {/* Weekday headers */}
          <View style={s.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={s.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={s.calendarGrid}>
            {weeks.map((week, weekIdx) => (
              <View key={`week-${weekIdx}`} style={s.weekRow}>
                {week.map((cell, cellIdx) => {
                  if (!cell) {
                    // Empty padding cell
                    return <View key={`empty-${weekIdx}-${cellIdx}`} style={s.calendarCell} />;
                  }

                  const isPastOrToday = cell.dateStr <= todayStr;

                  const cellContent = (
                    <Text
                      style={[
                        s.cellText,
                        cell.completed ? s.cellTextCompleted : s.cellTextEmpty,
                        cell.isToday && cell.completed ? s.cellTextTodayCompleted : null,
                        !isPastOrToday && !cell.completed ? s.cellTextFuture : null
                      ]}
                    >
                      {cell.day}
                    </Text>
                  );

                  return (
                    <TouchableOpacity
                      key={cell.dateStr}
                      style={[
                        s.calendarCell,
                        cell.completed ? s.cellCompleted : s.cellEmpty,
                        cell.isToday ? (cell.completed ? s.cellTodayCompleted : s.cellToday) : null
                      ]}
                      onPress={() => {
                        if (onToggleDate) {
                          onToggleDate(cell.dateStr);
                        }
                      }}
                      activeOpacity={onToggleDate ? 0.7 : 1}
                      disabled={!onToggleDate}
                    >
                      {cellContent}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  habitIcon: {
    fontSize: 21,
    marginRight: 8,
  },
  habitIconImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    resizeMode: 'contain',
  },
  habitName: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    color: palette.mainText,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  addButtonText: {
    fontFamily: FONT_FAMILY,
    color: palette.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  calendarContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    fontFamily: FONT_FAMILY,
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: palette.secondaryText,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  calendarCell: {
    width: '14.28%', // 100% / 7 columns
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 8,
  },
  cellEmpty: {
    backgroundColor: 'transparent',
  },
  cellCompleted: {
    backgroundColor: palette.primary,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: palette.primary,
    backgroundColor: palette.background,
  },
  cellTodayCompleted: {
    borderWidth: 1.5,
    borderColor: palette.primaryDark,
    backgroundColor: palette.primary,
  },
  cellTextTodayCompleted: {
    color: palette.primaryDark,
    fontWeight: 'bold',
  },
  cellText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
  cellTextCompleted: {
    color: palette.white,
    fontWeight: 'bold',
  },
  cellTextEmpty: {
    color: palette.mainText,
  },
  cellTextFuture: {
    color: palette.outline,
  }
});
