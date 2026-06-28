# fullMvpTickets.md — GRIOT MVP Remaining Tickets

## Project Rule

Read `notes/instructions/codexInstructions.md` before every task.

Do only the assigned ticket.
Do not implement future tickets early.
Do not redesign the UI unless the ticket explicitly asks for it.
After each task, summarize:

- files changed
- what was implemented
- how to test

---

# Current Status

Already implemented:

1. Supabase post persistence
2. Backend-driven feed
3. Removed local fake `addRecording` flow
4. `/saved` screen MVP
5. `/my-voices` screen MVP

Current stack:

- Expo / React Native
- Expo Router
- Zustand
- Supabase DB
- Cloudinary uploads

---

# Ticket 6 — Add Geolocation Permission + Capture

## Goal

Capture the user’s location when they record a voice.

## Requirements

1. Install and use `expo-location`.
2. Request foreground location permission.
3. When a user creates a post, capture:
   - `latitude`
   - `longitude`

4. Include those values in the Supabase `createPost()` payload.
5. If permission is denied, still allow posting with `latitude` and `longitude` as `null`.
6. Do not block recording if location fails.
7. Add clear logs:
   - location granted
   - location denied
   - location capture failed

## Do Not

- Do not build map UI.
- Do not add location search.
- Do not add reverse geocoding yet.

## Test

- Record a voice.
- Confirm Supabase row contains latitude and longitude.
- Deny permission and confirm post still works.

---

# Ticket 7 — Fetch Nearby Feed

## Goal

Use location to prioritize nearby posts.

## Requirements

1. Add a `getNearbyPosts()` service function.
2. Use the current user location if available.
3. For MVP, fetch all posts from Supabase and sort client-side by distance.
4. Add a small distance helper:
   - input: user lat/lng + post lat/lng
   - output: distance in miles or km

5. Populate `distance` on `AudioPost`.
6. Feed should still work if no location is available:
   - fallback to latest posts

## Do Not

- Do not create PostGIS functions yet.
- Do not optimize database geo queries yet.
- Do not add map UI.

## Test

- Create posts with coordinates.
- Confirm closer posts appear first.
- Confirm no-location fallback still loads feed.

---

# Ticket 8 — Lightweight Local Profile

## Goal

Give the user a basic identity without full auth.

## Requirements

1. Add local profile state to Zustand:
   - username
   - avatar
   - town
   - neighborhood

2. Create `/profile` screen.
3. Allow user to edit:
   - username
   - town
   - neighborhood

4. Persist profile locally using Zustand persist or AsyncStorage.
5. Use profile values when creating posts.
6. If no profile exists, use safe defaults.

## Do Not

- Do not add Supabase Auth.
- Do not add email/password.
- Do not upload avatar yet.

## Test

- Update profile.
- Record a voice.
- Confirm post uses updated username/town/neighborhood.

---

# Ticket 9 — Persist Views

## Goal

Views should update in Supabase, not only locally.

## Requirements

1. Add `incrementPostViews(postId)` in `postService.ts`.
2. When a post becomes active, increment views.
3. Prevent excessive increments in one session:
   - track viewed post IDs locally in memory
   - only increment once per app session per post

4. Update local Zustand state optimistically.

## Do Not

- Do not add per-user view tracking.
- Do not add analytics table yet.

## Test

- Open feed.
- Confirm active post view count increases in Supabase.
- Scroll away and back.
- Confirm it does not increment repeatedly in the same session.

---

# Ticket 10 — Persist Reactions

## Goal

Emoji reactions should update in Supabase.

## Requirements

1. Add `addPostReaction(postId, emoji)` in `postService.ts`.
2. Use the existing `reactions` JSONB field.
3. Update local UI optimistically.
4. Persist the increment to Supabase.
5. Keep multiple taps allowed for MVP.

## Do Not

- Do not add per-user reaction limits.
- Do not add reaction tables yet.
- Do not add auth.

## Test

- Tap emoji reaction.
- UI updates immediately.
- Supabase `reactions` JSON updates.

---

# Ticket 11 — Persist Saves Locally

## Goal

Saved posts should survive app reload.

## Requirements

1. Persist `saved` IDs using Zustand persist or AsyncStorage.
2. Ensure `/saved` still works after app restart.
3. If a saved post no longer exists in feed, ignore it gracefully.

## Do Not

- Do not persist saves to Supabase yet.
- Do not add auth.

## Test

- Save a post.
- Kill and reopen app.
- Confirm saved post remains in `/saved`.

---

# Ticket 12 — Improve Empty States

## Goal

Make empty screens feel intentional.

## Requirements

Add polished empty states for:

1. Feed with no posts
2. Saved with no posts
3. My Voices with no posts

Tone should match GRIOT:

- calm
- voice-first
- emotional
- minimal

Suggested copy:

Feed:
“No voices nearby yet.”
“Be the first to speak.”

Saved:
“Aucune voix sauvegardée.”
“Les voix que tu veux retrouver vivront ici.”

My Voices:
“Tu n’as encore rien partagé.”
“Ta première voix peut commencer ici.”

## Do Not

- Do not redesign the full screens.
- Do not add illustrations yet.

## Test

- Clear data.
- Confirm each empty state appears correctly.

---

# Ticket 13 — Basic Loading + Error States

## Goal

Make backend loading feel stable.

## Requirements

1. Add loading state when fetching posts.
2. Add error state if fetching fails.
3. Add posting state while upload/createPost is running.
4. Prevent double recording/posting while upload is in progress.
5. Show simple UI text:
   - “Chargement des voix…”
   - “Impossible de charger les voix.”
   - “Publication…”

## Do Not

- Do not add skeleton animations.
- Do not add toast library.

## Test

- Slow network.
- Confirm loading appears.
- Force error and confirm error message.

---

# Ticket 14 — Replace Category “vente” with “real_talk”

## Goal

Align MVP categories with GRIOT identity.

## Requirements

Replace category union:

- `social`
- `security`
- `vente`

with:

- `social`
- `security`
- `real_talk`

Update UI labels:

- social: “Social”
- security: “Alertes”
- real_talk: “Real talk”

Update emoji:

- social: 😂
- security: 🚨
- real_talk: 💭

Update Supabase inserts accordingly.

## Do Not

- Do not migrate old data unless necessary.
- Do not build category filters yet.

## Test

- Record a real_talk voice.
- Confirm Supabase category stores `real_talk`.
- Confirm UI renders correctly.

---

# Ticket 15 — Category Filter MVP

## Goal

Allow users to listen by category.

## Requirements

1. Add simple category selector on feed:
   - All
   - Social
   - Alertes
   - Real talk

2. Filter currently loaded posts client-side.
3. Keep auto-play working when filter changes.
4. If selected category has no posts, show empty state.

## Do Not

- Do not query Supabase per category yet.
- Do not redesign feed UI.

## Test

- Select each category.
- Confirm feed updates.
- Confirm first filtered post auto-plays.

---

# Ticket 16 — Basic Report Post

## Goal

Add minimal safety mechanism.

## Requirements

1. Add `reports` table in Supabase or document SQL needed.
2. Add `reportPost(postId, reason)` service.
3. Add a simple “Report” action in AudioCard or bottom system.
4. Use fixed reasons:
   - spam
   - harmful
   - false_info
   - other

5. For MVP, no admin dashboard required.

## Do Not

- Do not delete reported posts automatically.
- Do not build moderation UI yet.

## Test

- Report a post.
- Confirm row appears in Supabase.

---

# Ticket 17 — MVP Cleanup Pass

## Goal

Remove dead code and stabilize naming.

## Requirements

1. Remove obsolete commented code.
2. Remove unused imports.
3. Ensure naming is consistent:
   - posts, not recordings, for published backend content
   - recording, only for active capture flow

4. Ensure TypeScript has no `any` unless unavoidable.
5. Fix typos:
   - `bg-gren` → `bg-green`
   - `Relachez` → `Relâchez`

6. Ensure app runs without console noise except intentional logs.

## Do Not

- Do not change behavior.
- Do not redesign UI.

## Test

- Run TypeScript/lint if available.
- Manually test record → publish → feed → save → my voices.

---

# Ticket 18 — MVP Smoke Test Script

## Goal

Create a repeatable manual test checklist.

## Requirements

Create `docs/mvpSmokeTest.md`.

Include tests for:

1. App launch
2. Feed fetch
3. Auto-play
4. Record voice
5. Cloudinary upload
6. Supabase insert
7. My Voices
8. Saved
9. Reactions
10. Views
11. Location permission
12. No-location fallback

## Do Not

- Do not add automated tests yet.

---

# Final MVP Definition

GRIOT MVP is complete when:

1. User can open app and hear backend-loaded voices.
2. User can record and publish a voice.
3. Audio uploads to Cloudinary.
4. Post metadata persists in Supabase.
5. Feed loads from Supabase.
6. User can save voices locally.
7. User can see their own voices locally.
8. App captures location when available.
9. Feed prioritizes nearby voices.
10. Basic reactions and views persist.
11. App has minimal safety reporting.
12. App survives restart without losing core user state.

---

# Important Reminder

Do not build authentication until after this MVP is stable.

Auth comes after the anonymous/local identity loop works.
