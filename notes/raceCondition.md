# ⚡ raceCondition.md — Audio Playback (Griot)

## 🧠 What is a race condition?

👉 When multiple async events happen **out of order** or **overlap**

---

## 🎧 In Griot

```txt
Scroll → activeId changes → new audio starts
BUT previous audio is still stopping/unloading
→ conflict 💥
```

---

## ❌ Problem

Calling:

```ts
sound.stopAsync();
sound.unloadAsync();
```

👉 when sound is:

- already unloaded
- or not fully loaded

→ causes error

---

## ✅ Solution

Always check state before acting:

```ts
const status = await sound.getStatusAsync();

if (status.isLoaded) {
  await sound.stopAsync();
  await sound.unloadAsync();
}
```

---

## 🧠 Key Rule

👉 **Never assume async state is valid**

Always verify:

```ts
status.isLoaded;
```

---

## 🔥 Lesson

- UI is fast
- Device APIs are async
- You must **guard every interaction**

---

## 🚀 Takeaway

👉 Race conditions are NORMAL in:

- audio
- video
- animations

👉 Handle them with:

- checks
- try/catch
- safe cleanup

---
