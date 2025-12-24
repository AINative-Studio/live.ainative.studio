# AINative Studio Live - API Quick Reference

**Base URL:** `https://api.ainative.studio/v1`

---

## Authentication

### Login
```bash
curl -X POST "https://api.ainative.studio/v1/public/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=yourpassword"
```
**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Using Auth Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.ainative.studio/v1/streams/me/profile"
```

---

## Streams

### Get Trending Streams
```
GET /streams/trending?limit=20
```

### Get Rising Streams
```
GET /streams/rising?limit=20
```

### Get Recommended (Auth Required)
```
GET /streams/recommended?limit=20
Authorization: Bearer TOKEN
```

### Get Stream by ID
```
GET /streams/id/{stream_id}
```

### Search Streams
```
GET /streams/search?query=gaming&status_filter=live&page=1&per_page=20
```

---

## Categories

### Get All Categories
```
GET /streams/categories
```

### Get Popular Categories
```
GET /streams/categories/popular?limit=10
```

### Get Category by Slug
```
GET /streams/categories/by-slug/ai-coding
```

### Get Streams in Category
```
GET /streams/categories/by-slug/ai-coding/streams
```

---

## Tags

### Get All Tags
```
GET /streams/streams/tags
```

### Get Popular Tags
```
GET /streams/streams/tags/popular?limit=20
```

### Get Tag Suggestions
```
GET /streams/streams/tags/suggestions?query=gam
```

---

## Users

### Get User Profile
```
GET /streams/users/{username}/profile
```

### Check if User is Live
```
GET /streams/users/{username}/live
```
**Response:**
```json
{
  "isLive": true,
  "stream": { "id": "...", "title": "...", ... }
}
```

### Get User's Streams
```
GET /streams/users/{username}/streams
```

### Get User's VODs
```
GET /streams/users/{username}/vods
```

### Get User's Schedule
```
GET /streams/users/{username}/schedule
```

### Get User's Followers
```
GET /streams/users/{username}/followers?page=1
```

### Get User's Following
```
GET /streams/users/{username}/following?page=1
```

---

## Follow System (Auth Required)

### Follow User
```
POST /streams/users/{username}/follow
Authorization: Bearer TOKEN
```

### Unfollow User
```
DELETE /streams/users/{username}/follow
Authorization: Bearer TOKEN
```

### Check if Following
```
GET /streams/users/{username}/follow
Authorization: Bearer TOKEN
```
**Response:**
```json
{ "isFollowing": true }
```

---

## My Profile (Auth Required)

### Get My Profile
```
GET /streams/me/profile
Authorization: Bearer TOKEN
```

### Update My Profile
```
PUT /streams/me/profile
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "Updated bio"
}
```

### Upload Avatar
```
POST /streams/me/profile/avatar
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

file=@avatar.png
```

---

## Schedule (Auth Required)

### Get My Schedule
```
GET /streams/me/schedule
Authorization: Bearer TOKEN
```

### Create Schedule Entry
```
POST /streams/me/schedule
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "18:00",
  "endTime": "21:00",
  "title": "Evening Stream",
  "categoryId": "uuid-here",
  "isRecurring": true
}
```

### Delete Schedule Entry
```
DELETE /streams/me/schedule/{schedule_id}
Authorization: Bearer TOKEN
```

---

## Chat

### Get Chat Messages
```
GET /streams/{stream_id}/chat?limit=50
```

### Get Chat History
```
GET /streams/{stream_id}/chat/history?before=2025-01-01T00:00:00Z&limit=50
```

### Send Message (Auth Required)
```
POST /streams/{stream_id}/chat
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "content": "Hello everyone!"
}
```

### WebSocket Connection
```
wss://api.ainative.studio/v1/streams/{stream_id}/chat/ws?token=YOUR_TOKEN
```

**WebSocket Message Types:**
- `chat_message` - New chat message
- `viewer_count` - Updated viewer count
- `viewer_join` - Viewer joined
- `viewer_leave` - Viewer left
- `system_message` - System announcement
- `error` - Error message

---

## VODs

### List All VODs
```
GET /streams/vods?page=1&per_page=20
```

### Get VOD by ID (Auth Required)
```
GET /streams/vods/{vod_id}
Authorization: Bearer TOKEN
```

### Get VOD Chapters
```
GET /streams/vods/{vod_id}/chapters
```

### Generate AI Chapters (Auth Required)
```
POST /streams/vods/{vod_id}/chapters/generate
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "useChatData": true,
  "minChapterDuration": 300,
  "maxChapters": 10
}
```

---

## Analytics (Auth Required)

### Channel Overview
```
GET /streams/analytics/channel
Authorization: Bearer TOKEN
```
**Response:**
```json
{
  "totalStreams": 45,
  "completedStreams": 40,
  "totalHoursStreamed": 120.5,
  "avgViewersPerStream": 150.25,
  "maxPeakViewers": 500,
  "totalUniqueViewers": 1200,
  "followerCount": 850
}
```

### Follower Growth
```
GET /streams/analytics/channel/growth?days=30
Authorization: Bearer TOKEN
```

### Viewer Growth
```
GET /streams/analytics/channel/viewer-growth?days=30
Authorization: Bearer TOKEN
```

### Top Streams
```
GET /streams/analytics/channel/top-streams?metric=peak_viewers&limit=10
Authorization: Bearer TOKEN
```
**Metrics:** `peak_viewers`, `total_views`, `duration`, `chat_messages`

### Best Streaming Times
```
GET /streams/analytics/channel/best-times
Authorization: Bearer TOKEN
```

### Audience Demographics
```
GET /streams/analytics/channel/audience
Authorization: Bearer TOKEN
```

### Category Breakdown
```
GET /streams/analytics/channel/categories
Authorization: Bearer TOKEN
```

---

## Dashboard (Auth Required)

### Dashboard Overview
```
GET /dashboard/overview
Authorization: Bearer TOKEN
```

### Quick Stats
```
GET /dashboard/quick-stats
Authorization: Bearer TOKEN
```

### Notifications
```
GET /dashboard/notifications?page=1
Authorization: Bearer TOKEN
```

### Unread Notification Count
```
GET /streams/notifications/follows/unread-count
Authorization: Bearer TOKEN
```

### Mark Notification as Read
```
POST /streams/notifications/follows/{notification_id}/read
Authorization: Bearer TOKEN
```

---

## Search

### Search Streams
```
GET /streams/search?query=gaming&category_id=uuid&status_filter=live&page=1&per_page=20
```

### Search Suggestions
```
GET /streams/search/suggestions?query=gam
```

### Trending Searches
```
GET /streams/search/trending
```

### Popular Searches
```
GET /streams/search/popular
```

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message here",
  "message": "Human readable message",
  "status": 400,
  "traceId": "uuid-for-debugging"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## TypeScript Types

```typescript
// Core types for frontend integration
interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'offline' | 'live' | 'ended' | 'processing';
  categoryId: string | null;
  category: Category | null;
  thumbnailUrl: string | null;
  viewerCount: number;
  peakViewers: number;
  tags: StreamTag[];
  startedAt: string | null;
  endedAt: string | null;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  streamCount: number;
  viewerCount: number;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isLive: boolean;
}

interface ChatMessage {
  id: string;
  streamId: string;
  userId: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  content: string;
  messageType: 'chat' | 'system' | 'subscription' | 'donation';
  badges: { type: string; label: string }[];
  createdAt: string;
}
```

---

**Last Updated:** 2025-12-24
