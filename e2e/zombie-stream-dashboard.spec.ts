import { test, expect, Page } from '@playwright/test';

/**
 * Test the dashboard zombie stream fix end-to-end.
 * Verifies: stale stream warning, End Stream button works,
 * UI updates after ending, no more "You Are Live" for zombies.
 */

const COOKIE_DOMAIN = new URL(process.env.PW_BASE_URL || 'https://live.ainative.studio').hostname;

const FAKE_USER = {
  id: 'test-user-pw',
  email: 'pw@test.local',
  username: 'pw-tester',
  displayName: 'PW Tester',
  avatar: null,
  role: 'USER',
};

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

function mockDashboardWithZombieStream(page: Page) {
  // Mock dashboard overview with a zombie "live" stream (0 viewers)
  return Promise.all([
    page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) });
    }),
    page.route('**/api.ainative.studio/v1/dashboard/streamer/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_stream: {
            id: 'zombie-stream-001',
            title: 'AINative Startup Camp — San Francisco',
            status: 'live',
            viewer_count: 0,
            peak_viewers: 0,
            started_at: null,
            category: { name: 'AI & ML', slug: 'ai-ml' },
          },
          recent_streams: [],
          follower_count: 0,
          total_views: 0,
          upcoming_schedule: [],
          notifications: [],
        }),
      });
    }),
    page.route('**/api.ainative.studio/v1/dashboard/streamer/quick-stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          today_viewers: 0, weekly_viewers: 0, monthly_viewers: 0,
          avg_stream_duration: 0, new_followers_today: 0, new_followers_week: 0,
        }),
      });
    }),
    // End stream endpoint
    page.route('**/api.ainative.studio/v1/streams/id/zombie-stream-001/end', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'zombie-stream-001', status: 'ended' }),
      });
    }),
    // Fallback for getActiveStream
    page.route('**/api.ainative.studio/v1/streams/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ streams: [], total: 0 }),
        });
        return;
      }
      await route.continue();
    }),
    page.route('**/api.ainative.studio/v1/streams/notifications/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [], total: 0 }) });
    }),
  ]);
}


test.describe('Dashboard Zombie Stream Fix', () => {

  test('ZOMBIE-1: Dashboard shows "Stream Active" not "You Are Live" for zombie stream', async ({ page }) => {
    await setupAuth(page);
    await mockDashboardWithZombieStream(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should NOT show "You Are Live"
    const youAreLive = page.getByText('You Are Live');
    await expect(youAreLive).not.toBeVisible();

    // Should show "Stream Active"
    const streamActive = page.getByText('Stream Active');
    await expect(streamActive).toBeVisible();

    // Should show the warning about costs
    const costWarning = page.getByText(/not streaming.*end it.*costs/i);
    await expect(costWarning).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/zombie-1-dashboard-warning.png' });
    console.log('✓ ZOMBIE-1: Dashboard shows "Stream Active" with cost warning');
  });

  test('ZOMBIE-2: End Stream button on dashboard actually works', async ({ page }) => {
    await setupAuth(page);
    await mockDashboardWithZombieStream(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find the End Stream button
    const endBtn = page.getByRole('button', { name: /End Stream/i });
    await expect(endBtn).toBeVisible();

    // Click it
    await endBtn.click();
    await page.waitForTimeout(3000);

    // After ending, the zombie card should disappear
    // "Stream Active" should no longer be visible
    await expect(page.getByText('Stream Active')).not.toBeVisible({ timeout: 10_000 });

    // Should show "You are not currently streaming"
    await expect(page.getByText(/not currently streaming/i)).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'e2e/screenshots/zombie-2-stream-ended.png' });
    console.log('✓ ZOMBIE-2: End Stream button works, dashboard updated');
  });

  test('ZOMBIE-3: Dashboard with real live stream (viewers > 0) shows normally', async ({ page }) => {
    await setupAuth(page);

    // Mock with REAL live stream (has viewers)
    await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) });
    });
    await page.route('**/api.ainative.studio/v1/dashboard/streamer/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_stream: {
            id: 'real-stream-001',
            title: 'Building a Real App',
            status: 'live',
            viewer_count: 15,
            peak_viewers: 42,
            started_at: new Date().toISOString(),
            category: { name: 'Development', slug: 'dev' },
          },
          recent_streams: [],
          follower_count: 100,
          total_views: 500,
          upcoming_schedule: [],
          notifications: [],
        }),
      });
    });
    await page.route('**/api.ainative.studio/v1/dashboard/streamer/quick-stats', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ today_viewers: 15, weekly_viewers: 200, monthly_viewers: 500, avg_stream_duration: 3600, new_followers_today: 5, new_followers_week: 20 }),
      });
    });
    await page.route('**/api.ainative.studio/v1/streams/notifications/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [], total: 0 }) });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should show "Stream Active" (we changed the heading)
    await expect(page.getByText('Stream Active')).toBeVisible();

    // Should say "You are currently live" (not the cost warning)
    await expect(page.getByText(/currently live/i)).toBeVisible();

    // Should show viewer count (appears in both stats card and stream card)
    await expect(page.getByText('15').first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/zombie-3-real-live.png' });
    console.log('✓ ZOMBIE-3: Real live stream shows correctly');
  });

  test('ZOMBIE-4: Dashboard with no stream shows Go Live prompt', async ({ page }) => {
    await setupAuth(page);

    await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_USER) });
    });
    await page.route('**/api.ainative.studio/v1/dashboard/streamer/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_stream: null,
          recent_streams: [],
          follower_count: 0,
          total_views: 0,
          upcoming_schedule: [],
          notifications: [],
        }),
      });
    });
    await page.route('**/api.ainative.studio/v1/dashboard/streamer/quick-stats', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ today_viewers: 0, weekly_viewers: 0, monthly_viewers: 0, avg_stream_duration: 0, new_followers_today: 0, new_followers_week: 0 }),
      });
    });
    await page.route('**/api.ainative.studio/v1/streams/notifications/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [], total: 0 }) });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should show "not currently streaming"
    await expect(page.getByText(/not currently streaming/i)).toBeVisible();

    // Should have Go Live button
    await expect(page.getByRole('link', { name: /Go Live/i }).first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/zombie-4-no-stream.png' });
    console.log('✓ ZOMBIE-4: No stream shows Go Live prompt');
  });
});
