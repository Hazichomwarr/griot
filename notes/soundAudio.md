# 🎧 expo-av Audio Crash Course

## 🧠 Core Mental Model

You are dealing with **3 separate layers**:

1. **Recording** → captures sound
2. **URI (file)** → where the audio lives
3. **Sound (player)** → plays the audio

```ts
Recording → produces → URI → consumed by → Sound
```

👉 Never mix these roles.

---

# 🧱 1. Recording (Audio.Recording)

### Create a recording

```ts
const { recording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY,
);
```

---

### Stop recording

```ts
await recording.stopAndUnloadAsync();
const uri = recording.getURI();
```

👉 `uri` is your **source of truth**

---

### Get recording status

```ts
const status = await recording.getStatusAsync();
```

#### Useful fields:

```ts
status.isRecording; // boolean
status.durationMillis; // number
```

---

# 🔊 2. Sound (Audio.Sound)

### Create sound from URI

```ts
const { sound } = await Audio.Sound.createAsync({ uri });
```

---

### Play / Pause

```ts
await sound.playAsync();
await sound.pauseAsync();
```

---

### Reset (VERY IMPORTANT)

```ts
await sound.setPositionAsync(0);
```

👉 Without this, replay feels broken

---

### Get status manually

```ts
const status = await sound.getStatusAsync();
```

---

## 🔍 Status fields (IMPORTANT ONES)

```ts
status.isLoaded; // must be true to interact
status.isPlaying; // playing or paused
status.positionMillis; // current time
status.durationMillis; // total length
status.didJustFinish; // 🔥 finished THIS FRAME
```

---

# ⚠️ didJustFinish (CRITICAL)

```ts
if (status.didJustFinish) {
  // fires ONCE when audio ends
}
```

👉 Use it for:

- resetting UI
- triggering next audio
- showing reply prompt

---

# 🔁 Playback Listener (REAL-TIME)

> Subscribe to everything happening to this audio, in real time.

### This is the heart of your UI sync

```ts
sound.setOnPlaybackStatusUpdate((status) => {
  if (!status.isLoaded) return;

  setIsPlaying(status.isPlaying);

  if (status.durationMillis) {
    setProgress(status.positionMillis / status.durationMillis);
  }

  if (status.didJustFinish) {
    setIsPlaying(false);
    setProgress(0);
    sound.setPositionAsync(0);
  }
});
```

---

# 🧼 Cleanup (DON’T SKIP)

```ts
await sound.unloadAsync();
```

👉 Prevents:

- memory leaks
- audio stacking
- weird bugs

---

# ⚠️ Common Mistakes (YOU ALREADY HIT SOME)

## ❌ 1. Using `sound._uri`

```ts
// ❌ WRONG
sound._uri;
```

👉 Private field → unreliable

✅ Always store URI from recording

---

## ❌ 2. Creating sound on every play

```ts
// ❌ BAD
Audio.Sound.createAsync(...)
```

👉 Expensive + glitchy

✅ Load once, reuse

---

## ❌ 3. Forgetting `isLoaded`

```ts
if (!status.isLoaded) return;
```

👉 Without this → random crashes

---

## ❌ 4. No cleanup

👉 Leads to:

- overlapping audio
- memory leaks

---

## ❌ 5. Not resetting position

👉 Causes:

- replay bugs
- stuck audio

---

# 🧠 Advanced Patterns

## 🎯 Single Active Audio

Only ONE sound should play:

```ts
activeId === item.id → play
else → pause
```

---

## 🎯 Progress bar

```ts
progress = positionMillis / durationMillis;
```

---

## 🎯 Tap behavior

```ts
if (isPlaying) pause;
else play;
```

---

## 🎯 Replay logic

```ts
if (position === duration) {
  setPositionAsync(0);
}
```

---

# ⚡ Minimal Mental Model (remember this)

```ts
Recording → gives URI

Sound → plays URI

Status → tells you what's happening

didJustFinish → tells you it ended

unloadAsync → cleans everything
```

---

# 🧠 Final Insight

expo-av is NOT complicated.

It just feels weird because:

- async everywhere
- state lives outside React
- lifecycle matters a lot

Once you respect:
👉 load → play → listen → cleanup

Everything becomes predictable.

---
