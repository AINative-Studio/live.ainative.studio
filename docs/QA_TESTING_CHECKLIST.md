# QA Testing Checklist

## Environment

- **Production API**: https://api.ainative.studio/v1
- **Frontend URL**: https://live.ainative.studio
- **Test Accounts**: TBD

## Test Status

- **Last tested**: [DATE]
- **Tested by**: [NAME]
- **Build version**: [VERSION]
- **Environment**: [Production/Staging]

---

## Authentication Tests

- [ ] **Login with valid credentials**
  - Navigate to /login
  - Enter valid email/username and password
  - Click Login button
  - **Expected**: User redirected to dashboard, session created successfully

- [ ] **Login with invalid credentials**
  - Navigate to /login
  - Enter invalid email/username or password
  - Click Login button
  - **Expected**: Error message displayed ("Invalid credentials"), no redirect, no session created

- [ ] **Register new account**
  - Navigate to /register
  - Fill in all required fields (username, email, password, display name)
  - Click Register button
  - **Expected**: Account created, user logged in, redirected to dashboard

- [ ] **Register with existing email**
  - Navigate to /register
  - Enter email that already exists in database
  - Fill other fields and submit
  - **Expected**: Error message displayed ("Email already registered")

- [ ] **Register with existing username**
  - Navigate to /register
  - Enter username that already exists in database
  - Fill other fields and submit
  - **Expected**: Error message displayed ("Username already taken")

- [ ] **Logout clears session**
  - While logged in, click Logout button
  - Attempt to access protected route (e.g., /dashboard)
  - **Expected**: Session cleared, redirected to login page

- [ ] **Protected routes redirect to login**
  - Without logging in, navigate to /dashboard
  - **Expected**: Automatically redirected to /login

- [ ] **Token refresh works**
  - Stay logged in for extended period (near token expiration)
  - Perform an action that requires authentication
  - **Expected**: Token refreshed automatically, no logout, action completes

- [ ] **Session persists on page reload**
  - Log in successfully
  - Reload the page (F5 or Cmd+R)
  - **Expected**: User remains logged in, session data persists

---

## Stream Discovery Tests

- [ ] **Homepage loads trending streams**
  - Navigate to homepage (/)
  - **Expected**: Trending/live streams display in grid layout, stream cards show title, category, viewer count, thumbnail

- [ ] **Homepage loads categories**
  - Navigate to homepage (/)
  - Scroll to categories section
  - **Expected**: All available categories display with thumbnails and names

- [ ] **Category page shows streams in category**
  - Click on a category (e.g., "Web Development")
  - Navigate to /category/[slug]
  - **Expected**: All live streams in that category display, correct category name shown

- [ ] **Search returns relevant results**
  - Navigate to /search
  - Enter search query (e.g., "React")
  - Submit search
  - **Expected**: Relevant streams and users display in results

- [ ] **Search filters work**
  - Perform a search
  - Apply filters (category dropdown, status toggle)
  - **Expected**: Results update based on selected filters

- [ ] **Empty state shown when no results**
  - Search for something that doesn't exist (e.g., "xyzabc123")
  - **Expected**: "No results found" message displays with helpful text

---

## User Profile Tests

- [ ] **Profile page loads user data**
  - Navigate to /user/[username]
  - **Expected**: User's display name, bio, avatar, follower count, social links all display correctly

- [ ] **Follow button works (logged in)**
  - While logged in, visit another user's profile
  - Click "Follow" button
  - **Expected**: Button changes to "Following", follower count increments by 1

- [ ] **Unfollow button works**
  - While following a user, click "Following" button
  - Confirm unfollow action
  - **Expected**: Button changes back to "Follow", follower count decrements by 1

- [ ] **Follower count updates**
  - Follow/unfollow a user
  - **Expected**: Follower count updates in real-time without page reload

- [ ] **User's streams tab loads**
  - On user profile, click "Streams" tab
  - **Expected**: List of user's recent streams displays

- [ ] **User's VODs tab loads**
  - On user profile, click "VODs" tab
  - **Expected**: List of user's video-on-demand content displays

- [ ] **User's schedule displays**
  - On user profile, check schedule section
  - **Expected**: User's streaming schedule displays if set

---

## Stream Viewer Tests

- [ ] **Stream page loads when user is live**
  - Navigate to /stream/[username] for a live user
  - **Expected**: Video player loads with HLS stream, chat panel appears on right

- [ ] **Offline message when user not live**
  - Navigate to /stream/[username] for offline user
  - **Expected**: "User is currently offline" message displays, no video player

- [ ] **Chat connects via WebSocket**
  - On a live stream page, open browser DevTools Network tab
  - Filter for WS connections
  - **Expected**: WebSocket connection to chat endpoint established successfully

- [ ] **Chat messages display in real-time**
  - While viewing a live stream with active chat
  - **Expected**: New messages appear automatically without page reload, auto-scroll to bottom

- [ ] **Can send chat messages (logged in)**
  - While logged in, viewing a live stream
  - Type message in chat input and press Enter
  - **Expected**: Message appears in chat immediately, attributed to logged-in user

- [ ] **Viewer count updates**
  - On a live stream page, monitor viewer count
  - **Expected**: Viewer count updates as viewers join/leave (every 30-60 seconds)

- [ ] **Follow button works on stream page**
  - While logged in, on a stream page for user you don't follow
  - Click "Follow" button
  - **Expected**: Button changes to "Following", user added to following list

---

## Dashboard Tests

- [ ] **Dashboard loads for logged-in user**
  - Log in and navigate to /dashboard
  - **Expected**: Dashboard displays with user's personalized data

- [ ] **Quick stats display correctly**
  - On dashboard, check stats section
  - **Expected**: Total views, followers, streams count display with correct numbers

- [ ] **Recent streams list loads**
  - On dashboard, check recent streams section
  - **Expected**: List of user's recent streams displays with dates, titles, view counts

- [ ] **Notifications load**
  - On dashboard, check notifications panel
  - **Expected**: Recent notifications display (new followers, mentions, etc.)

- [ ] **Schedule management works**
  - On dashboard, navigate to schedule section
  - Add/edit a scheduled stream
  - **Expected**: Schedule saves successfully, displays on profile

- [ ] **Analytics charts render**
  - On dashboard, check analytics section
  - **Expected**: Charts display viewer trends, engagement metrics without errors

---

## Settings Tests

- [ ] **Profile loads current data**
  - Navigate to /settings or /dashboard/settings
  - **Expected**: All form fields pre-populated with current user data

- [ ] **Can update display name**
  - In settings, change display name
  - Click Save button
  - **Expected**: Success message, display name updates across site

- [ ] **Can update bio**
  - In settings, edit bio text
  - Click Save button
  - **Expected**: Success message, bio updates on profile page

- [ ] **Avatar upload works**
  - In settings, click avatar upload area
  - Select image file
  - Click Save button
  - **Expected**: Image uploads, thumbnail displays in profile

- [ ] **Social links save**
  - In settings, add/edit social media links (Twitter, GitHub, etc.)
  - Click Save button
  - **Expected**: Links save, display on profile page with correct icons

---

## Go Live Tests

- [ ] **Can create new stream**
  - Navigate to /dashboard or "Go Live" button
  - Click "Create Stream" or "Go Live"
  - **Expected**: Stream creation form appears

- [ ] **Stream key displays**
  - On Go Live page or settings
  - **Expected**: Stream key/ingest URL displays (partially masked for security)

- [ ] **Can copy stream key**
  - Click "Copy" button next to stream key
  - **Expected**: Key copied to clipboard, confirmation message shows

- [ ] **Can set title and category**
  - On Go Live form, enter stream title
  - Select category from dropdown
  - **Expected**: Title and category save with stream metadata

- [ ] **Start stream button works**
  - Complete Go Live form, click "Start Stream"
  - **Expected**: Stream becomes live, appears on homepage, user redirected to stream page

- [ ] **End stream button works**
  - While streaming, click "End Stream" button
  - Confirm action
  - **Expected**: Stream ends, no longer appears on homepage, VOD created if enabled

---

## Error Handling Tests

- [ ] **Network error shows toast**
  - Disconnect from network or use DevTools to simulate offline
  - Attempt an action (e.g., send chat message)
  - **Expected**: Toast notification with error message ("Network error, please try again")

- [ ] **404 pages display correctly**
  - Navigate to non-existent URL (e.g., /nonexistent-page)
  - **Expected**: Custom 404 page displays with helpful navigation links

- [ ] **Error boundaries catch crashes**
  - If possible, trigger a component error (use DevTools or test account)
  - **Expected**: Error boundary displays fallback UI instead of blank page

- [ ] **Loading states display**
  - Navigate to pages with data fetching
  - **Expected**: Loading skeletons or spinners display while data loads

---

## Performance Tests

- [ ] **Homepage loads in < 2s**
  - Clear cache, navigate to homepage
  - Measure load time (use DevTools Performance tab)
  - **Expected**: Page fully interactive in under 2 seconds on reasonable connection

- [ ] **No console errors**
  - Open browser DevTools Console
  - Navigate through all major pages
  - **Expected**: No JavaScript errors or warnings (404s for missing assets acceptable if known)

- [ ] **No memory leaks in chat**
  - On stream page, leave chat open for 10+ minutes
  - Monitor DevTools Memory tab
  - **Expected**: Memory usage remains stable, no continuous growth

- [ ] **Smooth scrolling**
  - Scroll through homepage stream grid
  - Scroll through long chat history
  - **Expected**: 60fps scrolling, no jank or stuttering

---

## Cross-Browser Tests

- [ ] **Chrome/Edge**: All tests pass
- [ ] **Firefox**: All tests pass
- [ ] **Safari**: All tests pass
- [ ] **Mobile Safari (iOS)**: Core functionality works
- [ ] **Mobile Chrome (Android)**: Core functionality works

---

## Accessibility Tests

- [ ] **Keyboard navigation**: Can navigate site using Tab/Enter/Space
- [ ] **Screen reader**: Major elements have proper ARIA labels
- [ ] **Color contrast**: Text meets WCAG AA standards
- [ ] **Focus indicators**: Clear focus states on interactive elements

---

## Notes & Issues Found

**Add any bugs, issues, or observations during testing here:**

- [Date] [Tester Name]: [Description of issue]
- Example: 2025-12-24 John Doe: Chat scroll jumps when new messages arrive

---

## Sign-off

- [ ] **All critical tests passing**
- [ ] **All blocking bugs resolved**
- [ ] **Ready for production deployment**

**QA Lead**: ___________________
**Date**: ___________________
**Signature**: ___________________
