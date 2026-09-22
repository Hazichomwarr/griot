// lib/safeAudioCleanup.ts
import type { AudioPlayer } from "expo-audio";

/** Stops a hook-managed player without releasing it before its component unmounts. */
export async function safeAudioCleanup(player: AudioPlayer | null) {
  if (!player) return;

  try {
    player.pause();
    await player.seekTo(0);
  } catch (e) {
    console.log("Audio player cleanup error:", e);
  }
}
