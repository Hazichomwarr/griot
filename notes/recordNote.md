# 🎙️ Recording System — What I Learned

## 1. State drives behavior, not just UI

- `mode` (idle / recording) controls interaction
- `justPosted` controls feedback
- `activeId` controls audio playback globally

👉 Key insight:

> UI bugs are often **state problems**, not styling problems.

---

## 2. Global state can leak across screens

Problem:

- Audio kept playing when navigating to record screen

Cause:

- `activeId` was never reset

Fix:

```ts
useEffect(() => {
  setActive(null);
}, []);
```

👉 Lesson:

> When using global state (Zustand), always think:
> “What happens when I leave this screen?”

---

## 3. Layout in React Native is NOT CSS

Problem:

- Mic dropped to bottom
- UI overlapped
- Button became unclickable

Cause:

- Removed safe area padding
- Misused `justify-between`

Fix:

- Use safe area insets
- Use `flex-1 justify-center` for true centering

👉 Lesson:

> Layout = Flexbox mental model, not web CSS intuition.

---

## 4. Native APIs have constraints (Expo AV)

Problem:

- “Only one recording allowed” error

Cause:

- Starting a new recording before cleaning previous one

Fix:

```ts
if (recording) return;
```

👉 Lesson:

> Native modules are stateful systems, not pure functions.

---

## 5. Interaction design matters more than features

We evolved from:

- tap → record → review → post ❌

To:

- hold → speak → release → auto-post → redo ✅

👉 Lesson:

> Reduce friction first. Add control second.

---

## 6. UX must teach itself

Fix:

```txt
Hold to speak
Release to share
```

👉 Lesson:

> If user needs instructions, your UI failed.

---

## 7. Small mistakes compound into “big bugs”

Example:

- missing padding → layout breaks
- not resetting activeId → audio leaks
- no guard → recording crashes

👉 Lesson:

> Bugs are rarely isolated. They’re systems interacting.

---

## 8. Engineering is debugging systems, not writing code

Today wasn’t about:

- syntax
- components

It was about:

- lifecycle
- state sync
- async behavior
- UI + system alignment

👉 Real insight:

> Coding is easy. Coordinating systems is hard.

---

## 🧠 Mindset Shift

Before:

> “I don’t understand this”

Now:

> “This is complex because multiple systems interact”

---

## 🧭 Where I am now

- Not beginner anymore
- Not fluent yet
- In the **real learning zone**

👉 That’s the only place progress happens.
