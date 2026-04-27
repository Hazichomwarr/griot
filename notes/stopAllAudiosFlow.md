# 🔊 Stop All Audios — Flow Notes

## 🧠 Problem

When starting a new recording:

```txt
Recording starts → previous audio keeps playing ❌
```

👉 Leads to:

- overlapping sounds
- bad UX
- loss of control

---

## ❌ Naive attempt

Using:

```ts
setActive("");
```

👉 Issues:

- async audio may still play
- not all components react reliably
- race conditions

---

## ✅ Solution: Global Stop Signal

We introduce:

```ts
stopAllAudioFlag: number;
```

---

## 🧠 Key idea

This is NOT state.

This is:

## 👉 a **signal (event trigger)**

---

## 🔁 Flow

### 1. User starts recording

```ts
triggerStopAllAudio();
```

---

### 2. Store updates

```txt
stopAllAudioFlag: 3 → 4
```

---

### 3. All AudioCards re-render

Because they subscribe to:

```ts
const stopAllAudioFlag = useRecordingStore(...)
```

---

### 4. useEffect runs in each AudioCard

```ts
useEffect(() => {
  if (soundRef.current) {
    safeAudioCleanup(soundRef.current);
    soundRef.current = null;
  }
}, [stopAllAudioFlag]);
```

---

### 5. All audio stops

```txt
Global signal → all components react → cleanup runs
```

---

## 🧠 Why use a number?

React only reacts to changes:

```txt
true → true = no change ❌
1 → 2 → 3 = always changes ✅
```

---

## 🧠 Mental model

```txt
Number = “new event occurred”
```

Not:

```txt
Boolean = “current state”
```

---

## 🔥 Pattern learned

## 👉 State vs Signal

| Type   | Example          | Purpose                 |
| ------ | ---------------- | ----------------------- |
| State  | activeId         | what is true now        |
| Signal | stopAllAudioFlag | trigger an action/event |

---

## 🧠 Architecture insight

You created:

## 👉 a broadcast system

One trigger → many components react

---

## 🚀 Benefits

- prevents overlapping audio
- works across screens
- avoids race conditions
- scalable pattern for future features

---

## 🔮 Future evolution

This pattern can evolve into:

- global audio manager
- event bus
- centralized playback controller

---

## 🧠 Key takeaway

> The number is not the data — it’s the trigger.

---

## ✅ Result

```txt
Press record
→ global stop signal
→ all audio stops instantly
→ clean recording starts
```
