// app/record.tsx
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Mode = "idle" | "recording";

export default function Record() {
  const insets = useSafeAreaInsets();

  const setActive = useRecordingStore((s) => s.setActive);
  useEffect(() => {
    // stop all feed audio when entering record screen
    setActive("");
  }, []);

  const addRecording = useRecordingStore((s) => s.addRecording);
  const deleteRecording = useRecordingStore((s) => s.deleteRecording);

  const [mode, setMode] = useState<Mode>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<any>(null);

  // const [sound, setSound] = useState<Audio.Sound | null>(null);
  // const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const [justPosted, setJustPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);

  // 🎙 START RECORDING
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // staysActiveInBackground: false,
        // interruptionModeIOS: 1,
        // shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setMode("recording");

      // timer when recording starts
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

  // ⏹ STOP + AUTO POST
  async function stopRecording() {
    if (!recording) return;

    clearInterval(intervalRef.current);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setRecording(null);
    setMode("idle");

    if (uri) {
      const newPost = addRecording(uri);
      setLastPostedId(newPost.id);

      // feedback
      setJustPosted(true);

      setTimeout(() => {
        setJustPosted(false);
      }, 5000);
    }
    setDuration(0);
  }

  // 🔁 REDO
  function handleRedo() {
    if (lastPostedId) {
      deleteRecording(lastPostedId);
    }
    setJustPosted(false);

    // Restart immediately
    if (recording) return; // prevent double recording
    startRecording();
  }

  //cleanup
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View
      className="flex-1 bg-black justify-between px-6"
      // style={{
      //   paddingTop: insets.top + 20,
      //   paddingBottom: insets.bottom + 20,
      // }}
    >
      {/* TOP */}
      <View>
        <Text className="text-white text-lg font-semibold">Your voice</Text>
        <Text className="text-neutral-400 text-sm">
          {mode === "idle" && "Hold to speak"}
          {mode === "recording" && "Release to share"}
        </Text>
      </View>
      {/* CENTER */}
      <View className="flex-1 items-center justify-center">
        <Pressable
          onPressIn={() => {
            if (mode === "idle") startRecording();
          }}
          onPressOut={() => {
            if (mode === "recording") stopRecording();
          }}
          // className="w-32 h-32 rounded-full bg-neutral-800 items-center justify-center mb-6"
          className={`w-32 h-32 rounded-full items-center justify-center ${
            mode === "recording" ? "bg-red-600" : "bg-neutral-800"
          }`}
        >
          <Text className="text-white text-3xl">
            {mode === "recording" ? "🔴" : "🎤"}
          </Text>
        </Pressable>

        {mode === "recording" && (
          <Text className="text-white text-xl mt-4">{format(duration)}</Text>
        )}
      </View>

      {/* FEEDBACK OVERLAY */}
      {justPosted && (
        <View className="absolute bottom-24 self-center bg-black/80 px-6 py-4 rounded-xl">
          <Text className="text-white text-center mb-2">
            ✅ Your voice is live
          </Text>

          <Pressable onPress={handleRedo}>
            <Text className="text-blue-400 text-center">Redo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
