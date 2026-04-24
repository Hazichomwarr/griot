// app/record.tsx
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Mode = "idle" | "recording" | "review";

export default function Record() {
  const insets = useSafeAreaInsets();
  const addRecording = useRecordingStore((s) => s.addRecording);

  const [mode, setMode] = useState<Mode>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const intervalRef = useRef<any>(null);

  // 🎙 START
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setMode("recording");

      //start timer After recording starts
      intervalRef.current = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
          setDuration(status.durationMillis || 0);
        }
      }, 200);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  // ⏹ STOP
  async function stopRecording() {
    if (!recording) return;

    clearInterval(intervalRef.current);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri); // This is the source of truth

    setRecording(null);

    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);
      });
    }
    setMode("review");
  }

  // ▶ PLAYBACK
  async function togglePlayback() {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      if (status.positionMillis === status.durationMillis) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  // ✅ POST
  async function handlePost() {
    if (!sound) return;

    if (!recordedUri) return;
    addRecording(recordedUri);

    setMode("idle");
    setDuration(0);
    setRecordedUri(null);

    sound.unloadAsync();
    setSound(null);
  }

  //cleanup
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      sound?.unloadAsync().catch(() => {});
    };
  }, []);

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View
      className="flex-1 bg-black justify-between px-6"
      style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
    >
      {/* TOP */}
      <View>
        <Text className="text-white text-lg font-semibold">Your voice</Text>
        <Text className="text-neutral-400 text-sm">
          {mode === "idle" && "Say anything. Someone might need it."}
          {mode === "recording" && "Recording..."}
          {mode === "review" && "Listen before sharing"}
        </Text>
      </View>

      {/* CENTER */}
      <View className="items-center">
        <Pressable
          onPress={
            mode === "idle"
              ? startRecording
              : mode === "recording"
                ? stopRecording
                : togglePlayback
          }
          className="w-32 h-32 rounded-full bg-neutral-800 items-center justify-center mb-8"
        >
          <Text className="text-white text-3xl">
            {mode === "idle" && "🎤"}
            {mode === "recording" && "⏹"}
            {mode === "review" && (isPlaying ? "⏸" : "▶")}
          </Text>
        </Pressable>

        {mode !== "idle" && (
          <Text className="text-white text-xl">{format(duration)}</Text>
        )}
      </View>

      {/* BOTTOM */}
      <View className="items-center gap-4 min-h-[100px] justify-end">
        {mode === "review" && (
          <>
            <Pressable
              onPress={handlePost}
              className="bg-white/10 border border-white/20 px-6 py-3 rounded-full"
            >
              <Text className="text-white">Share voice</Text>
            </Pressable>

            <Pressable onPress={() => setMode("idle")} className="px-6 py-2">
              <Text className="text-neutral-400">Discard</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
