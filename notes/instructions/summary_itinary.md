# GRIOT — Summary & Itinerary

Last Updated: June 2026

---

# Vision

GRIOT is **the voice of a neighborhood**.

It is not another social network.

It is not TikTok for audio.

It is a place where people hear what their neighborhood sounds like.

Someone opens the app and immediately hears:

- a funny story
- a recommendation
- something happening nearby
- someone's day
- local culture

The product should always feel:

- Calm
- Minimal
- Emotional
- Local
- Voice-first

If a feature does not reinforce that feeling, it probably doesn't belong.

---

# Current Stack

Frontend

- Expo
- React Native
- Expo Router
- TypeScript
- Zustand
- NativeWind

Storage

- Cloudinary

Database

- Supabase

Current architecture

Components
→ UI only

Store
→ UI state only

Services
→ backend/business logic

Lib
→ infrastructure

---

# What Has Been Built

## 1. Recording

Completed

Users can

- Hold to record
- Release to publish
- Timer during recording
- Audio permission handling
- Recording cancellation/replacement flow

---

## 2. Playback Engine

Completed

Features

- Auto play
- Pause
- Resume
- Auto advance
- Shared audio preload
- Cleanup on navigation
- Playback progress

---

## 3. Audio Feed

Completed

Feed now loads vertically.

Supports

- full screen cards
- autoplay
- active card
- progress bar
- waveform
- scrolling

---

## 4. New AudioCard UI

Completely redesigned.

Old

Classic audio player.

New

Premium emotional card.

Contains

- background
- transcript
- play button
- waveform
- location
- metadata

---

## 5. Floating Bottom System

Implemented.

Contains

- Feed
- My Voices
- Record
- Saved

Mic is centered.

Navigation is separated from actions.

---

## 6. Save System

Implemented locally.

Features

Save

Unsave

Saved screen

Store logic

No backend persistence yet.

---

## 7. My Voices

Implemented.

Shows recordings published by current user.

Currently local/backend hybrid.

---

## 8. Cloudinary Upload

Completed.

Audio uploads successfully.

Flow

Recording

↓

Cloudinary

↓

Public URL returned

↓

Stored in database

This replaced the earlier Supabase Storage approach.

---

## 9. Supabase Backend

Completed.

Current posts table includes

- id
- audio_url
- duration
- views
- reactions
- username
- avatar
- neighborhood
- town
- country
- category
- transcript
- latitude
- longitude
- created_at

Publishing now creates real backend rows.

---

## 10. Backend Feed

Completed.

Feed now loads from Supabase instead of local mock data.

Store was refactored.

Old

addRecording()

New

setPosts()

Backend is now source of truth.

---

## 11. Geolocation

Implemented.

Captures

Latitude

Longitude

Stores inside Supabase.

Reverse geocoding

Partially implemented.

Native works.

Web currently falls back because Expo removed Geocoding API.

Coordinates are still saved correctly.

---

## 12. Category System

Refactored.

Old

Social

Security

Vente

New

Moments 😂

Around You 📍

Intent-based categories.

Better aligned with product vision.

---

## 13. Localization Foundation

Started.

Project direction decided.

GRIOT is language-neutral.

No more hardcoded English/French moving forward.

Future

Device language

↓

Localized strings

↓

Future language selector

---

# Major Technical Decisions

## Cloudinary instead of Supabase Storage

Reason

Dedicated media platform.

Works beautifully with Expo.

Future Node backend can keep Cloudinary unchanged.

Excellent decision.

---

## Supabase First

Decision

Use Supabase until product validation.

Later

Replace only Services layer with NodeJS.

Frontend stays almost identical.

This minimizes future rewrite.

---

## Zustand Scope

Store only manages UI state.

Never database logic.

Database belongs inside services.

This separation is now established.

---

# Current Project Structure

app/

- index
- record
- saved
- my-voices

src/

components/

- AudioCard
- FloatingMic
- NowLiveToast

store/

- useRecordingStore

services/

- uploadService
- postService

lib/

- supabase
- helpers

---

# Current MVP Status

✅ Recording

✅ Upload

✅ Backend persistence

✅ Backend feed

✅ Playback

✅ Save

✅ My Voices

✅ Geolocation

🟡 Localization

🟡 Category colors

🟡 Reverse geocoding fallback

---

# Remaining MVP

---

## Ticket 1

Category Color Themes

Status

In Progress

Apply

Moments

Warm amber

Around You

Deep blue

Entire AudioCard should inherit mood.

---

## Ticket 2

Refine Feed UI

Goal

Match premium mockup.

Improve

spacing

background

typography

bottom navigation

waveform

category pill

---

## Ticket 3

Localization

Replace hardcoded strings.

Create

strings.ts

Future

English

French

Device language

---

## Ticket 4

Category Filter

Feed

All

Moments

Around You

Client-side filtering.

---

## Ticket 5

Nearby Feed

Sort feed by

distance

Fallback

newest first

---

## Ticket 6

Persist Views

Increment once per session.

Save to Supabase.

---

## Ticket 7

Persist Reactions

Store emoji reactions in Supabase.

Optimistic updates.

---

## Ticket 8

Persist Saved

Current

local only

Need

AsyncStorage persistence.

---

## Ticket 9

Loading / Empty States

Improve

Loading

Posting

Feed empty

Saved empty

My Voices empty

Error states

---

## Ticket 10

Reverse Geocoding

Current

Coordinates work.

Need better neighborhood lookup.

Likely replace deprecated Expo geocoder.

---

## Ticket 11

Report Post

Simple moderation.

Reasons

Spam

Harmful

False info

Other

No moderation dashboard.

---

## Ticket 12

MVP Cleanup

Remove

dead code

unused imports

extra logs

any types

commented code

Naming cleanup.

---

## Ticket 13

Smoke Test

Manual checklist.

Verify

record

upload

feed

autoplay

views

reactions

saved

my voices

categories

geolocation

---

# After MVP

Once MVP ships successfully.

Phase 2

Authentication

Profiles

Follow neighborhoods

Comments

Push notifications

Real waveform

Voice transcription

Nearby radius

Search

Offline caching

Analytics

---

# Long-Term Architecture

Frontend

↓

Services

↓

NodeJS API

↓

Postgres

↓

Cloudinary

Replacing Supabase later should only require changing:

services/

Everything else should remain intact.

---

# North Star

Never optimize for more features.

Optimize this loop.

Open app

↓

Hear nearby voice

↓

Smile / Learn something

↓

Save or react

↓

Record your own

↓

Come back tomorrow

If that loop becomes addictive,

GRIOT succeeds.
