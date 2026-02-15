import puppeteer, { type Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

/**
 * Get or create a Puppeteer browser instance.
 * Uses a singleton pattern to reuse the browser across requests.
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // Avoid race condition: if launch is already in progress, await it
  if (launchPromise) {
    return launchPromise;
  }

  launchPromise = launchBrowser();

  try {
    browserInstance = await launchPromise;
    return browserInstance;
  } finally {
    launchPromise = null;
  }
}

async function launchBrowser(): Promise<Browser> {
  const args = [
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=none',
  ];

  // Only disable sandbox when explicitly opted in (e.g., containerized environments)
  if (process.env.PUPPETEER_DISABLE_SANDBOX === 'true') {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args,
  });

  // Clean up on disconnect
  browser.on('disconnected', () => {
    browserInstance = null;
  });

  return browser;
}

/**
 * Close the browser instance if it exists.
 * Call this during graceful shutdown.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
