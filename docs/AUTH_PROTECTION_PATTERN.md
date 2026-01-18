# Authentication Protection Pattern

This document defines the standardized authentication protection pattern used throughout the AINative Studio Live application.

## Overview

We use a layered approach to authentication protection:

1. **Middleware Protection** - Server-side protection for route groups
2. **ProtectedRoute Component** - Client-side protection wrapper
3. **Auth Context** - Shared authentication state

## Standard Pattern

### For Protected Pages (Recommended)

Use the `ProtectedRoute` component wrapper:

```tsx
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';

function PageContent() {
  const { user } = useAuth();

  return (
    <div>
      {/* Your page content */}
      <h1>Welcome, {user?.displayName}</h1>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
```

### Why This Pattern?

1. **Separation of Concerns**: Auth logic is separated from page logic
2. **Consistent Behavior**: All protected pages behave the same way
3. **DRY Principle**: No need to duplicate auth checks
4. **Loading States**: Automatic loading state handling
5. **Redirect Handling**: Automatic redirect with return URL

### What NOT to Do

Do NOT use manual auth checks in pages:

```tsx
// INCORRECT - Don't do this
export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <div>Content</div>;
}
```

**Problems with manual auth checks:**
- Inconsistent redirect handling
- Missing loading states
- Duplicated code
- Easy to forget or implement incorrectly
- Doesn't preserve return URL

## Middleware Configuration

The middleware provides server-side protection for route groups:

```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
```

Protected routes:
- `/dashboard/*` - All dashboard pages
- `/settings/*` - All settings pages

## How It Works

### 1. Server-Side (Middleware)

When a user requests a protected route:

1. Middleware checks for `auth_token` cookie
2. If no token → Redirect to `/login?redirect=/original/path`
3. If token exists → Allow request to proceed

### 2. Client-Side (ProtectedRoute)

After the page loads on the client:

1. `ProtectedRoute` component checks auth state from context
2. While loading → Show loading spinner
3. If not authenticated → Redirect to `/login?redirect=/original/path`
4. If authenticated → Render children

### 3. Auth Context

Provides authentication state throughout the app:

```tsx
const {
  user,              // Current user object or null
  isAuthenticated,   // Boolean - is user logged in?
  isLoading,         // Boolean - is auth state being determined?
  login,             // Function to log in
  register,          // Function to register
  logout,            // Function to log out
  refreshUser,       // Function to refresh user data
} = useAuth();
```

## Migration Guide

### Migrating from Manual Auth Checks

If you have a page with manual auth checks:

**Before:**
```tsx
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <div>Dashboard Content</div>;
}
```

**After:**
```tsx
function DashboardPageContent() {
  // No auth logic needed here
  return <div>Dashboard Content</div>;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
```

## Testing

### Testing Protected Pages

```tsx
import { render } from '@testing-library/react';
import { useAuth } from '@/contexts/auth-context';

jest.mock('@/contexts/auth-context');

it('should render when authenticated', () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: '1', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  });

  const { getByText } = render(<ProtectedPage />);
  expect(getByText('Welcome')).toBeInTheDocument();
});
```

### Testing ProtectedRoute Component

See `/components/__tests__/protected-route.test.tsx` for comprehensive examples.

## Common Issues

### Issue: Page flashes before redirect

**Solution:** This is expected behavior. Middleware provides server-side protection, but client-side React needs to hydrate. The `ProtectedRoute` component handles this gracefully by not rendering children until auth is confirmed.

### Issue: Redirect loop

**Cause:** Usually caused by protecting the login page itself or incorrect auth state.

**Solution:**
1. Never wrap login/register pages with `ProtectedRoute`
2. Ensure middleware matcher doesn't include `/login` or `/register`
3. Check auth cookie is being set correctly

### Issue: Loss of query parameters after redirect

**Cause:** Not preserving the full pathname including query params.

**Solution:** The `ProtectedRoute` component automatically preserves the full path. Ensure you're using the latest version.

## Best Practices

1. **Always use ProtectedRoute for dashboard pages**
2. **Never manually check auth in page components**
3. **Keep auth logic in one place (ProtectedRoute and middleware)**
4. **Test your protected pages with auth mocked**
5. **Document any exceptions to the standard pattern**

## Examples

### Dashboard Pages

All pages under `/app/dashboard/` should use this pattern:

- `/app/dashboard/page.tsx` - Main dashboard (Uses ProtectedRoute)
- `/app/dashboard/go-live/page.tsx` - Go live page (Uses ProtectedRoute)
- `/app/dashboard/analytics/page.tsx` - Analytics page (Uses ProtectedRoute)
- `/app/dashboard/schedule/page.tsx` - Schedule page (Uses ProtectedRoute)
- `/app/dashboard/notifications/page.tsx` - Notifications page (Should use ProtectedRoute)

### Settings Pages

All pages under `/app/settings/` should use this pattern.

## Related Files

- `/components/protected-route.tsx` - ProtectedRoute component
- `/middleware.ts` - Server-side route protection
- `/contexts/auth-context.tsx` - Auth context provider
- `/lib/auth.ts` - Auth utility functions
- `/components/__tests__/protected-route.test.tsx` - Protection tests

## FAQ

**Q: Should I use middleware OR ProtectedRoute?**
A: Use BOTH. Middleware provides server-side protection, ProtectedRoute provides client-side UX.

**Q: Can I customize the loading state?**
A: Yes, you can modify the `ProtectedRoute` component to customize the loading UI.

**Q: What about API route protection?**
A: API routes should validate the auth token in the route handler. This pattern is for page protection only.

**Q: How do I protect only part of a page?**
A: Use conditional rendering based on `useAuth()` state within your component. `ProtectedRoute` is for entire pages.

## Changelog

- **2026-01-18**: Initial documentation created
- **2026-01-18**: Added comprehensive test coverage
- **2026-01-18**: Standardized pattern across dashboard pages

## References

- Issue #78: [BUG] Inconsistent Auth Protection Patterns
- [Auth Context Documentation](../contexts/auth-context.tsx)
- [Middleware Documentation](../middleware.ts)
