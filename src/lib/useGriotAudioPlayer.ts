// src/lib/useGriotAudioPlayer.ts
import {
  useAudioPlayer,
  type AudioPlayerOptions,
  type AudioSource,
} from "expo-audio";

export type GriotAudioPlayerOptions = Omit<
  AudioPlayerOptions,
  "keepAudioSessionActive"
>;

/**
 * GRIOT owns recording/playback transitions centrally (see audioSession.ts).
 * On iOS, expo-audio schedules an asynchronous audio-session deactivation
 * after a player pauses or finishes, without checking for active recorders,
 * so letting individual players deactivate the session can interrupt a
 * recording that starts moments later. Every GRIOT player keeps it active.
 */
export function useGriotAudioPlayer(
  source?: AudioSource,
  options: GriotAudioPlayerOptions = {},
) {
  return useAudioPlayer(source, {
    ...options,
    keepAudioSessionActive: true,
  });
}
