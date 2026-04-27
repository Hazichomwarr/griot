# 🔄 Auto Scroll — Notes

## 🧠 Goal

Keep audio and UI in sync:

```txt
Audio changes → screen follows automatically
```

---

## ❌ Before

- Audio auto-advanced
- Screen stayed in place

👉 Result:

- confusing experience
- “audio teleport” feeling

---

## ✅ After

- Audio finishes
- `activeId` updates
- FlatList scrolls to the correct item

👉 Result:

- continuous flow
- natural progression

---

## 🧠 Core concept

We don’t scroll manually from inside components.

We use:

```txt
state change → parent reacts → UI updates
```

---

## 🔁 Flow

```txt
Audio finishes
→ setActive(nextId)
→ activeId changes
→ useEffect in index.tsx runs
→ scrollToIndex(index)
→ next card becomes visible
→ playback starts
```

---

## 🎯 Key implementation

### 1. Attach ref to FlatList

```tsx
<FlatList ref={listRef} ... />
```

👉 Without this, scrolling does nothing.

---

### 2. React to activeId changes

```ts
useEffect(() => {
  if (!activeId) return;

  const index = recordings.findIndex((r) => r.id === activeId);
  if (index === -1) return;

  setTimeout(() => {
    listRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, 50);
}, [activeId]);
```

---

## ⚠️ Why setTimeout is needed

React flow:

```txt
setActive
→ render updates
→ FlatList recalculates
→ THEN scrolling works
```

Without delay:

```txt
scroll happens too early → ignored
```

---

## 🧠 Responsibilities

- AudioCard → handles audio logic
- index.tsx → controls layout (scroll)

👉 separation of concerns

---

## ⚠️ Edge handling

```tsx
onScrollToIndexFailed;
```

Used when item not yet measured.

---

## 🧠 Key lesson

> UI should follow state, not fight it

---

## 🚀 Result

- seamless audio + visual sync
- no user interaction needed
- “infinite listening” experience

---

## 🔥 What this unlocks

You now have:

- autoplay
- auto-advance
- auto-scroll

👉 a full **content consumption loop**
