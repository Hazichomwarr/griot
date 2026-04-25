# 🧠 useRef Crash Course (React / React Native)

## 🧠 Core Mental Model

`useRef` is a **mutable box that survives renders without causing re-renders**

You use it for **values that need to persist but should NOT trigger UI updates**

---

## 🔁 The Contrast (This is everything)

| Tool       | Triggers Re-render? | Persists Between Renders? |
| ---------- | ------------------- | ------------------------- |
| `useState` | ✅ Yes              | ✅ Yes                    |
| `useRef`   | ❌ No               | ✅ Yes                    |

👉 If updating the value should NOT re-render → useRef

---

## 📦 The Ref Object

```ts
const ref = useRef(initialValue);
```

👉 Structure:

```ts
ref = {
  current: initialValue,
};
```

👉 You ALWAYS access/update via:

```ts
ref.current;
```

---

## 🔁 The Flow

```
Render → ref created → value persists → update ref.current → NO re-render
```

---

## 🎯 1. Persist Values Without Re-render

```ts
const countRef = useRef(0);

function increment() {
  countRef.current += 1;
}
```

👉 UI does NOT update
👉 Value is still stored internally

---

## 🧠 When to use this?

- Tracking previous values
- Counters that don’t affect UI
- Temporary flags

---

## 🕓 2. Store Previous Value

```ts
const prevValue = useRef<number | null>(null);

useEffect(() => {
  prevValue.current = value;
}, [value]);
```

👉 You now have access to:

- Current value
- Previous value

---

## 🧠 This is huge for:

- Comparisons
- Detecting changes
- Animations logic

---

## 🎯 3. Access DOM / Native Elements

```ts
const inputRef = useRef<TextInput>(null);

inputRef.current?.focus();
```

👉 Direct control over elements

---

## 🧠 Used for:

- Focus input
- Scroll views
- Imperative actions

---

## ⏱️ 4. Store Timers / Intervals

```ts
const timerRef = useRef<NodeJS.Timeout | null>(null);

timerRef.current = setTimeout(() => {
  console.log("done");
}, 1000);
```

👉 Later:

```ts
clearTimeout(timerRef.current!);
```

---

## 🧠 Why not useState?

Because:

- You don’t want re-renders
- You just need to keep a reference

---

## 🎙️ 5. Real Example (Audio Recording)

```ts
const recordingRef = useRef<Audio.Recording | null>(null);

// Start
recordingRef.current = recording;

// Stop
await recordingRef.current?.stopAndUnloadAsync();
```

👉 Prevents losing reference between renders

---

## ⚠️ Critical Rules

- `useRef` does NOT trigger re-renders
- Never expect UI to update when changing `ref.current`
- Always access via `.current`
- Safe to mutate

---

## 🚫 Common Mistake

```ts
ref = newValue ❌
```

👉 WRONG

```ts
ref.current = newValue ✅
```

---

## 🧪 Minimal Pattern

```ts
const ref = useRef(null);

// set
ref.current = something;

// use
console.log(ref.current);
```

---

## 🔄 useRef vs useState (Decision Rule)

👉 Ask yourself:

> “Does the UI need to update when this changes?”

- YES → `useState`
- NO → `useRef`

---

## 🚀 What This Enables

- Stable references across renders
- Performance optimization
- Imperative control
- Clean async handling

---

## 🧠 Final Insight

👉 `useRef` is NOT for state

👉 It is for:

## **remembering things without telling React**
