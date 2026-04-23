# 🧠 debugNote.md — NativeWind + Expo + pnpm Issue

## ❌ Problem

- Tailwind styles worked on web but NOT on mobile
- Metro error:
  - `react-native-css-interop/jsx-runtime not found`

---

## 🧩 Root Causes

1. **pnpm strict dependency resolution**
   - NativeWind depends on `react-native-css-interop`
   - pnpm did NOT install/hoist it automatically

2. **Tailwind version conflict**
   - Multiple versions installed → broke NativeWind

3. **Babel config dependency**
   - NativeWind requires proper JSX transform

---

## ✅ Fixes

### 1. Use compatible Tailwind version

```bash
npm install -D tailwindcss@3.3.2
```

---

### 2. Correct Babel config

```js
presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
plugins: ["nativewind/babel"],
```

---

### 3. Add Metro config (NativeWind requirement)

```js
module.exports = withNativeWind(config, { input: "./global.css" });
```

---

### 4. Move global.css to root

```
/global.css
```

---

### 5. Clean install (CRITICAL)

```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```

---

## 🔥 Key Insight

👉 Expo + NativeWind works best with **npm/yarn**

👉 pnpm can break native dependencies due to strict resolution

---

## 🧠 Lesson Learned

- Tooling matters as much as code
- Version conflicts silently break UI
- Always verify dependency compatibility

---

## 🚀 Outcome

- Tailwind working on:
  - ✅ Web
  - ✅ Mobile

- Project stack stabilized:
  - Expo Router
  - NativeWind
  - Zustand
  - Audio recording

---
