/**
 * Sentry integration placeholder.
 *
 * To activate:
 * 1. Install: npm install @sentry/react-native
 * 2. Set SENTRY_DSN in environment
 * 3. Run: npx @sentry/wizard -i reactNative
 * 4. Uncomment the initialization below
 */

// import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.SENTRY_DSN || '';

export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN configured — skipping initialization');
    return;
  }

  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   environment: __DEV__ ? 'development' : 'production',
  //   tracesSampleRate: 1.0,
  //   enableAutoSessionTracking: true,
  //   sessionTrackingIntervalMillis: 30000,
  //   attachStacktrace: true,
  // });

  console.log('[Sentry] Initialized successfully');
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  console.error('[Sentry] Exception:', error.message, context);
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  console.log(`[Sentry] ${level}: ${message}`);
  // Sentry.captureMessage(message, level);
}

export function setUser(userId: string, _email?: string): void {
  console.log('[Sentry] Set user:', userId);
  // Sentry.setUser({ id: userId, email: _email });
}

export function addBreadcrumb(_category: string, _message: string, _data?: Record<string, unknown>): void {
  // Sentry.addBreadcrumb({ category: _category, message: _message, data: _data, level: 'info' });
}
