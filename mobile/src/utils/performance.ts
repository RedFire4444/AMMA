/**
 * Performance utilities for React Native optimization.
 * Use these constants and helpers across the app for consistent performance tuning.
 */

/**
 * FlatList optimization settings for different list sizes.
 * Apply via: <FlatList {...FLATLIST_CONFIG.medium} ... />
 */
export const FLATLIST_CONFIG = {
  small: {
    windowSize: 5,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: true,
  },
  medium: {
    windowSize: 7,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: true,
  },
  large: {
    windowSize: 10,
    maxToRenderPerBatch: 15,
    updateCellsBatchingPeriod: 30,
    removeClippedSubviews: true,
    initialNumToRender: 10,
  },
} as const;

/**
 * Image loading priorities for FastImage (when installed).
 */
export const IMAGE_PRIORITY = {
  low: 'low',
  normal: 'normal',
  high: 'high',
} as const;

/**
 * Debounce helper for search inputs and other rapid-fire events.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle helper for scroll events and resize handlers.
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
