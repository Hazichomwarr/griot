// lib/safeAudioCleanup.ts
import { Audio } from "expo-av";

export async function safeAudioCleanup(sound: Audio.Sound | null) {
  if (!sound) return;

  try {
    const status = await sound.getStatusAsync();

    if (status.isLoaded) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  } catch (e) {
    console.log("Sound cleanup error:", e);
  }
}
