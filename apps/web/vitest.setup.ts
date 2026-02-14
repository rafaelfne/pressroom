import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for tests (used by Puck Editor)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
