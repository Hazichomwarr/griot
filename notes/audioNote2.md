# 🧠 note.md — FlatList, useRef & Audio System (Griot)

## 🔁 Core Loop (Current Architecture)

```txt
Scroll → visible item changes → activeId updates → audio plays/stops
```

---

# 📜 FlatList — Mental Model

## What it is:

👉 **A performant scroll engine + visibility tracker**

---

## 🔑 Core Props

### `data`

```ts
recordings;
```

👉 Source of truth

---

### `renderItem`

```tsx
({ item }) => <AudioCard item={item} />;
```

👉 Defines how ONE item is rendered

---

### `keyExtractor`

```ts
item.id;
```

👉 Unique identity for each item

---

## ⚡ Behavior Props

### `pagingEnabled`

👉 Snap to one item per screen (TikTok effect)

---

### `onViewableItemsChanged`

👉 Detects which item is visible

---

### `viewabilityConfig`

```ts
itemVisiblePercentThreshold: 80;
```

👉 Item must be ~80% visible to be “active”

---

## 🧠 Why FlatList > `.map()`

- Virtualization (performance)
- Built-in scroll tracking
- Viewability detection
- Optimized rendering

---

# 🎧 Audio System — Key Concepts

---

## 🧩 Trigger

👉 Audio changes when:

```ts
activeId changes
```

---

## 🔁 Flow

```txt
Scroll
→ FlatList detects visible item
→ activeId updates (Zustand)
→ AudioCard reacts via useEffect
→ Sound starts/stops
```

---

# ⚙️ useRef vs useState (CRITICAL)

---

## ❌ useState (wrong here)

```ts
const [sound, setSound] = useState(...)
```

Problems:

- Triggers re-render
- Causes performance issues
- Can create audio glitches

---

## ✅ useRef (correct)

```ts
const soundRef = useRef(null);
```

Gives:

- Persistent value across renders
- No re-render
- Mutable reference

---

## 🧠 Mental Model

| Tool     | Purpose               |
| -------- | --------------------- |
| useState | UI state              |
| useRef   | Internal engine state |

---

## 🎯 In Griot

👉 `soundRef` stores:

- audio player instance
- not UI data

---

# 🧠 Lifecycle of AudioCard

---

## When active:

```txt
create sound → store in ref → play
```

---

## When inactive:

```txt
stop → unload → clear ref
```

---

## Cleanup:

```txt
component unmount → unload sound
```

---

# 📏 Dimensions (new concept)

```ts
const { height } = Dimensions.get("window");
```

👉 Used to:

- make each audio full-screen
- create immersive UI

---

# 🔥 Key Takeaways

- FlatList = engine, not just list
- activeId drives playback
- useRef = perfect for non-UI state
- Audio system is event-driven
- React Native = UI + system thinking

---

# 🚀 You Just Learned

- Scroll-driven state
- Media lifecycle handling
- Performance-conscious design
- Real app interaction loop

---

# 🧠 Final Insight

👉 You are no longer “rendering UI”

👉 You are:

## **orchestrating behavior across systems**
