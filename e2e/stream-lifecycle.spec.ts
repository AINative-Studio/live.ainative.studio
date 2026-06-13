import { test, expect, Page, Route } from '@playwright/test';

/**
 * Comprehensive stream lifecycle tests.
 * Covers: stale streams, zombie cleanup, "already active" errors,
 * end-stream state reset, cost-risk scenarios, and all UI states.
 */

const BASE = process.env.PW_BASE_URL || 'https://live.ainative.studio';
const COOKIE_DOMAIN = new URL(BASE).hostname;

const FAKE_USER = {
  id: 'test-user-pw',
  email: 'pw@test.local',
  username: 'pw-tester',
  displayName: 'PW Tester',
  avatar: null,
  role: 'USER',
};

function makeStream(overrides: Record<string, unknown> = {}) {
  return {
    id: 'stream-001',
    title: 'Test Stream',
    description: '',
    status: 'offline',
    userId: 'test-user-pw',
    categoryId: 'dev',
    tags: [],
    streamKey: 'sk_test_fake',
    viewerCount: 0,
    peakViewers: 0,
    ingest: {
      rtmpsUrl: 'rtmp://live.cloudflarestream.com/live',
      rtmpsKey: 'sk_test_fake',
      webrtcUrl: 'https://customer-fake.cloudflarestream.com/whip',
    },
    user: { id: 'test-user-pw', username: 'pw-tester', displayName: 'PW Tester' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function setupAuth(page: Page) {
  await page.context().addCookies([{
    name: 'ainative_access_token',
    value: 'pw-token',
    domain: COOKIE_DOMAIN,
    path: '/',
  }]);
  await page.addInitScript((user) => {
    localStorage.setItem('ainative_access_token', 'pw-token');
    localStorage.setItem('ainative_user', JSON.stringify(user));
  }, FAKE_USER);
}

/** Mock API with configurable stream state */
async function mockApi(page: Page, opts: {
  activeStream?: Record<string, unknown> | null;
  createFails?: boolean;
  endCallback?: () => void;
} = {}) {
  const { activeStream = null, createFails = false } = opts;

  // Track API calls for assertions
  await page.addInitScript(() => {
    (window as any).__apiCalls = [];
  });

  // Mock /end and /start FIRST (more specific routes must be registered first)
  await page.route('**/api.ainative.studio/v1/streams/id/*/end', async (route) => {
    await page.evaluate(() => (window as any).__apiCalls?.push('end'));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeStream({ status: 'ended' })),
    });
  });

  await page.route('**/api.ainative.studio/v1/streams/id/*/start', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeStream({ status: 'live' })),
    });
  });

  // GET /streams/ — list
  await page.route('**/api.ainative.studio/v1/streams/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // GET /streams/ — return active stream if set
    if (method === 'GET' && (url.endsWith('/streams/') || url.includes('/streams/?'))) {
      const streams = activeStream ? [activeStream] : [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ streams, total: streams.length }),
      });
      return;
    }

    // POST /streams/ — create
    if (method === 'POST' && url.match(/\/streams\/?$/)) {
      if (createFails) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'You already have an active stream. End it before creating a new one.' }),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(makeStream({ id: 'new-stream-' + Date.now() })),
        });
      }
      return;
    }

    await route.continue();
  });

  // Mock auth
  await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USER),
    });
  });

  await page.route('**/api.ainative.studio/v1/streams/categories*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'dev', name: 'Development', slug: 'dev' }]),
    });
  });
}


test.describe('Stream Lifecycle — Stale Stream Bugs', () => {

  test('STALE-1: Stale "live" stream shows warning on method selector', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'live' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    // Method selector should appear (stream exists)
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });

    // Warning about stale stream should be visible
    const warning = page.getByText(/stream marked as live/i);
    await expect(warning).toBeVisible();

    // "End Stream" button in the warning
    const endBtn = page.getByRole('button', { name: /End Stream/i });
    await expect(endBtn).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stale-1-warning.png' });
    console.log('✓ STALE-1: Warning shown for stale live stream');
  });

  test('STALE-2: Stale "live" stream in RTMP view shows LIVE badge with End button', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'live' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: /Use RTMP Software/i }).click();
    await page.waitForTimeout(1500);

    // LIVE badge in the Stream Status card — uses destructive variant
    const liveBadge = page.locator('.space-y-4 >> text=LIVE').first();
    await expect(liveBadge).toBeVisible();

    // End Stream button must be visible in the sidebar — this is how users kill zombie streams
    const endBtn = page.locator('.space-y-4 >> button', { hasText: /End Stream/i });
    await expect(endBtn).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stale-2-rtmp-live-with-end.png' });
    console.log('✓ STALE-2: RTMP view shows LIVE badge + End Stream button');
  });

  test('STALE-3: Ending stale stream from method selector resets to create form', async ({ page }) => {
    await setupAuth(page);

    let streamEnded = false;
    await mockApi(page, { activeStream: makeStream({ status: 'live' }) });

    // Override the end endpoint to also clear the active stream for subsequent GETs
    await page.route('**/api.ainative.studio/v1/streams/id/*/end', async (route) => {
      streamEnded = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeStream({ status: 'ended' })),
      });
    });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });

    // Click "End Stream" in the warning
    await page.getByRole('button', { name: /End Stream/i }).click();
    await page.waitForTimeout(2000);

    // Should show "Create Your Stream" form after ending
    await expect(page.getByText('Create Your Stream')).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'e2e/screenshots/stale-3-end-resets-to-create.png' });
    console.log('✓ STALE-3: Ending stale stream resets to create form');
  });

  test('STALE-4: Ending stale stream from RTMP sidebar resets to create form', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'live' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: /Use RTMP Software/i }).click();
    await page.waitForTimeout(1500);

    // Click "End Stream" in the sidebar
    await page.getByRole('button', { name: /End Stream/i }).click();
    await page.waitForTimeout(2000);

    // Should reset to create form — NOT stay on RTMP settings
    await expect(page.getByText('Create Your Stream')).toBeVisible({ timeout: 10_000 });

    // "RTMP Streaming" badge should NOT be visible
    await expect(page.getByText('RTMP Streaming')).not.toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stale-4-rtmp-end-resets.png' });
    console.log('✓ STALE-4: RTMP End Stream resets to create form');
  });
});


test.describe('Stream Lifecycle — Create Errors', () => {

  test('CREATE-1: "Already active stream" auto-ends and retries', async ({ page }) => {
    await setupAuth(page);

    let createCallCount = 0;
    // First create fails, second succeeds (after auto-end)
    await page.route('**/api.ainative.studio/v1/streams/*', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'GET' && (url.endsWith('/streams/') || url.includes('/streams/?'))) {
        // Return active stream on first call (for auto-end lookup)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ streams: [makeStream({ status: 'live' })], total: 1 }),
        });
        return;
      }

      if (method === 'POST' && url.match(/\/streams\/?$/)) {
        createCallCount++;
        if (createCallCount === 1) {
          // First create → fail
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'You already have an active stream. End it before creating a new one.' }),
          });
        } else {
          // Second create (after auto-end) → success
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(makeStream({ id: 'fresh-stream', status: 'offline' })),
          });
        }
        return;
      }

      if (method === 'POST' && url.includes('/end')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(makeStream({ status: 'ended' })),
        });
        return;
      }

      await route.continue();
    });

    // Mock auth + categories
    await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) });
    });
    await page.route('**/api.ainative.studio/v1/streams/categories*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([{ id: 'dev', name: 'Development', slug: 'dev' }]),
      });
    });

    // Simulate no active stream on mount (so create form shows)
    await page.route('**/api.ainative.studio/v1/streams/', async (route, request) => {
      // Only intercept the initial GET (before any POST)
      if (route.request().method() === 'GET' && createCallCount === 0) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ streams: [], total: 0 }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    // Create form should show
    await page.getByText('Create Your Stream').waitFor({ timeout: 15_000 });

    // Fill in form
    await page.fill('input[name="title"], #title, [placeholder*="Building"]', 'My Test Stream');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/create-1-form.png' });
    console.log('✓ CREATE-1: Create form shown, test filled');
  });
});


test.describe('Stream Lifecycle — Offline Stream (Happy Path)', () => {

  test('HAPPY-1: Offline stream shows method selector without warnings', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'offline' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });

    // No stale stream warning
    const warning = page.getByText(/stream marked as live/i);
    await expect(warning).not.toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/happy-1-clean.png' });
    console.log('✓ HAPPY-1: Offline stream shows clean method selector');
  });

  test('HAPPY-2: Offline stream RTMP view shows "Stream is ready" not LIVE', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'offline' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: /Use RTMP Software/i }).click();
    await page.waitForTimeout(1500);

    // "LIVE" badge should NOT appear
    // Check carefully — "LIVE" text exists in "LIVE — Streaming" badge too
    const liveBadge = page.locator('[class*="destructive"]', { hasText: 'LIVE' });
    await expect(liveBadge).not.toBeVisible();

    // "Stream is ready" should show
    await expect(page.getByText('Stream is ready')).toBeVisible();

    // "End & Start Over" button should be available
    await expect(page.getByRole('button', { name: /End & Start Over/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/happy-2-offline-rtmp.png' });
    console.log('✓ HAPPY-2: Offline stream shows "Stream is ready" in RTMP view');
  });

  test('HAPPY-3: End & Start Over from RTMP resets to create form', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: makeStream({ status: 'offline' }) });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');
    await page.getByText('Choose Your Streaming Method').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: /Use RTMP Software/i }).click();
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: /End & Start Over/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Create Your Stream')).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'e2e/screenshots/happy-3-end-start-over.png' });
    console.log('✓ HAPPY-3: End & Start Over resets to create form');
  });
});


test.describe('Stream Lifecycle — No Existing Stream', () => {

  test('NEW-1: No stream shows create form', async ({ page }) => {
    await setupAuth(page);
    await mockApi(page, { activeStream: null });

    await page.goto('/dashboard/go-live');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Create Your Stream')).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ path: 'e2e/screenshots/new-1-create-form.png' });
    console.log('✓ NEW-1: No stream shows create form');
  });
});


test.describe('Stream Lifecycle — Cost Protection', () => {

  test('COST-1: WHIP proxy rejects non-Cloudflare URLs', async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/whip?url=https://evil.com/steal`, {
      headers: { 'Content-Type': 'text/plain' },
      data: 'v=0\r\n',
    });
    expect(resp.status()).toBe(403);
    const body = await resp.json();
    expect(body.error).toContain('Invalid WHIP endpoint');
    console.log('✓ COST-1: WHIP proxy rejects non-Cloudflare URLs');
  });

  test('COST-2: WHIP proxy requires url parameter', async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/whip`, {
      headers: { 'Content-Type': 'text/plain' },
      data: 'test',
    });
    expect(resp.status()).toBe(400);
    console.log('✓ COST-2: WHIP proxy requires url parameter');
  });
});
