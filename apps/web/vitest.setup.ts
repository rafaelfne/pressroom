import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for tests (used by Puck Editor)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer capture methods for Radix UI components (Select, Dropdown, etc.)
HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => {};
HTMLElement.prototype.releasePointerCapture = () => {};

// Mock scrollIntoView for Radix UI components
Element.prototype.scrollIntoView = () => {};
