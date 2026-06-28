# Codex Instructions

You are contributing to GRIOT.

Before writing code:

1. Read the existing architecture.
2. Preserve current patterns.
3. Prefer small refactors over rewrites.
4. Never introduce unnecessary abstractions.
5. Keep the MVP simple.

## Architecture

Components

- UI only.

Store (Zustand)

- UI state only.
- No database logic.

Services

- Business logic.
- Calls Cloudinary.
- Calls Supabase.

Lib

- Infrastructure only.

---

## Rules

- TypeScript only.
- Functional components.
- Expo Router.
- Avoid unnecessary dependencies.
- Prefer composition over inheritance.
- Keep functions small.

---

## Coding Workflow

Always work in this order:

1. Explain the feature.
2. Write pseudo-code.
3. Implement.
4. Keep comments concise.
5. Preserve existing naming.

---

## Design Philosophy

GRIOT is not a traditional social network.

The product should feel calm.

Slow.

Emotional.

Minimal.

Voice-first.

Avoid adding features that increase complexity without increasing emotional connection.

---

## Current Priority

Build the backend-driven MVP.

Order:

1. Persist posts in Supabase.
2. Fetch posts into the feed.
3. Geolocation.
4. Saved posts.
5. Reactions.
6. Comments.
7. Authentication.

Do not redesign the architecture unless explicitly requested.

## IMPORTANT DEPENDENCY RULE

Do not modify package.json, package-lock.json, yarn.lock, app.json, app.config.js, babel.config.js, metro.config.js, or tsconfig.json unless this task explicitly asks you to.

Do not install, remove, upgrade, downgrade, or replace dependencies.

Do not run npm install, yarn add, npx expo install, expo upgrade, or expo-doctor --fix.

If you believe a dependency/config change is necessary, stop and explain:

1. why it is needed
2. exactly which files would change
3. exact commands you recommend
4. risks of the change

For this task, only modify the specific feature files needed.
