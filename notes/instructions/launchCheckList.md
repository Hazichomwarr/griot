# launchChecklist.md

# GRIOT Launch Checklist

Status: Pre-Launch

Goal:

Launch a stable MVP to the first real users.

Not to thousands.

To the first neighborhood.

---

# PHASE 1 — Engineering Stability

## Core Loop

- [ ] Open app
- [ ] Feed loads from Supabase
- [ ] Audio auto-plays
- [ ] Auto-advance works
- [ ] Pause / Resume works
- [ ] Progress bar updates

---

## Recording

- [ ] Microphone permission
- [ ] Hold to record
- [ ] Release to publish
- [ ] Upload succeeds
- [ ] Cloudinary returns URL
- [ ] Post inserted in Supabase
- [ ] Feed refreshes

---

## Geolocation

- [ ] Location permission works
- [ ] Coordinates stored
- [ ] Reverse geocode (native)
- [ ] Web fallback works
- [ ] Missing location never blocks publishing

---

## Categories

- [ ] Moments
- [ ] Around You
- [ ] Filter works
- [ ] Colors correct

---

## Save System

- [ ] Save
- [ ] Unsave
- [ ] Saved survives restart
- [ ] Saved screen loads

---

## My Voices

- [ ] Own posts appear
- [ ] Empty state works

---

## Reactions

- [ ] Local update
- [ ] Backend update
- [ ] No duplicate crashes

---

## Views

- [ ] Increment once
- [ ] Backend updated

---

# PHASE 2 — UX Polish

## Loading

- [ ] Loading state
- [ ] Posting state
- [ ] Empty state
- [ ] Error state

---

## Navigation

- [ ] Feed
- [ ] My Voices
- [ ] Record
- [ ] Saved

---

## AudioCard

- [ ] Theme colors
- [ ] Waveform stable
- [ ] Play button polished
- [ ] Category pill
- [ ] Distance displayed
- [ ] Transcript readable

---

## Localization

- [ ] No hardcoded strings
- [ ] English
- [ ] French
- [ ] Device language ready

---

# PHASE 3 — Infrastructure

## Cloudinary

- [ ] Upload preset
- [ ] Folder correct
- [ ] Usage limits checked

---

## Supabase

- [ ] Backups enabled
- [ ] RLS reviewed
- [ ] Tables documented

---

## Environment

- [ ] .env clean
- [ ] Secrets removed from git
- [ ] README updated

---

# PHASE 4 — Branding

- [ ] App icon
- [ ] Splash screen
- [ ] App name
- [ ] Version number
- [ ] About screen

---

# PHASE 5 — Legal

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Community Guidelines
- [ ] Report Abuse flow

---

# PHASE 6 — Beta Build

## iOS

- [ ] TestFlight build

## Android

- [ ] Internal testing build

---

# PHASE 7 — Seed Users

Target:

20–30 people.

Mix:

- [ ] Family
- [ ] Friends
- [ ] Students
- [ ] Shop owner
- [ ] Taxi driver
- [ ] Teacher
- [ ] Restaurant worker

Do NOT invite random internet users first.

---

# PHASE 8 — Daily Observation

Every evening answer:

## Activity

How many new voices?

How many listeners?

Average duration?

Most used category?

Most saved voice?

Most reacted voice?

---

## Product Questions

Did people understand the app?

Did they smile?

Did they come back?

Did they know what to record?

Did someone use it without being told?

---

## Bugs

Write every bug.

Don't trust memory.

---

# PHASE 9 — Launch Metrics

Do NOT chase downloads.

Track:

Daily Active Users

Voices Published

Voices Played

Average Listening Time

Return Rate (D1)

Voices per User

Saves

Reactions

---

# PHASE 10 — Success Criteria

MVP is successful if:

✔ People record naturally.

✔ People listen without being forced.

✔ They return the next day.

✔ They tell someone else.

If those four things happen,

the product deserves another iteration.

---

# Things NOT to Build Yet

❌ Following users

❌ Infinite profile customization

❌ Direct messages

❌ Livestream

❌ AI summaries

❌ Video

❌ Stories

❌ Ads

❌ Marketplace

❌ Groups

Earn the right to build those later.

---

# Founder Reminder

Do not fall in love with code.

Fall in love with learning.

Every voice posted teaches something.

Every abandoned feature teaches something.

Every confused user teaches something.

Ship.

Listen.

Improve.

Repeat.
