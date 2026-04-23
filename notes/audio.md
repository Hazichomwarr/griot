# 🎤 Audio Crash Course (Griot)

## 🧠 Core Mental Model

You are dealing with **3 separate things**:

1. **Recording** → captures sound
2. **URI** → where the file lives
3. **Sound** → plays the file

---

## 🔁 The Flow

```
Start Recording → Stop Recording → Get URI → Play Sound
```

---

## 🎙️ 1. Recording

```ts
const { recording } = await Audio.Recording.createAsync(...)
```

👉 Creates a **recording session**

---

## ⛔ Stop + Save

```ts
await recording.stopAndUnloadAsync();
```

👉 MUST call this

- Stops recording
- Saves file to device

---

## 📍 2. URI (File Location)

```ts
const uri = recording.getURI();
```

👉 Example:

```
file:///.../recording.m4a
```

👉 This is what you:

- Store
- Send to backend
- Play

---

## 🔊 3. Playback (Sound)

```ts
const { sound } = await Audio.Sound.createAsync({ uri });
```

👉 Creates a **player**

---

## ▶️ Play

```ts
await sound.replayAsync();
```

---

## 🧠 Key Concepts

### Recording ≠ Sound

| Object    | Role          |
| --------- | ------------- |
| Recording | Creates audio |
| Sound     | Plays audio   |

---

## ⚠️ Critical Rules

- Always call `stopAndUnloadAsync()`
- Always store the `uri`
- Don’t mix Recording & Sound logic

---

## 🧪 Minimal Pattern

```ts
// Record
const { recording } = await Audio.Recording.createAsync(...)

// Stop
await recording.stopAndUnloadAsync()

// Get file
const uri = recording.getURI()

// Play
const { sound } = await Audio.Sound.createAsync({ uri })
await sound.replayAsync()
```

---

## 🚀 What This Enables

- Voice posts 🎤
- Audio feed 📻
- Upload system ☁️

---

## 🧠 Final Insight

👉 You are NOT building “audio features”

👉 You ARE building:

## **a system that turns voice into data**
