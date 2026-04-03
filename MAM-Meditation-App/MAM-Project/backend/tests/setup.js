/**
 * Jest Test Setup
 * Global setup for all tests
 */

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise
const originalLog = console.log;
console.log = (...args) => {
  // Only show logs that start with ✅ ❌ or 🎉
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('✅') || args[0].includes('❌') || args[0].includes('🎉'))) {
    originalLog(...args);
  }
};

// Global test utilities
global.testUtils = {
  generateTestUserId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  createTestUser: (overrides = {}) => ({
    id: global.testUtils.generateTestUserId(),
    email: `test-${Date.now()}@example.com`,
    full_name: 'Test User',
    subscription_status: 'free',
    ...overrides
  })
};