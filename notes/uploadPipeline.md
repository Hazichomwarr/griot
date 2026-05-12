## The Big Picture

When recording audio in Expo, the phone gives us:

file:///some/local/path/audio.m4a

This is ONLY a local device path.
Supabase cannot access this directly.

So we need a pipeline:

local file
→ read file
→ convert to transportable format
→ upload to cloud
→ get public URL

---

## FileSystem

```ts
import * as FileSystem from "expo-file-system";
```

## readAsStringAsync

```ts
FileSystem.readAsStringAsync(uri, { encoding: "base64" });
```

This means:

1. Open the local file
2. Read its bytes
3. Convert those bytes into base64 text
4. Return the string

## decode(base64)

This converts:
base64 text → raw binary again

Supabase storage expects binary file data.

## UTF-8 vs Base64

### UTF-8:

- encodes human-readable text
- used for normal strings
- optimized for language characters

Examples: "hello", "bonjour", "مرحبا"

### Base64:

- encodes raw binary as text
- used for files/images/audio

Examples:audio, images, pdfs

> UTF-8 is for language AND Base64 is for raw data transport.

---

## There are MANY ways to transport files

- base64
- ArrayBuffer
- Blob
- FormData
- Streams

> Different environments prefer different ones.

### Why Blob wins here

React Native + Supabase Storage handles: Blob very reliably.

---
