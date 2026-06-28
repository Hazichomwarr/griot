# GRIOT — Refined MVP Codex Instructions

## Product North Star

GRIOT is the voice of a neighborhood.

It is not a traditional social network.
It is not an audio TikTok.
It is not a podcast app.

GRIOT helps people hear short nearby voice fragments that reveal what is happening, what people feel, and what a place sounds like.

The product should feel:

- calm
- emotional
- minimal
- local
- voice-first
- human

Every feature should strengthen this idea:

> Hear the voice of a neighborhood.

---

# Engineering Rules

Before writing code:

1. Read the existing architecture.
2. Preserve current patterns.
3. Prefer small refactors over rewrites.
4. Never introduce unnecessary abstractions.
5. Keep the MVP simple.
6. Do only the assigned ticket.
7. Do not implement future tickets early.

---

# Architecture

## Components

Components are UI only.

They may:

- render data
- receive props
- emit user actions

They should not:

- call Supabase directly
- call Cloudinary directly
- contain backend logic

---

## Store — Zustand

Zustand is for UI/client state.

It may store:

- active post id
- saved local ids
- my local post ids
- local profile
- current language
- loading/error flags if already part of existing pattern

It should not:

- contain database logic
- insert/update Supabase directly
- upload files directly

---

## Services

Services contain business/backend logic.

They may:

- call Cloudinary
- call Supabase
- transform backend data into UI data
- fetch posts
- create posts
- update reactions/views

---

## Lib

Lib contains infrastructure and low-level utilities.

Examples:

- Supabase client
- safe audio cleanup
- shared helpers

---

# Dependency Rule

Do not modify:

- package.json
- package-lock.json
- yarn.lock
- app.json
- app.config.js
- babel.config.js
- metro.config.js
- tsconfig.json

unless the task explicitly asks you to.

Do not run:

- npm install
- yarn add
- npx expo install
- expo upgrade
- expo-doctor --fix

If a dependency/config change is necessary, stop and explain:

1. why it is needed
2. exactly which files would change
3. exact commands recommended
4. risks of the change

---

# Code Rules

- TypeScript only.
- Functional components only.
- Expo Router.
- Avoid unnecessary dependencies.
- Prefer composition over inheritance.
- Keep functions small.
- Avoid `any` unless unavoidable.
- Keep comments concise and helpful.
- Preserve existing naming unless a ticket explicitly asks to rename.

---

# Localization Rule

GRIOT must be language-neutral from day one.

Do not hardcode user-facing strings directly inside components.

Instead:

1. Centralize strings in a localization file.
2. Use stable keys.
3. Default language may be English for now.
4. Prepare for French later.
5. Do not install an i18n library unless explicitly asked.

Bad:

```tsx
<Text>Share your voice</Text>
```

Good:

```tsx
<Text>{t.shareVoice}</Text>
```

For this MVP, a simple local object is enough.

Example:

```ts
export const strings = {
  en: {
    shareVoice: "Share your voice",
    feed: "Feed",
  },
  fr: {
    shareVoice: "Partage ta voix",
    feed: "Fil",
  },
};
```

---

# Category Direction

GRIOT should use two simple intent categories:

## 1. Moments

For funny, emotional, unexpected, human stories.

Examples:

- a funny street story
- a small emotional moment
- a surprising encounter
- a neighborhood joke
- a personal reflection

Suggested key:

```ts
"moments";
```

Suggested emoji:

```txt
😂
```

---

## 2. Around You

For things happening nearby.

Examples:

- traffic
- delays
- noise
- events
- restaurant recommendations
- alerts
- local questions
- anything useful around the neighborhood

Suggested key:

```ts
"around_you";
```

Suggested emoji:

```txt
📍
```

---

Do not use old categories:

- social
- security
- vente
- real_talk

unless needed only for backward compatibility.

---

# Coding Workflow

For every task, work in this order:

1. Explain the feature.
2. Write pseudo-code.
3. Implement.
4. Summarize files changed.
5. Explain how to test.

---

# Current MVP Status

Already implemented:

1. Cloudinary audio uploads
2. Supabase post persistence
3. Backend-driven feed
4. Local saved posts screen
5. Local my voices screen
6. Geolocation capture
7. Reverse geocoding attempt
8. Basic recording and playback flow
9. Floating mic system
10. Voice feed UI

---

# Remaining MVP Tickets

Give Codex one ticket at a time.

---

## Ticket 6A — Fix Reverse Geocoding Fallback

### Goal

Make location display reliable across native and web.

### Context

Coordinates are captured correctly.

On web, Expo reverse geocoding may return empty results.

Native mobile may work differently.

The app should never block publishing if place resolution fails.

### Requirements

1. Keep latitude and longitude capture.
2. If reverse geocoding works, use resolved place.
3. If reverse geocoding fails, use local profile location if available.
4. If no local profile exists, use safe fallback.
5. Add clear logs:
   - coordinates captured
   - reverse geocoding succeeded
   - reverse geocoding failed
   - fallback location used

6. Do not add Google Places.
7. Do not add maps.
8. Do not add backend geocoding.

### Test

- Test on web.
- Test on Expo Go if available.
- Confirm post still publishes in both cases.
- Confirm coordinates are still saved even if place name fallback is used.

---

## Ticket 7 — Localization Foundation

### Goal

Remove hardcoded user-facing strings from core screens.

### Requirements

1. Create a simple localization file, for example:

```txt
src/lib/i18n/strings.ts
```

2. Add at least English and French string objects.
3. Add a simple helper for selecting current strings.
4. Use English as default for now.
5. Replace hardcoded strings in:
   - `FloatingMic`
   - `record.tsx`
   - `/saved`
   - `/my-voices`
   - main feed empty/loading/error states if present

6. Do not install an i18n library.
7. Do not add a language switcher yet.

### Test

- App still renders all text.
- No visible undefined labels.
- Core UI text comes from localization file.

---

## Ticket 8 — Replace Categories With Moments / Around You

### Goal

Simplify GRIOT to two categories.

### Requirements

1. Update category type to:

```ts
"moments" | "around_you";
```

2. Replace old category UI with:
   - Moments
   - Around You

3. Use localized labels from strings file.

4. Use emojis:
   - Moments: 😂
   - Around You: 📍

5. Update createPost payload to use new category values.

6. Preserve old posts gracefully:
   - if category is old/unknown, map it to `moments` or display fallback.

### Do Not

- Do not delete old DB records.
- Do not run DB migrations unless necessary.
- Do not build category filters yet.

### Test

- Record a Moments post.
- Record an Around You post.
- Confirm Supabase stores the new category keys.
- Confirm old posts do not crash the UI.

---

## Ticket 9 — Category Filter MVP

### Goal

Let users choose what kind of voices they want to hear.

### Requirements

1. Add simple category filter on feed:
   - All
   - Moments
   - Around You

2. Filter currently loaded posts client-side.
3. Keep auto-play working after filter changes.
4. If selected filter has no posts, show localized empty state.
5. Do not query Supabase per category yet.

### Test

- Select All.
- Select Moments.
- Select Around You.
- Confirm auto-play starts on first filtered post.
- Confirm empty state works.

---

## Ticket 10 — Nearby Feed Sorting

### Goal

Prioritize nearby posts.

### Requirements

1. Use captured user location if available.
2. Sort loaded posts client-side by distance.
3. Add distance helper:
   - input user coordinates + post coordinates
   - output readable distance

4. Populate `distance` on post UI when available.
5. If user location unavailable, fallback to newest posts.

### Do Not

- Do not use PostGIS yet.
- Do not add map UI.
- Do not add backend geo functions.

### Test

- Posts with closer coordinates appear first.
- Posts without coordinates do not crash sorting.
- No-location fallback still loads newest feed.

---

## Ticket 11 — Persist Views

### Goal

Views should update in Supabase.

### Requirements

1. Add `incrementPostViews(postId)` in `postService.ts`.
2. When a post becomes active, increment views.
3. Track viewed post ids locally in memory for the current app session.
4. Only increment once per post per session.
5. Update local UI optimistically.

### Do Not

- Do not add user-specific view tracking.
- Do not add analytics tables.
- Do not add auth.

### Test

- Open feed.
- Active post increments views in Supabase.
- Scroll away and back.
- It does not repeatedly increment in same session.

---

## Ticket 12 — Persist Reactions

### Goal

Emoji reactions should update in Supabase.

### Requirements

1. Add `addPostReaction(postId, emoji)` in `postService.ts`.
2. Update JSONB `reactions`.
3. Update local UI optimistically.
4. Multiple taps are allowed for MVP.
5. Use current emojis unless another ticket changes them.

### Do Not

- Do not add per-user reaction limits.
- Do not add reaction table.
- Do not add auth.

### Test

- Tap reaction.
- UI updates immediately.
- Supabase reactions JSON updates.

---

## Ticket 13 — Persist Saved Locally

### Goal

Saved posts survive app restart.

### Requirements

1. Persist saved post ids locally.
2. Use existing persistence pattern if present.
3. If no persistence exists, implement simple AsyncStorage-based persistence without adding dependencies.
4. `/saved` should work after restart.
5. If saved id no longer exists in feed, ignore it gracefully.

### Do Not

- Do not persist saves to Supabase yet.
- Do not add auth.

### Test

- Save a post.
- Kill app.
- Reopen app.
- Saved post still appears.

---

## Ticket 14 — Improve Empty, Loading, Error States

### Goal

Make backend states feel stable and intentional.

### Requirements

1. Add localized loading text for feed.
2. Add localized error text for feed fetch failure.
3. Add localized empty states for:
   - Feed
   - Saved
   - My Voices
   - Filtered category results

4. Add posting state during upload/createPost.
5. Prevent double post while upload is in progress.

### Do Not

- Do not add toast library.
- Do not add skeleton animations.

### Test

- Empty feed state.
- Saved empty state.
- My Voices empty state.
- Posting state appears.
- Double post is prevented.

---

## Ticket 15 — Clean Bottom Navigation

### Goal

Make navigation match the MVP structure.

### Requirements

1. Floating bottom system should clearly expose:
   - Feed
   - My Voices
   - Record mic
   - Saved

2. Use localized labels.
3. Use `usePathname()` to highlight active destination.
4. Keep central mic visually dominant.
5. Do not mix "Saved" destination with "Save" action.
6. Save/Unsave action should remain separate from navigation.

### Test

- Navigate `/`
- Navigate `/my-voices`
- Navigate `/saved`
- Navigate `/record`
- Active route is highlighted correctly.

---

## Ticket 16 — Save / Unsave Action Placement

### Goal

Keep Save as an action, not a destination.

### Requirements

1. Ensure active post can be saved/unsaved.
2. Save/Unsave should not be confused with `/saved`.
3. It may live:
   - subtly on `AudioCard`, or
   - above bottom navigation, or
   - in a small contextual action zone.

4. Use localized labels.
5. Use optimistic UI.

### Do Not

- Do not persist saves to Supabase.
- Do not add auth.

### Test

- Save active post.
- Label changes instantly.
- Go to Saved screen and see it.
- Unsave and confirm it disappears.

---

## Ticket 17 — Basic Report Post

### Goal

Add minimal safety.

### Requirements

1. Add SQL instructions for `reports` table if table does not exist.
2. Add `reportPost(postId, reason)` service.
3. Add simple report action.
4. Reasons:
   - spam
   - harmful
   - false_info
   - other

5. Use localized labels.
6. No admin dashboard.

### Do Not

- Do not automatically delete reported posts.
- Do not add moderation AI.

### Test

- Report a post.
- Confirm report row appears in Supabase.

---

## Ticket 18 — MVP Cleanup Pass

### Goal

Stabilize the codebase before user testing.

### Requirements

1. Remove obsolete commented code.
2. Remove unused imports.
3. Ensure naming consistency:
   - `posts` for published backend content
   - `recording` only for active capture flow

4. Reduce unnecessary console logs.
5. Keep useful error logs.
6. Fix typos.
7. Replace hardcoded user-facing strings missed earlier.
8. Ensure TypeScript has no avoidable `any`.

### Do Not

- Do not change behavior.
- Do not redesign UI.

### Test

Manual regression:

1. Launch app.
2. Feed loads.
3. Auto-play works.
4. Record voice.
5. Upload works.
6. Post appears.
7. My Voices works.
8. Saved works.
9. Category filter works.
10. Location fields save.
11. Views update.
12. Reactions update.

---

## Ticket 19 — MVP Smoke Test Document

### Goal

Create a repeatable manual test checklist.

### Requirements

Create:

```txt
docs/mvpSmokeTest.md
```

Include tests for:

1. App launch
2. Feed fetch
3. Auto-play
4. Record voice
5. Cloudinary upload
6. Supabase insert
7. My Voices
8. Saved
9. Categories
10. Category filter
11. Reactions
12. Views
13. Geolocation
14. No-location fallback
15. Web fallback
16. Native mobile test

---

# MVP Complete When

GRIOT MVP is complete when:

1. User opens app and hears backend-loaded voices.
2. User records and publishes a voice.
3. Audio uploads to Cloudinary.
4. Post metadata persists in Supabase.
5. Feed loads from Supabase.
6. User can see nearby/recent voices.
7. User can choose between Moments and Around You.
8. User can filter by category.
9. User can save voices locally.
10. User can see their own voices locally.
11. Views persist.
12. Reactions persist.
13. Location coordinates are captured.
14. Human-readable location is attempted and falls back safely.
15. UI strings are localization-ready.
16. App survives restart without losing local saved/my voice state.

---

# Important Product Reminder

Do not optimize for “more features.”

Optimize for this loop:

Open app
→ hear nearby voice
→ feel curiosity
→ save or react
→ record your own
→ come back later

That is the MVP.
