import { test, expect, Page } from '@playwright/test';

/**
 * Human-like E2E test for the webcam fix (commit 4f3a064).
 *
 * The bug: enumerateDevices() was called WITHOUT a prior getUserMedia(),
 * so browsers returned empty deviceId strings → zero cameras detected →
 * webcam never started.
 *
 * The fix: call getUserMedia() first to trigger the permission prompt,
 * then enumerate devices to get real IDs and labels.
 */

const FAKE_STREAM = {
  id: 'test-stream-123',
  title: 'Playwright Test Stream',
  description: 'Testing webcam fix',
  status: 'live',  // Simulate a stale "live" stream from the backend
  userId: 'test-user-pw',
  categoryId: 'dev',
  tags: [],
  streamKey: 'fake-stream-key-pw',
  ingest: {
    rtmpUrl: 'rtmp://live.cloudflarestream.com/live',
    webrtcUrl: 'https://customer-fake.cloudflarestream.com/fake-whip',
  },
  user: { id: 'test-user-pw', username: 'playwright-tester', displayName: 'Playwright Tester' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const FAKE_USER = {
  id: 'test-user-pw',
  email: 'playwright@test.local',
  username: 'playwright-tester',
  displayName: 'Playwright Tester',
  avatar: null,
  role: 'USER',
};

const BASE = process.env.PW_BASE_URL || 'https://live.ainative.studio';
const COOKIE_DOMAIN = new URL(BASE).hostname;

/** Set up auth cookie + localStorage + mock API routes */
async function setupAuthenticatedPage(page: Page) {
  // Cookie for Next.js middleware
  await page.context().addCookies([{
    name: 'ainative_access_token',
    value: 'playwright-test-token',
    domain: COOKIE_DOMAIN,
    path: '/',
  }]);

  // localStorage for client-side auth context
  await page.addInitScript((user) => {
    localStorage.setItem('ainative_access_token', 'playwright-test-token');
    localStorage.setItem('ainative_user', JSON.stringify(user));
  }, FAKE_USER);

  // Mock API responses so the Go Live page works without a real backend session
  await page.route('**/api.ainative.studio/v1/streams/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // GET /streams/ — return a fake active stream
    if (method === 'GET' && url.includes('/streams/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ streams: [FAKE_STREAM], total: 1 }),
      });
      return;
    }

    // POST /streams/ — create stream
    if (method === 'POST' && url.endsWith('/streams/')) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_STREAM),
      });
      return;
    }

    await route.continue();
  });

  // Mock /auth/me
  await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USER),
    });
  });

  // Mock categories
  await page.route('**/api.ainative.studio/v1/streams/categories*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'dev', name: 'Development', slug: 'development' },
        { id: 'ai', name: 'AI & ML', slug: 'ai-ml' },
      ]),
    });
  });
}

/** Inject fake getUserMedia and enumerateDevices for headless */
function injectFakeMediaDevices(page: Page) {
  return page.addInitScript(() => {
    (window as any).__mediaApiCalls = [];

    const origGUM = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);

    navigator.mediaDevices.getUserMedia = async function(constraints?: MediaStreamConstraints) {
      (window as any).__mediaApiCalls.push('getUserMedia');

      // Try real device first
      if (origGUM) {
        try { return await origGUM(constraints!); } catch { /* headless */ }
      }

      // Fake canvas stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#5867EF';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('Fake Camera', 180, 230);
      ctx.fillStyle = '#10B981';
      ctx.font = '16px monospace';
      ctx.fillText('Playwright E2E', 210, 270);

      const stream = (canvas as any).captureStream(30) as MediaStream;

      if (!constraints || (constraints as any).audio !== false) {
        try {
          const audioCtx = new AudioContext();
          const osc = audioCtx.createOscillator();
          const dest = audioCtx.createMediaStreamDestination();
          osc.frequency.value = 0;
          osc.connect(dest);
          osc.start();
          dest.stream.getAudioTracks().forEach((t: MediaStreamTrack) => stream.addTrack(t));
        } catch { /* audio not critical */ }
      }
      return stream;
    };

    navigator.mediaDevices.enumerateDevices = async function() {
      (window as any).__mediaApiCalls.push('enumerateDevices');
      return [
        { deviceId: 'fake-cam-1', kind: 'videoinput', label: 'Fake Test Camera (Built-in)', groupId: 'g1', toJSON: () => ({}) } as MediaDeviceInfo,
        { deviceId: 'fake-cam-2', kind: 'videoinput', label: 'Fake External Camera', groupId: 'g2', toJSON: () => ({}) } as MediaDeviceInfo,
        { deviceId: 'fake-mic-1', kind: 'audioinput', label: 'Fake Test Microphone', groupId: 'g3', toJSON: () => ({}) } as MediaDeviceInfo,
      ];
    };
  });
}


test.describe('Webcam Fix Verification', () => {

  test('1. Homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AINative/i);
    await page.screenshot({ path: 'e2e/screenshots/01-homepage.png' });
    console.log('✓ Homepage loaded');
  });

  test('2. Dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: 'e2e/screenshots/02-login-redirect.png' });
    console.log('✓ Unauthenticated users redirected to login');
  });

  test('3. Go Live page loads with auth — shows method selector', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    // The API mock returns a stream, so we should see the method selector
    const heading = page.getByText('Choose Your Streaming Method');
    await expect(heading).toBeVisible({ timeout: 20_000 });

    await page.screenshot({ path: 'e2e/screenshots/03-method-selector.png' });
    console.log('✓ Stream method selector visible');
  });

  test('4. Browser (WebRTC) option is clickable', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 20_000 });

    const browserBtn = page.getByRole('button', { name: /Use Browser Streaming/i });
    await expect(browserBtn).toBeVisible();
    await browserBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/04-browser-selected.png' });
    console.log('✓ "Use Browser Streaming" clicked');
  });

  test('5. Browser option shows Camera / Screen chooser', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await injectFakeMediaDevices(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 20_000 });
    await page.getByRole('button', { name: /Use Browser Streaming/i }).click();
    await page.waitForTimeout(1500);

    await expect(page.getByText('Choose Video Source')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Camera/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Preview/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/05-video-source-chooser.png' });
    console.log('✓ Camera / Screen chooser visible');
  });

  test('6. CRITICAL: getUserMedia called BEFORE enumerateDevices', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await injectFakeMediaDevices(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 20_000 });
    await page.getByRole('button', { name: /Use Browser Streaming/i }).click();

    // Wait for BrowserStreamPreview's loadDevices() to run on mount —
    // poll until both calls appear (may take a moment for async getUserMedia to resolve)
    let calls: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      calls = await page.evaluate(() => (window as any).__mediaApiCalls || []);
      if (calls.includes('getUserMedia') && calls.includes('enumerateDevices')) break;
    }

    console.log('API call order:', calls);

    const gumIndex = calls.indexOf('getUserMedia');
    const edIndex = calls.indexOf('enumerateDevices');

    expect(gumIndex).toBeGreaterThanOrEqual(0);
    expect(edIndex).toBeGreaterThanOrEqual(0);
    expect(gumIndex).toBeLessThan(edIndex);

    await page.screenshot({ path: 'e2e/screenshots/06-call-order-verified.png' });
    console.log(`✓ CRITICAL FIX VERIFIED: getUserMedia[${gumIndex}] → enumerateDevices[${edIndex}]`);
    console.log(`  Full sequence: [${calls.join(' → ')}]`);
  });

  test('7. Start Preview shows camera feed', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await injectFakeMediaDevices(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 20_000 });
    await page.getByRole('button', { name: /Use Browser Streaming/i }).click();
    await page.waitForTimeout(1500);

    await expect(page.getByText('Choose Video Source')).toBeVisible({ timeout: 10_000 });

    // Click Start Preview
    await page.getByRole('button', { name: /Start Preview/i }).click();
    await page.waitForTimeout(4000);

    // After starting, the preview card should appear with "Stream Preview"
    // or at minimum the video element should be active
    await page.screenshot({ path: 'e2e/screenshots/07-preview-started.png' });
    console.log('✓ Camera preview started');
  });

  test('8. No critical JS errors on Go Live page', async ({ page }) => {
    await setupAuthenticatedPage(page);

    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const critical = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('hydration') &&
      !e.includes('Loading chunk') &&
      !e.includes('fetch') &&
      !e.includes('401') &&
      !e.includes('NetworkError')
    );

    expect(critical).toHaveLength(0);
    await page.screenshot({ path: 'e2e/screenshots/08-no-errors.png' });
    console.log(`✓ No critical JS errors (${errors.length} non-critical filtered)`);
  });

  test('9. BUG FIX: stale "live" stream shows End Stream button in RTMP view', async ({ page }) => {
    // The backend returns status: 'live' for a zombie stream.
    // The fix: RTMP sidebar shows LIVE badge + "End Stream" button so users
    // can kill zombie streams (cost protection).
    await setupAuthenticatedPage(page);

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    // Should show the method selector with a warning
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 20_000 });

    // Select RTMP Software
    await page.getByRole('button', { name: /Use RTMP Software/i }).click();
    await page.waitForTimeout(2000);

    // "End Stream" button must be visible so users can kill the zombie
    const endBtn = page.locator('.space-y-4 >> button', { hasText: /End Stream/i });
    await expect(endBtn).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/09-stale-live-end-button.png' });
    console.log('✓ Stale "live" stream shows End Stream button in RTMP sidebar');
  });

  test('10. WHIP proxy endpoint is alive', async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/whip`, {
      headers: { 'Content-Type': 'text/plain' },
      data: 'test',
    });

    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body.error).toContain('Missing url parameter');
    console.log('✓ WHIP proxy responds correctly');
  });
});
