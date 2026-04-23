# 🧠 notes.md — Identity, Layout, Audio Lifecycle (Griot)

---

# 👤 1. Identity Layer Setup

## 🎯 Goal

Turn audio into **human, contextual content**

---

## 📦 Data Model

```ts
type AudioPost = {
  id: string;
  uri: string;
  username: string;
  avatar: string;
  neighborhood: string;
  town: string;
  country?: string;
  category: "social" | "security" | "vente";
};
```

---

## 🧠 Why it matters

Without identity:

- random audio ❌
- no trust ❌

With identity:

- recognizable voices ✅
- local relevance ✅
- emotional connection ✅

---

## 🔥 Key Insight

👉 You are no longer rendering files
👉 You are rendering **people speaking from somewhere**

---

# 📱 2. AudioCard “swallowed” button (Layout bug)

## ❌ Problem

FlatList takes full height → button pushed out of view

---

## ✅ Solution

Use **absolute positioning**

```tsx
<Pressable className="absolute bottom-10 self-center">
```

---

## 🧠 Concept

| Layout Mode | Behavior |
| ----------- | -------- |
| normal flow | stacked  |
| absolute    | floating |

---

## 🔥 Result

👉 Record button floats above feed (modern UX)

---

# 📏 3. Usable Viewport (CRITICAL)

## ❌ Problem

```ts
Dimensions.get("window").height;
```

👉 Includes:

- status bar
- header
- unsafe areas

---

## 💥 Result

- broken snapping
- items cut off
- progress bar hidden

---

## ✅ Fix

```ts
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();
const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
```

---

## 🧠 Key Insight

👉 Screen height ≠ usable UI height

---

## 🔥 Applied to:

- AudioCard height
- FlatList `getItemLayout`

---

# 🎧 4. Audio Lifecycle — Replay Fix

## ❌ Problem

```ts
if (status.didJustFinish) {
  sound.unloadAsync();
}
```

👉 destroys sound
👉 user cannot replay

---

## ✅ Fix

```ts
if (status.didJustFinish) {
  setIsPlaying(false);
  setProgress(0);
}
```

---

## 🔁 Replay Logic

```ts
if (status.positionMillis === status.durationMillis) {
  await sound.setPositionAsync(0);
}
await sound.playAsync();
```

---

## 🧠 Concept

👉 Don’t destroy resources you still need

---

## 🔥 Result

- audio remains reusable
- tap → replay works
- no dead UI state

---

# 🚀 SYSTEM YOU NOW HAVE

```txt
Scroll → activeId → AudioCard → play/pause
        ↓
Identity layer (user + location + category)
        ↓
UI synced with audio state (progress, replay)
```

---

# 🧠 FINAL INSIGHT

You are now handling:

- UI layout physics
- device constraints
- async lifecycle
- state-driven media

👉 This is **real mobile engineering**

---
