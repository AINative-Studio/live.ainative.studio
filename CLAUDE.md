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
**Deployment**: Vercel or Netlify
**Last Updated**: 2025-12-23

---

## Architecture

### File Structure
```
liveainativestudio/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── login/              # Authentication
│   ├── register/
│   ├── dashboard/          # Streamer dashboard
│   ├── stream/[username]/  # Stream viewer
│   ├── user/[username]/    # User profile
│   ├── category/[slug]/    # Category browse
│   └── search/             # Search page
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── stream-card.tsx
│   ├── stream-player.tsx
│   ├── chat-panel.tsx
│   └── chat-message.tsx
├── data/                   # Mock data (to be replaced with API)
├── docs/                   # Documentation
│   └── BRANDING_GUIDE.md   # Branding & design guide
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── public/                 # Static assets
│   └── ainative-icon.svg   # Logo
├── types/                  # TypeScript definitions
└── CLAUDE.md               # This file
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

### API Endpoints (To Be Implemented)
- `GET /v1/streams` - List live streams
- `POST /v1/streams` - Create stream (get ingest key)
- `GET /v1/streams/{id}` - Stream details
- `WS /v1/streams/{id}/chat/ws` - Live chat WebSocket
- `GET /v1/users/{username}` - User profile
- `POST /v1/users/{username}/follow` - Follow user
- `GET /v1/categories` - List categories
- `GET /v1/search` - Search streams/users

### Backend Issues
See GitHub Issues #353-386 in AINative-Studio/core for backend implementation.

---

## Current Status

### Implemented (Frontend Only)
- ✅ 11 pages with mock data
- ✅ Stream cards and grid layout
- ✅ Chat panel UI (mock messages)
- ✅ User profiles
- ✅ Category browsing
- ✅ Search (client-side)
- ✅ Authentication forms (no backend)

### Pending
- ⏳ Backend API integration
- ⏳ Real-time chat (WebSocket)
- ⏳ Live stream playback (Cloudflare Stream)
- ⏳ Authentication flow
- ⏳ Branding update (see BRANDING_GUIDE.md)

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
