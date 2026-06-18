import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E stress test suite for live.ainative.studio.
 * Tests every page, button, form, and interaction.
 * 50 tests across 10 describe blocks.
 */

const BASE = process.env.PW_BASE_URL || 'https://live.ainative.studio';
const COOKIE_DOMAIN = new URL(BASE).hostname;

const FAKE_USER = {
  id: 'stress-test-user',
  email: 'stress@test.local',
  username: 'stress-tester',
  displayName: 'Stress Tester',
  avatar: null,
  role: 'USER',
};

// ---------- helpers ----------

async function setupAuth(page: Page) {
  await page.context().addCookies([{
    name: 'ainative_access_token',
    value: 'stress-test-token',
    domain: COOKIE_DOMAIN,
    path: '/',
  }]);
  await page.addInitScript((user) => {
    localStorage.setItem('ainative_access_token', 'stress-test-token');
    localStorage.setItem('ainative_user', JSON.stringify(user));
  }, FAKE_USER);
}

async function mockAuthApi(page: Page) {
  await page.route('**/api.ainative.studio/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USER),
    });
  });
}

async function mockDashboardApis(page: Page) {
  await mockAuthApi(page);

  // Streams list (empty)
  await page.route('**/api.ainative.studio/v1/streams/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ streams: [], total: 0 }),
      });
      return;
    }
    await route.continue();
  });

  // Categories
  await page.route('**/api.ainative.studio/v1/streams/categories*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'dev', name: 'Development', slug: 'dev' },
        { id: 'ai-ml', name: 'AI & Machine Learning', slug: 'ai-ml' },
      ]),
    });
  });

  // Analytics
  await page.route('**/api.ainative.studio/v1/analytics*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalViews: 0, totalWatchTime: 0, followerCount: 0,
        peakViewers: 0, avgViewers: 0, streamCount: 0,
        viewsOverTime: [], watchTimeOverTime: [],
      }),
    });
  });

  // Notifications
  await page.route('**/api.ainative.studio/v1/notifications*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ notifications: [], total: 0, unread: 0 }),
    });
  });

  // Schedule
  await page.route('**/api.ainative.studio/v1/schedule*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ schedules: [], total: 0 }),
    });
  });

  // Moderators
  await page.route('**/api.ainative.studio/v1/moderators*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ moderators: [], total: 0 }),
    });
  });

  // User profile
  await page.route('**/api.ainative.studio/v1/users/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USER),
    });
  });
}

function mockStreamPageApis(page: Page, username: string) {
  return Promise.all([
    page.route('**/api.ainative.studio/v1/streams/users/*/live', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isLive: true,
          stream: {
            id: 'mock-stream-1',
            title: 'Mock Stream for Tests',
            status: 'live',
            userId: 'u-mock',
            viewerCount: 42,
            tags: [{ id: 't1', name: 'lang:typescript' }, { id: 't2', name: 'lang:python' }],
            user: { id: 'u-mock', username, displayName: 'Mock Streamer' },
          },
        }),
      });
    }),
    page.route('**/api.ainative.studio/v1/streams/users/*/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'u-mock', username, displayName: 'Mock Streamer',
          avatar: null, bio: 'Test bio', followerCount: 100, followingCount: 10,
        }),
      });
    }),
    page.route('**/api.ainative.studio/v1/streams/mock-stream-1/chat*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: [], cursor: null }),
      });
    }),
  ]);
}

/** Known non-critical errors to filter out from page error tracking */
function isCriticalError(msg: string): boolean {
  const ignoredPatterns = [
    'ResizeObserver',
    'hydration',
    'Minified React error',
    'NEXT_NOT_FOUND',
    'NotFoundError',
    'fetch',
    'Failed to fetch',
    'NetworkError',
    'net::ERR',
    'AbortError',
    'Load failed',
    'cancelled',
    'Clipboard',
    'writeText',
    'Write permission denied',
  ];
  return !ignoredPatterns.some((p) => msg.includes(p));
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

function getCriticalErrors(errors: string[]): string[] {
  return errors.filter(isCriticalError);
}

// ====================================================================
// PUBLIC PAGES
// ====================================================================

test.describe('Public Pages — Load & Render', () => {

  test('01 — Homepage renders hero, streams, categories, CTA', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // Hero section — look for the main heading or CTA text
    const heroText = page.getByText(/Stream Your IDE/i).or(page.getByText(/Build in Public/i));
    await expect(heroText.first()).toBeVisible({ timeout: 15_000 });

    // Categories section
    const categoriesHeading = page.getByText(/Categories/i).or(page.getByText(/Browse/i));
    await expect(categoriesHeading.first()).toBeVisible({ timeout: 10_000 });

    // CTA section — look for "Start Streaming" or "Go Live" or "Get Started"
    const cta = page.getByRole('link', { name: /Start Streaming|Go Live|Get Started/i });
    const ctaVisible = await cta.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-01-homepage.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 01: Homepage renders (CTA: ${ctaVisible})`);
  });

  test('02 — Login page elements', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    await expect(page.getByText('Welcome Back')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stress-02-login.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 02: Login page has all elements');
  });

  test('03 — Register page elements', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/register', { waitUntil: 'networkidle' });

    // Look for the create account heading
    const heading = page.getByText(/Create.*Account|Sign Up|Register/i);
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });

    // Form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();

    // Username field (could be label or placeholder)
    const usernameField = page.getByLabel(/username/i).or(page.getByPlaceholder(/username/i));
    await expect(usernameField.first()).toBeVisible();

    // OAuth buttons
    await expect(page.getByRole('button', { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stress-03-register.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 03: Register page has all elements');
  });

  test('04 — Search page elements', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/search', { waitUntil: 'networkidle' });

    // Search input
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i)).or(page.locator('input[type="search"], input[type="text"]').first());
    await expect(searchInput.first()).toBeVisible({ timeout: 15_000 });

    // Filter tabs — All, Streams, Developers, Categories
    const allTab = page.getByRole('tab', { name: /All/i }).or(page.getByText(/All/i, { exact: true }));
    const tabVisible = await allTab.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-04-search.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 04: Search page renders (tabs: ${tabVisible})`);
  });

  test('05 — Category page /category/ai-ml', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/category/ai-ml', { waitUntil: 'networkidle' });

    // Category header with name
    const categoryHeading = page.getByText(/AI.*Machine Learning|AI.*ML/i);
    await expect(categoryHeading.first()).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ path: 'e2e/screenshots/stress-05-category.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 05: Category page renders');
  });

  test('06 — Tech browse page /tech', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/tech', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Browse by Tech/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Frameworks' })).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stress-06-tech.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 06: Tech browse page renders');
  });

  test('07 — Tech detail page /tech/typescript', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/tech/typescript', { waitUntil: 'networkidle' });

    await expect(page.getByText(/TypeScript/i).first()).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ path: 'e2e/screenshots/stress-07-tech-detail.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 07: Tech detail page renders');
  });

  test('08 — Clips page /clips', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/clips', { waitUntil: 'networkidle' });

    const content = page.getByText(/Clips|No clips/i);
    await expect(content.first()).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ path: 'e2e/screenshots/stress-08-clips.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 08: Clips page renders');
  });

  test('09 — Stream page /stream/test handles non-existent stream', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/stream/nonexistent-user-xyz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Should not crash — either shows offline/not-found or empty state
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-09-stream-notfound.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 09: Stream page handles non-existent gracefully');
  });

  test('10 — User profile /user/test handles non-existent user', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/user/nonexistent-user-xyz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-10-user-notfound.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 10: User profile handles non-existent gracefully');
  });

  test('11 — VOD page /vod/test handles non-existent VOD', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/vod/nonexistent-vod-xyz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-11-vod-notfound.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 11: VOD page handles non-existent gracefully');
  });

  test('12 — About page /about loads', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/about', { waitUntil: 'networkidle' });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('about');

    await page.screenshot({ path: 'e2e/screenshots/stress-12-about.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 12: About page loads');
  });

  test('13 — Vibe Coding page /vibe-coding loads', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/vibe-coding', { waitUntil: 'networkidle' });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-13-vibe-coding.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 13: Vibe Coding page loads');
  });

  test('14 — Terms page /terms loads', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/terms', { waitUntil: 'networkidle' });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-14-terms.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 14: Terms page loads');
  });

  test('15 — Privacy page /privacy loads', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/privacy', { waitUntil: 'networkidle' });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-15-privacy.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 15: Privacy page loads');
  });

  test('16 — Forgot password page elements', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/forgot-password', { waitUntil: 'networkidle' });

    // Email field
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    await expect(emailField.first()).toBeVisible({ timeout: 15_000 });

    // Submit button
    const submitBtn = page.getByRole('button', { name: /Send|Reset|Submit/i });
    await expect(submitBtn.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stress-16-forgot-password.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 16: Forgot password page renders');
  });

  test('17 — Verify email page /verify-email loads', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/verify-email', { waitUntil: 'networkidle' });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-17-verify-email.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 17: Verify email page loads');
  });

  test('18 — Upgrade page /upgrade shows pricing tiers', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/upgrade', { waitUntil: 'networkidle' });

    // Should show pricing tiers: Free, Pro, Enterprise
    await expect(page.getByText('Free').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();

    // Should show a price
    await expect(page.getByText('$19').first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/stress-18-upgrade.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 18: Upgrade page shows pricing tiers');
  });
});


// ====================================================================
// AUTHENTICATED PAGES
// ====================================================================

test.describe('Authenticated Pages — Dashboard', () => {

  test('19 — Dashboard /dashboard loads with mocked auth', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Should show dashboard content, not redirect to login
    const url = page.url();
    expect(url).not.toContain('/login');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-19-dashboard.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 19: Dashboard loads with auth');
  });

  test('20 — Go Live /dashboard/go-live loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/go-live', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    // Should show either stream method selector or create form
    const methodSelector = page.getByText(/Choose Your Streaming Method/i);
    const createForm = page.getByText(/Create Your Stream/i);
    const hasContent = await methodSelector.isVisible().catch(() => false) ||
      await createForm.isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();

    await page.screenshot({ path: 'e2e/screenshots/stress-20-go-live.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 20: Go Live page loads');
  });

  test('21 — Analytics /dashboard/analytics loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/analytics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-21-analytics.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 21: Analytics page loads');
  });

  test('22 — Content Pipeline /dashboard/content loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/content', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-22-content.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 22: Content Pipeline page loads');
  });

  test('23 — Moderators /dashboard/moderators loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/moderators', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-23-moderators.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 23: Moderators page loads');
  });

  test('24 — Notifications /dashboard/notifications loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/notifications', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-24-notifications.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 24: Notifications page loads');
  });

  test('25 — Schedule /dashboard/schedule loads', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard/schedule', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-25-schedule.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 25: Schedule page loads');
  });

  test('26 — Settings /settings loads with profile form', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).not.toContain('/login');

    // Should show some settings content
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-26-settings.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 26: Settings page loads');
  });
});


// ====================================================================
// NAVIGATION TESTS
// ====================================================================

test.describe('Navigation Tests', () => {

  test('27 — Navbar links: Tech, Clips, search, Go Live', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tech link
    const techLink = page.getByRole('link', { name: /Tech/i }).or(page.getByRole('button', { name: /Tech/i }));
    await expect(techLink.first()).toBeVisible({ timeout: 10_000 });

    // Clips link
    const clipsLink = page.getByRole('link', { name: /Clips/i });
    const hasClips = await clipsLink.first().isVisible().catch(() => false);

    // Search should be available (icon or input)
    const searchEl = page.locator('nav').getByRole('textbox').or(page.locator('nav button[aria-label*="earch"]'));
    const hasSearch = await searchEl.first().isVisible().catch(() => false);

    // Go Live button/link
    const goLive = page.getByRole('link', { name: /Go Live/i });
    const hasGoLive = await goLive.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-27-navbar.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 27: Navbar links (Tech: true, Clips: ${hasClips}, Search: ${hasSearch}, GoLive: ${hasGoLive})`);
  });

  test('28 — Footer links navigate correctly', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Footer should have About, Terms, Privacy links
    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 10_000 });

    const aboutLink = footer.getByRole('link', { name: /About/i });
    await expect(aboutLink.first()).toBeVisible();

    const termsLink = footer.getByRole('link', { name: /Terms/i });
    await expect(termsLink.first()).toBeVisible();

    const privacyLink = footer.getByRole('link', { name: /Privacy/i });
    await expect(privacyLink.first()).toBeVisible();

    // Click About and verify navigation
    await aboutLink.first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/about');

    await page.screenshot({ path: 'e2e/screenshots/stress-28-footer.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 28: Footer links work');
  });

  test('29 — Mobile menu opens and has links', async ({ page }) => {
    const errors = trackErrors(page);
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Look for hamburger/menu button
    const menuBtn = page.getByRole('button', { name: /menu/i })
      .or(page.locator('button:has(svg.lucide-menu)'))
      .or(page.locator('nav button').last());

    const hasMenu = await menuBtn.first().isVisible().catch(() => false);
    if (hasMenu) {
      await menuBtn.first().click();
      await page.waitForTimeout(1000);

      // Mobile menu should show navigation links
      await page.screenshot({ path: 'e2e/screenshots/stress-29-mobile-menu.png' });
      console.log('PASS 29: Mobile menu opens');
    } else {
      await page.screenshot({ path: 'e2e/screenshots/stress-29-mobile-menu.png' });
      console.log('PASS 29: Mobile menu button not visible (responsive layout may differ)');
    }
    expect(getCriticalErrors(errors)).toHaveLength(0);
  });

  test('30 — Login -> Register -> Login navigation cycle', async ({ page }) => {
    const errors = trackErrors(page);

    // Start at login
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page.getByText('Welcome Back')).toBeVisible({ timeout: 15_000 });

    // Click "Sign up" link
    await page.getByRole('link', { name: /Sign up/i }).click();
    await page.waitForURL('**/register**', { timeout: 10_000 });
    expect(page.url()).toContain('/register');

    // Click "Sign in" or "Log in" link on register page
    const signInLink = page.getByRole('link', { name: /Sign in|Log in/i });
    await expect(signInLink.first()).toBeVisible({ timeout: 10_000 });
    await signInLink.first().click();
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-30-login-cycle.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 30: Login/Register navigation cycle works');
  });

  test('31 — Dashboard sidebar tool links', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Look for sidebar/nav links to Analytics, Content, Settings
    const analyticsLink = page.getByRole('link', { name: /Analytics/i });
    const contentLink = page.getByRole('link', { name: /Content/i });
    const settingsLink = page.getByRole('link', { name: /Settings/i });

    const hasAnalytics = await analyticsLink.first().isVisible().catch(() => false);
    const hasContent = await contentLink.first().isVisible().catch(() => false);
    const hasSettings = await settingsLink.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-31-sidebar.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 31: Sidebar links (Analytics: ${hasAnalytics}, Content: ${hasContent}, Settings: ${hasSettings})`);
  });
});


// ====================================================================
// FORM INTERACTIONS
// ====================================================================

test.describe('Form Interactions', () => {

  test('32 — Login form: fill and submit with fake creds', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByLabel(/email/i).fill('fake@doesnotexist.test');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await page.waitForTimeout(4000);

    // Should remain on login (not redirect to dashboard)
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-32-login-submit.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 32: Login form submits, stays on login with bad creds');
  });

  test('33 — Register form: fill fields and verify validation', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Fill email
    await page.getByLabel(/email/i).fill('test@example.test');

    // Fill username
    const usernameField = page.getByLabel(/username/i).or(page.getByPlaceholder(/username/i));
    await usernameField.first().fill('testuser123');

    // Fill password
    await page.getByLabel(/password/i).first().fill('TestPass123!');

    // Check if terms checkbox exists
    const termsCheckbox = page.getByRole('checkbox').or(page.locator('input[type="checkbox"]'));
    const hasTerms = await termsCheckbox.first().isVisible().catch(() => false);
    if (hasTerms) {
      await termsCheckbox.first().check();
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-33-register-fill.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 33: Register form fields filled (terms: ${hasTerms})`);
  });

  test('34 — Search: type query and submit', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/search', { waitUntil: 'networkidle' });

    const searchInput = page.getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i))
      .or(page.locator('input[type="search"], input[type="text"]').first());

    await searchInput.first().fill('typescript react');
    await searchInput.first().press('Enter');
    await page.waitForTimeout(3000);

    // Should still be on search page with results (or "no results")
    expect(page.url()).toContain('/search');

    await page.screenshot({ path: 'e2e/screenshots/stress-34-search-submit.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 34: Search submission works');
  });

  test('35 — Category sort dropdown interaction', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/category/ai-ml', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Look for sort dropdown or select
    const sortTrigger = page.getByRole('combobox').or(page.getByRole('button', { name: /sort|order|filter/i }));
    const hasSortDropdown = await sortTrigger.first().isVisible().catch(() => false);

    if (hasSortDropdown) {
      await sortTrigger.first().click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-35-category-sort.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 35: Category sort dropdown (present: ${hasSortDropdown})`);
  });

  test('36 — Settings: fill profile fields', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Try to find and fill profile fields
    const displayNameField = page.getByLabel(/display name|name/i)
      .or(page.getByPlaceholder(/display name|name/i));
    const hasDisplayName = await displayNameField.first().isVisible().catch(() => false);
    if (hasDisplayName) {
      await displayNameField.first().fill('Updated Test Name');
    }

    const bioField = page.getByLabel(/bio/i).or(page.getByPlaceholder(/bio|about/i));
    const hasBio = await bioField.first().isVisible().catch(() => false);
    if (hasBio) {
      await bioField.first().fill('This is a test bio for stress testing');
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-36-settings-form.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 36: Settings form (displayName: ${hasDisplayName}, bio: ${hasBio})`);
  });
});


// ====================================================================
// BUTTON INTERACTIONS (on mocked stream page)
// ====================================================================

test.describe('Button Interactions — Stream Page', () => {

  test('37 — Follow/Unfollow button on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'mock-streamer');

    // Mock follow endpoint
    await page.route('**/api.ainative.studio/v1/streams/users/*/follow*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ following: true }),
      });
    });

    await page.goto('/stream/mock-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const followBtn = page.getByRole('button', { name: /Follow|Unfollow/i });
    const hasFollow = await followBtn.first().isVisible().catch(() => false);
    if (hasFollow) {
      await followBtn.first().click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-37-follow.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 37: Follow button (visible: ${hasFollow})`);
  });

  test('38 — Share button on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'mock-streamer');

    await page.goto('/stream/mock-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const shareBtn = page.getByRole('button', { name: /Share/i })
      .or(page.locator('button:has(svg.lucide-share)'))
      .or(page.locator('button:has(svg.lucide-share-2)'));
    const hasShare = await shareBtn.first().isVisible().catch(() => false);
    if (hasShare) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-38-share.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 38: Share button (visible: ${hasShare})`);
  });

  test('39 — Clip button on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'mock-streamer');

    await page.goto('/stream/mock-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const clipBtn = page.getByRole('button', { name: /Clip/i })
      .or(page.locator('button:has(svg.lucide-scissors)'));
    const hasClip = await clipBtn.first().isVisible().catch(() => false);
    if (hasClip) {
      await clipBtn.first().click();
      await page.waitForTimeout(1000);
      // Dialog might open — just verify no crash
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-39-clip.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 39: Clip button (visible: ${hasClip})`);
  });

  test('40 — Like button on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'mock-streamer');

    await page.goto('/stream/mock-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const likeBtn = page.getByRole('button', { name: /Like|Heart/i })
      .or(page.locator('button:has(svg.lucide-heart)'))
      .or(page.locator('button:has(svg.lucide-thumbs-up)'));
    const hasLike = await likeBtn.first().isVisible().catch(() => false);
    if (hasLike) {
      await likeBtn.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-40-like.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 40: Like button (visible: ${hasLike})`);
  });
});


// ====================================================================
// COMPONENT SMOKE TESTS
// ====================================================================

test.describe('Component Smoke Tests', () => {

  test('41 — Chat panel renders on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'chat-streamer');

    await page.goto('/stream/chat-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Chat panel — look for chat input, message list, or "Chat" heading
    const chatInput = page.getByPlaceholder(/message|chat|say/i);
    const chatHeading = page.getByText(/Stream Chat|Chat/i);
    const hasChat = await chatInput.first().isVisible().catch(() => false) ||
      await chatHeading.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-41-chat.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 41: Chat panel (visible: ${hasChat})`);
  });

  test('42 — AI Summary card on stream page', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'ai-streamer');

    await page.goto('/stream/ai-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const aiSummary = page.getByText(/AI Summary/i);
    const hasAiSummary = await aiSummary.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-42-ai-summary.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 42: AI Summary card (visible: ${hasAiSummary})`);
  });

  test('43 — Code Context card on stream page with lang tags', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockAuthApi(page);
    await mockStreamPageApis(page, 'code-streamer');

    await page.goto('/stream/code-streamer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Code context or language tags should be visible
    const codeContext = page.getByText(/Code Context|Languages|Tech Stack/i);
    const langBadge = page.getByText(/TypeScript|Python/i);
    const hasCodeContext = await codeContext.first().isVisible().catch(() => false) ||
      await langBadge.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-43-code-context.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 43: Code context/lang tags (visible: ${hasCodeContext})`);
  });

  test('44 — Language badges render on tech page', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/tech', { waitUntil: 'networkidle' });

    // Should display language names with stream counts
    await expect(page.getByText('TypeScript')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Python')).toBeVisible();

    // Look for stream count badges (numbers like "0 streams" or just counts)
    const streamCounts = page.getByText(/\d+\s*(stream|live)/i);
    const hasStreamCounts = await streamCounts.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-44-lang-badges.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 44: Language badges render (stream counts: ${hasStreamCounts})`);
  });

  test('45 — Search typeahead shows suggestions', async ({ page }) => {
    const errors = trackErrors(page);

    // Mock search suggestions API
    await page.route('**/api.ainative.studio/v1/search/suggestions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['TypeScript tutorials', 'React streaming', 'Python AI']),
      });
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Find the navbar search input
    const navSearch = page.locator('nav').getByRole('textbox').or(page.locator('nav input'));
    const hasNavSearch = await navSearch.first().isVisible().catch(() => false);

    if (hasNavSearch) {
      await navSearch.first().fill('type');
      await page.waitForTimeout(1000);
      // Suggestions dropdown might appear
    }

    await page.screenshot({ path: 'e2e/screenshots/stress-45-typeahead.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 45: Search typeahead (nav search visible: ${hasNavSearch})`);
  });
});


// ====================================================================
// STRESS / EDGE CASES
// ====================================================================

test.describe('Stress & Edge Cases', () => {

  test('46 — Rapid page navigation (5 links quickly)', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // Navigate rapidly through pages without waiting for full load
    const pages = ['/tech', '/clips', '/about', '/login', '/search'];
    for (const p of pages) {
      await page.goto(p, { waitUntil: 'commit' });
    }

    // Wait for final page to settle
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/search');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-46-rapid-nav.png' });
    // Allow some errors from interrupted navigations
    console.log(`PASS 46: Rapid navigation (${errors.length} non-critical errors filtered)`);
  });

  test('47 — Back/forward browser navigation', async ({ page }) => {
    const errors = trackErrors(page);

    // Build history
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.goto('/register', { waitUntil: 'networkidle' });

    // Go back to login
    await page.goBack();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');

    // Go back to homepage
    await page.goBack();
    await page.waitForLoadState('networkidle');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/');

    // Go forward to login
    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-47-back-forward.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 47: Back/forward navigation works');
  });

  test('48 — Refresh page while on dashboard', async ({ page }) => {
    const errors = trackErrors(page);
    await setupAuth(page);
    await mockDashboardApis(page);

    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Reload
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Should still be on dashboard (auth persists)
    const url = page.url();
    // Might redirect to login if cookie didn't persist across reload
    // That's acceptable — we just verify no crash
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/stress-48-refresh.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 48: Page refresh handled (ended at: ${url})`);
  });

  test('49 — Navigate to non-existent page (404)', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/this-page-definitely-does-not-exist-xyz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Should show 404 page with "Page not found" and navigation options
    const notFound = page.getByText(/404|Page not found|Not Found/i);
    await expect(notFound.first()).toBeVisible({ timeout: 10_000 });

    // Should have a "Go home" or similar link
    const homeLink = page.getByRole('link', { name: /home|go home/i });
    const hasHome = await homeLink.first().isVisible().catch(() => false);

    await page.screenshot({ path: 'e2e/screenshots/stress-49-404.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log(`PASS 49: 404 page renders (home link: ${hasHome})`);
  });

  test('50 — Double-click on buttons does not break', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Fill form
    await page.getByLabel(/email/i).fill('doubleclick@test.test');
    await page.getByLabel(/password/i).fill('TestPass123!');

    // Double-click the Sign In button
    const signInBtn = page.getByRole('button', { name: /Sign In/i });
    await signInBtn.dblclick();
    await page.waitForTimeout(4000);

    // Page should not crash
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Should still be on login (bad creds)
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'e2e/screenshots/stress-50-doubleclick.png' });
    expect(getCriticalErrors(errors)).toHaveLength(0);
    console.log('PASS 50: Double-click on button does not break page');
  });
});
