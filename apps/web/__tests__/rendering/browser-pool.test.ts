import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Browser } from 'puppeteer';

// Mock puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(),
  },
}));

import puppeteer from 'puppeteer';
import { getBrowser, closeBrowser } from '@/lib/rendering/browser-pool';

describe('browser-pool', () => {
  let mockBrowser: Browser;

  beforeEach(() => {
    // Create mock browser
    mockBrowser = {
      connected: true,
      close: vi.fn(),
      on: vi.fn(),
    } as unknown as Browser;

    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser);
  });

  afterEach(async () => {
    // Reset module state by closing browser
    await closeBrowser();
    vi.clearAllMocks();
  });

  describe('getBrowser', () => {
    it('launches browser on first call', async () => {
      const browser = await getBrowser();

      expect(puppeteer.launch).toHaveBeenCalledTimes(1);
      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: expect.arrayContaining([
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ]),
      });
      expect(browser).toBe(mockBrowser);
    });

    it('reuses browser instance on subsequent calls', async () => {
      const browser1 = await getBrowser();
      const browser2 = await getBrowser();

      expect(puppeteer.launch).toHaveBeenCalledTimes(1);
      expect(browser1).toBe(browser2);
    });

    it('relaunches browser if disconnected', async () => {
      const browser1 = await getBrowser();

      // Simulate disconnect
      Object.defineProperty(mockBrowser, 'connected', {
        value: false,
        writable: true,
      });

      const newMockBrowser = {
        connected: true,
        close: vi.fn(),
        on: vi.fn(),
      } as unknown as Browser;
      vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser);

      const browser2 = await getBrowser();

      expect(puppeteer.launch).toHaveBeenCalledTimes(2);
      expect(browser2).toBe(newMockBrowser);
      expect(browser1).not.toBe(browser2);
    });

    it('handles concurrent calls without race condition', async () => {
      const [browser1, browser2, browser3] = await Promise.all([
        getBrowser(),
        getBrowser(),
        getBrowser(),
      ]);

      expect(puppeteer.launch).toHaveBeenCalledTimes(1);
      expect(browser1).toBe(browser2);
      expect(browser2).toBe(browser3);
    });

    it('registers disconnect handler', async () => {
      await getBrowser();

      expect(mockBrowser.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });
  });

  describe('closeBrowser', () => {
    it('closes browser if it exists', async () => {
      await getBrowser();
      await closeBrowser();

      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });

    it('does nothing if browser not initialized', async () => {
      await closeBrowser();

      expect(mockBrowser.close).not.toHaveBeenCalled();
    });

    it('clears browser instance after closing', async () => {
      await getBrowser();
      await closeBrowser();

      // Should launch new browser
      const newMockBrowser = {
        connected: true,
        close: vi.fn(),
        on: vi.fn(),
      } as unknown as Browser;
      vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser);

      await getBrowser();

      expect(puppeteer.launch).toHaveBeenCalledTimes(2);
    });
  });
});
