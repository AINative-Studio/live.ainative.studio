# AINative Studio Live - Frontend Project Memory

## 🚨 MANDATORY RULES - ZERO TOLERANCE 🚨

### Rule 1: NO AI ATTRIBUTION (Absolute Zero Tolerance)

**🛑 STOP! READ THIS BEFORE EVERY COMMIT! 🛑**

**NEVER include ANY of the following in commits, PRs, issues, code comments, or documentation:**

❌ **ABSOLUTELY FORBIDDEN - NEVER USE:**
- "Claude", "Anthropic", "claude.com", "Claude Code", "Claude Desktop"
- "Generated with Claude", "Co-Authored-By: Claude"
- "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
- "Co-Authored-By: Claude <noreply@anthropic.com>"
- Any emoji + "Generated with" or "Powered by"
- "AI-generated" or "AI-assisted"
- Any reference to AI assistants, AI code generation, or automated tools

✅ **CORRECT FORMAT:**
```
Add stream player component

- Implement HLS playback
- Add viewer count display
- Create chat panel integration

Refs #123
```

❌ **FORBIDDEN FORMAT:**
```
Add stream player component

- Implement HLS playback

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**⚠️ ZERO TOLERANCE POLICY ⚠️**
- **CHECK EVERY COMMIT** before pushing

---

### Rule 2: FILE PLACEMENT (Zero Tolerance)

**NEVER create files in wrong locations:**

| ❌ FORBIDDEN | ✅ REQUIRED LOCATION |
|-------------|---------------------|
| `/*.md` (root, except README.md, CLAUDE.md) | `docs/filename.md` |
| Random files in app/ | Appropriate directory |

**Documentation Categories:**
- `docs/` - All documentation files

---

### Rule 3: GITHUB ISSUE TRACKING (Mandatory)

**NO CODE WITHOUT AN ISSUE. NO PR WITHOUT A LINK.**

**Before writing ANY code:**
1. Search for existing issue
2. If none exists, CREATE issue first
3. Assign yourself
4. Create branch: `[type]/[issue-number]-[short-description]`

**Issue Types:** `[BUG]`, `[FEATURE]`, `[TEST]`, `[REFACTOR]`, `[DOCS]`, `[DEVOPS]`

**Branch Examples:**
```bash
git checkout -b feature/123-add-stream-player
git checkout -b bug/456-fix-chat-scroll
git checkout -b test/789-add-component-tests
```

**Every commit must reference the issue:**
```bash
git commit -m "Add chat panel component

- Real-time message display
- Auto-scroll to bottom

Refs #123"
```

---

### Rule 4: TDD/BDD WORKFLOW & TESTING

**🚨 MANDATORY: RUN TESTS BEFORE CLAIMING THEY PASS 🚨**

```bash
# Run tests before any commit
npm test

# With coverage
npm test -- --coverage
```

**TDD Cycle:** Red → Green → Refactor

---

### Rule 5: PR REQUIREMENTS

**PR Title Format:** `[TYPE] Brief description - Fixes #[issue-number]`

**PR Description Must Include:**
```markdown
## Summary
- Clear description of changes

## Test Plan
- How to test
- Expected results

Closes #123
```

---

### Rule 6: STORY ESTIMATION

**Fibonacci Points:** 0, 1, 2, 3, 5, 8
- **0:** Trivial (typo, tiny UI)
- **1:** Clear, contained
- **2:** Slightly complex
- **3/5/8:** Large - **SPLIT first**

---

### Rule 7: SECURITY

- Never expose API keys in frontend code
- Validate all user inputs
- Use environment variables for sensitive config

---

### Quick Reference Checklist

Before ANY work:
- [ ] GitHub issue exists or created
- [ ] Branch follows naming convention
- [ ] No AI attribution anywhere

After work:
- [ ] PR links to issue (`Closes #123`)
- [ ] No Claude/Anthropic text anywhere
- [ ] All tests passing

---

## Project Overview

**Project**: AINative Studio Live - Developer Streaming Platform
**URL**: live.ainative.studio
**Tech Stack**: Next.js 13.5.1 + TypeScript 5.2.2 + Tailwind CSS 3.3.3
**Framework**: Next.js App Router
**Deployment**: Railway (auto-deploy from main)
**Last Updated**: 2026-06-17

---

## Architecture

### File Structure
```
liveainativestudio/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage (trending, rising, recommended, categories)
│   ├── login/              # Email + GitHub + Google OAuth login
│   │   └── callback/       # OAuth callback handler
│   ├── register/           # Registration with OAuth
│   ├── dashboard/          # Streamer dashboard
│   │   ├── go-live/        # Stream creation + RTMP/WebRTC setup
│   │   ├── analytics/      # Channel analytics with charts
│   │   ├── content/        # AI content pipeline (blog, snippets, transcript)
│   │   ├── moderators/     # Moderator management
│   │   ├── notifications/  # Follow notifications
│   │   └── schedule/       # Stream schedule CRUD
│   ├── stream/[username]/  # Live stream viewer + chat + AI summary
│   ├── user/[username]/    # User profile (followers, schedule, streams)
│   ├── category/[slug]/    # Category browse with sort
│   ├── search/             # Stream + user search
│   ├── tech/               # Browse streams by language/framework
│   │   └── [slug]/         # Streams using specific technology
│   ├── clips/              # Browse popular clips
│   ├── vod/[id]/           # VOD player with chapters + content export
│   ├── settings/           # Profile settings + avatar upload
│   └── api/whip/           # WHIP proxy for WebRTC streaming
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── navbar.tsx          # Nav with categories, tech, clips, search typeahead
│   ├── footer.tsx
│   ├── stream-card.tsx     # Stream card with language badges
│   ├── stream-player.tsx   # HLS/Cloudflare Stream player
│   ├── chat-panel.tsx      # Real-time chat + AI assistant
│   ├── chat-message.tsx    # Chat message (regular + AI styling)
│   ├── ai-summary-card.tsx # AI stream summary with auto-refresh
│   ├── clip-card.tsx       # Clip display card
│   ├── create-clip-dialog.tsx # Clip creation dialog
│   ├── language-badge.tsx  # Colored language indicator
│   ├── stream-setup-form.tsx # Stream setup with tech stack + GitHub repo
│   └── browser-stream-preview.tsx # WebRTC browser streaming
├── services/               # API service layer
│   ├── streams.ts          # Stream CRUD, categories, tags, search
│   ├── users.ts            # Profiles, follow, schedule, avatars
│   ├── chat.ts             # Chat messages (HTTP + WebSocket)
│   ├── vod.ts              # VOD browsing and chapters
│   ├── dashboard.ts        # Dashboard overview, analytics
│   ├── moderator.ts        # Moderator management
│   ├── clips.ts            # Clip creation and browsing
│   ├── ai-chat.ts          # AI Q&A, summaries, code explanation
│   └── content-pipeline.ts # Blog generation, transcripts, export
├── lib/                    # Utilities
│   ├── auth.ts             # Token management, login/register API
│   ├── api-client.ts       # HTTP client with snake_case transform
│   ├── websocket.ts        # WebSocket client for real-time chat
│   ├── whip-client.ts      # WHIP/WebRTC client for browser streaming
│   └── tech-stack.ts       # Language/framework definitions
├── contexts/               # React contexts
│   └── auth-context.tsx    # Auth provider with login/register/logout
├── e2e/                    # Playwright E2E tests (96+ tests)
├── types/                  # TypeScript definitions
├── public/                 # Static assets
└── CLAUDE.md               # Project instructions
```

---

## Design System

### Branding
- **Name**: AINative Studio Live
- **Logo**: `/public/ainative-icon.svg`
- **Reference**: See `docs/BRANDING_GUIDE.md` for complete design system

### Colors
```css
--brand-primary: #5867EF;     /* Purple */
--dark-1: #131726;            /* Background */
--dark-2: #22263c;            /* Cards */
--dark-3: #31395a;            /* Elevated */
--secondary: #338585;         /* Teal */
--accent: #FCAE39;            /* Amber */
--success: #10B981;           /* Live indicator */
```

### Typography
- **Body**: Poppins
- **Code**: Fira Code

---

## Development

### Running Locally
```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

### Building
```bash
npm run build
npm run start
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.ainative.studio
NEXT_PUBLIC_WS_URL=wss://api.ainative.studio
```

---

## Backend Integration

### API Base
- **REST**: `https://api.ainative.studio/v1`
- **WebSocket**: `wss://api.ainative.studio/v1/streams/{id}/chat/ws`
- **OpenAPI Spec**: `https://api.ainative.studio/v1/openapi.json`

### Key API Endpoints (60+ wired up)
- Auth: login, register, OAuth (GitHub/Google), refresh, me
- Streams: CRUD, start/end, categories, tags, search, trending, rising
- Users: profiles, follow/unfollow, followers/following, schedule
- Chat: WebSocket real-time + HTTP history
- VODs: browse, chapters, AI chapter generation
- Analytics: channel overview, growth, viewers, audience, export
- Dashboard: overview, quick stats, notifications

### Backend Notes
- API returns snake_case; `apiClient` auto-transforms to camelCase
- Stream end uses `/streams/{id}/end` (NOT `/streams/id/{id}/end`)
- OAuth callback tokens come as `accessToken` (transformed from `access_token`)

---

## Current Status

### Implemented & Live
- ✅ 30+ pages with real API integration
- ✅ Authentication: email + GitHub OAuth + Google OAuth
- ✅ Live streaming: RTMP (OBS) + WebRTC/WHIP (browser)
- ✅ Real-time chat via WebSocket with reconnection
- ✅ Stream viewer with follow, like, share, clip buttons
- ✅ User profiles with followers, following, schedule
- ✅ Category browsing with sort (viewers/recent/trending)
- ✅ Search: streams + users + typeahead suggestions
- ✅ Tech-stack discovery: browse by language/framework
- ✅ Clips system: create from live/VOD, browse page
- ✅ Code-aware stream pages: GitHub repo, language badges
- ✅ AI chat assistant: Ask AI button, @ai trigger, AI summary card
- ✅ Content pipeline: blog drafts, code snippets, transcripts, export
- ✅ Dashboard: analytics with charts, moderators, schedule, notifications
- ✅ VOD player with chapters, transcript, content export
- ✅ Avatar upload in settings
- ✅ Zombie stream detection + End Stream on dashboard
- ✅ 96+ Playwright E2E tests

### Pending (Backend)
- ⏳ Clips backend endpoints (frontend ready)
- ⏳ AI chat/summary backend endpoints (frontend ready)
- ⏳ Content pipeline backend endpoints (frontend ready)
- ⏳ Rich GitHub integration (core has APIs, not yet exposed)

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 13.5.1 | Framework |
| react | 18.2.0 | UI Library |
| typescript | 5.2.2 | Type Safety |
| tailwindcss | 3.3.3 | Styling |
| @radix-ui/* | latest | Accessible components |
| lucide-react | 0.446.0 | Icons |
| react-hook-form | 7.53.0 | Forms |
| zod | 3.23.8 | Validation |

---

## Contact & Resources

- **Main Site**: https://www.ainative.studio
- **Backend Repo**: AINative-Studio/core
- **Design Reference**: https://www.ainative.studio/design-system-showcase

---

**Last Updated**: 2025-12-23
**Status**: Frontend complete, awaiting backend integration
