# AINative Studio Live - Backend Integration Sprint Plan

**Version:** 1.0.0
**Created:** 2025-12-24
**Status:** Planning
**Related:** [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)

---

## Overview

This sprint plan outlines the frontend-backend integration work for AINative Studio Live. The backend API is complete (see closed issues #353-386 in AINative-Studio/core), and this plan covers connecting the Next.js frontend to all backend services.

### Goals
- Replace all mock data with live API calls
- Implement real-time chat via WebSocket
- Add proper authentication flow
- Create a fully functional streaming platform

### Tech Stack
- **Frontend:** Next.js 13.5.1, TypeScript, Tailwind CSS
- **Backend API:** https://api.ainative.studio/v1
- **WebSocket:** wss://api.ainative.studio/v1
- **Authentication:** JWT Bearer tokens

---

## Sprint Structure

| Phase | Focus | Issues | Story Points |
|-------|-------|--------|--------------|
| Phase 1 | Foundation & Auth | #24-31 | 21 |
| Phase 2 | Types & Services | #32-38 | 18 |
| Phase 3 | WebSocket & Real-time | #39-42 | 13 |
| Phase 4 | Page Integration | #43-49 | 23 |
| Phase 5 | Dashboard & Protected | #50-55 | 21 |
| Phase 6 | Polish & Testing | #56-60 | 16 |
| **Total** | | **37 issues** | **112 points** |

---

## Phase 1: Foundation & Auth Setup

**Objective:** Set up the core infrastructure for API communication and authentication.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 24 | Create environment configuration | FEATURE | 2 | - |
| 25 | Create API client library | FEATURE | 5 | #24 |
| 26 | Create auth library | FEATURE | 5 | #25 |
| 27 | Create auth context provider | FEATURE | 3 | #26 |
| 28 | Update root layout with providers | REFACTOR | 2 | #27 |
| 29 | Integrate login page with API | FEATURE | 3 | #26 |
| 30 | Integrate register page with API | FEATURE | 3 | #26 |
| 31 | Add protected route middleware | FEATURE | 3 | #27 |

### Deliverables
- `.env.local` configuration
- `lib/api-client.ts` - HTTP client with auth handling
- `lib/auth.ts` - Token management and auth API calls
- `contexts/auth-context.tsx` - React context for auth state
- Updated `app/layout.tsx` with AuthProvider
- Working login/register flows
- Protected route middleware

---

## Phase 2: TypeScript Types & Core Services

**Objective:** Create type definitions and service modules for all API endpoints.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 32 | Update TypeScript types for API | REFACTOR | 3 | #25 |
| 33 | Create streams service | FEATURE | 3 | #25, #32 |
| 34 | Create users service | FEATURE | 3 | #25, #32 |
| 35 | Create chat service | FEATURE | 2 | #25, #32 |
| 36 | Create VOD service | FEATURE | 2 | #25, #32 |
| 37 | Create dashboard service | FEATURE | 3 | #25, #32 |
| 38 | Add toast notification system | FEATURE | 2 | #25 |

### Deliverables
- `types/index.ts` - Complete API type definitions
- `services/streams.ts` - Stream discovery, CRUD, categories, tags, search
- `services/users.ts` - Profile, content, follow system
- `services/chat.ts` - Chat messages, history
- `services/vod.ts` - VOD listing, chapters
- `services/dashboard.ts` - Overview, notifications, schedule, analytics
- Toast notifications for API feedback

---

## Phase 3: WebSocket & Real-time

**Objective:** Implement real-time functionality for live chat and viewer presence.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 39 | Create WebSocket client library | FEATURE | 5 | #26 |
| 40 | Create useStreamChat hook | FEATURE | 3 | #39 |
| 41 | Update chat-panel for real-time | REFACTOR | 3 | #40 |
| 42 | Implement viewer presence | FEATURE | 2 | #39 |

### Deliverables
- `lib/websocket.ts` - WebSocket manager with reconnection
- `hooks/use-stream-chat.ts` - Real-time chat hook
- Updated `components/chat-panel.tsx` with live functionality
- Viewer count updates via WebSocket

---

## Phase 4: Page Integration - Discovery

**Objective:** Connect all public-facing pages to the backend API.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 43 | Integrate homepage with API | REFACTOR | 5 | #33 |
| 44 | Integrate category page with API | REFACTOR | 3 | #33 |
| 45 | Integrate search page with API | REFACTOR | 3 | #33 |
| 46 | Integrate user profile page with API | REFACTOR | 3 | #34 |
| 47 | Integrate stream viewer page with API | REFACTOR | 5 | #33, #34, #40 |
| 48 | Create VOD viewer page | FEATURE | 3 | #36 |
| 49 | Create streams context provider | FEATURE | 3 | #33 |

### Deliverables
- `app/page.tsx` - Live trending/rising streams
- `app/category/[slug]/page.tsx` - Live category data
- `app/search/page.tsx` - Real search with filters
- `app/user/[username]/page.tsx` - Live user profiles
- `app/stream/[username]/page.tsx` - Full stream experience
- `app/vod/[id]/page.tsx` - VOD viewer (new page)
- `contexts/streams-context.tsx` - Global streams state

---

## Phase 5: Dashboard & Protected Pages

**Objective:** Implement all authenticated user features and dashboard functionality.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 50 | Integrate dashboard overview | REFACTOR | 5 | #37 |
| 51 | Create dashboard analytics page | FEATURE | 5 | #37 |
| 52 | Implement schedule management | FEATURE | 3 | #37 |
| 53 | Implement notifications system | FEATURE | 3 | #37 |
| 54 | Integrate settings page | REFACTOR | 3 | #34 |
| 55 | Implement go-live flow | FEATURE | 5 | #33, #39 |

### Deliverables
- `app/dashboard/page.tsx` - Live dashboard data
- `app/dashboard/analytics/page.tsx` - Channel analytics (new)
- Schedule CRUD in dashboard
- Notification dropdown with real-time updates
- `app/settings/page.tsx` - Profile editing, avatar upload
- Complete go-live flow with stream key

---

## Phase 6: Polish & Testing

**Objective:** Add loading states, error handling, and ensure quality.

### Issues

| # | Title | Type | Points | Dependencies |
|---|-------|------|--------|--------------|
| 56 | Add loading skeletons | REFACTOR | 3 | All Phase 4-5 |
| 57 | Implement error boundaries | FEATURE | 3 | - |
| 58 | Add comprehensive error handling | REFACTOR | 3 | All services |
| 59 | Performance optimization | REFACTOR | 5 | All pages |
| 60 | QA testing checklist | TEST | 2 | All |

### Deliverables
- Skeleton loading components
- `components/error-boundary.tsx`
- Graceful error states on all pages
- Optimized API calls, caching
- Full QA test pass

---

## Architecture Decisions

### State Management
- **Auth State:** React Context (AuthProvider)
- **Streams State:** React Context (StreamsProvider)
- **Local UI State:** useState/useReducer
- No Redux - keeping it simple with Context + hooks

### Data Fetching Pattern
- Server components for initial data where possible
- Client components with useEffect for dynamic data
- SWR or React Query considered but deferred for simplicity

### WebSocket Strategy
- Singleton WebSocket manager
- Automatic reconnection with exponential backoff
- Max 5 reconnect attempts
- Token refresh on connection

### Error Handling
- API client catches all errors
- Toast notifications for user feedback
- Error boundaries for crash recovery
- Graceful degradation to cached/mock data

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API downtime | High | Low | Fallback to mock data |
| WebSocket instability | Medium | Medium | Robust reconnection logic |
| Auth token expiry | Medium | Medium | Auto-refresh tokens |
| CORS issues | Medium | Low | API proxy in next.config.js |
| Performance issues | Medium | Medium | Lazy loading, pagination |

---

## Definition of Done

For each issue to be considered complete:
- [ ] Code implemented and tested locally
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Works with live API
- [ ] Handles loading states
- [ ] Handles error states
- [ ] Code reviewed (if applicable)
- [ ] Issue closed with commit reference

---

## Labels Used

| Label | Description |
|-------|-------------|
| `phase-1` through `phase-6` | Sprint phase |
| `frontend` | Frontend work |
| `integration` | API integration |
| `websocket` | WebSocket related |
| `auth` | Authentication related |
| `enhancement` | New functionality |
| `refactor` | Updating existing code |
| `testing` | Test-related work |

---

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Configure API URLs
4. Run `npm install`
5. Run `npm run dev`
6. Start with Phase 1, Issue #24

---

**Document Author:** AINative Engineering Team
**Last Updated:** 2025-12-24
