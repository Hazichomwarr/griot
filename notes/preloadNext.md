# ⚡ Preloading Audio — Notes

## 🧠 Goal

Make scrolling feel **instant**, not delayed.

---

## ❌ Before

Each card did:

Scroll → load audio → play

👉 Causes:

- delay
- inconsistent feel
- worse on slow networks

---

## ✅ After (with preload)

Previous card prepares the next one:

Scroll → audio already loaded → play instantly

---

## 🧠 Core concept

We now manage **two sounds per card**:

- `soundRef` → current audio (playing)
- `nextSoundRef` → next audio (preloaded)

---

## 🔁 Playback flow

1. Card becomes active (`activeId === item.id`)
2. Try to reuse `nextSoundRef`
3. If not available → create new sound
4. Attach playback listener
5. Start playing

---

## ⚡ Preloading flow

When current card is active:

- load next audio in background
- do NOT play it
- store in shared ref

---

## ⚠️ Key lesson

> Preloaded ≠ ready

Always verify:

```ts
const status = await sound.getStatusAsync();
if (status.isLoaded) { ... }
```

---

## 🧹 Cleanup

When card becomes inactive:

- stop & unload current sound
- keep preload only for next usage

---

## 🧠 Architectural insight

We introduced:

👉 **state handoff between components**

Instead of each card acting alone, they now:

- coordinate
- share future data

---

## ⚠️ Current limitation

- Multiple components still manage audio
- Can cause race conditions

👉 Future improvement:
**single global audio controller**

---

## 🧠 Product impact

User now experiences:

- smoother scrolling
- faster playback
- more “premium” feel

---

## 🧭 Principle learned

> Build for real-world constraints before they hit you

Even if you don’t feel latency yet.
