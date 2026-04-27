// app/record.tsx
import { Category, useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Mode = "idle" | "recording";

type Categories = {
  key: Category;
  emoji: string;
  description: string;
  bgColor?: string;
};

const CATEGORIES: Categories[] = [
  {
    key: "social",
    emoji: "😂",
    description: "Social-contes",
    bgColor: "bg-black",
  },
  {
    key: "security",
    emoji: "🚨",
    description: "Urgences",
    bgColor: "bg-red-900/20",
  },
  {
    key: "vente",
    emoji: "🛒",
    description: "Vente-achats",
    bgColor: "bg-gren-900/20",
  },
];

export default function Record() {
  const insets = useSafeAreaInsets();

  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);

  // Stop all feed audio when entering record screen
  useEffect(() => {
    triggerStopAllAudio();
  }, []);

  const addRecording = useRecordingStore((s) => s.addRecording);
  const deleteRecording = useRecordingStore((s) => s.deleteRecording);

  const [mode, setMode] = useState<Mode>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [category, setCategory] = useState<Category>("social");

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<any>(null);

  const [justPosted, setJustPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);

  // 🎙 START RECORDING
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      // stop all audio before recording
      triggerStopAllAudio();

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
      const newPost = addRecording(uri, category);
      setLastPostedId(newPost.id);

      // feedback
      setJustPosted(true);

      setTimeout(() => {
        setJustPosted(false);
      }, 3000);
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
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* TOP */}
      <View className="mx-auto">
        <Text className="text-white text-2xl font-semibold">
          Partage ta voix
        </Text>
      </View>

      <View className="mt-10 flex-row justify-center gap-4 mb-6">
        {CATEGORIES.map((c: Categories) => (
          <Pressable
            key={c.key}
            onPress={() => setCategory(c.key)}
            className={`px-4 py-2 rounded-full ${
              category === c.key ? "bg-neutral-100" : "bg-white/10"
            }`}
          >
            <View className="items-center">
              <Text className="text-lg">{c.emoji}</Text>
              <Text
                className={`text-xs font-semibold ${category === c.key ? "text-black" : "text-white"}`}
              >
                {c.description}
              </Text>
            </View>
          </Pressable>
        ))}
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
          className={`w-32 h-32 rounded-full items-center justify-center ${
            mode === "recording" ? "bg-red-600" : "bg-neutral-800"
          }`}
        >
          <Text className="text-white text-3xl">
            {mode === "recording" ? "🔴" : "🎤"}
          </Text>
        </Pressable>

        <Text className="text-neutral-400 text-sm">
          {mode === "idle" && "Maintenez pour parler"}
          {mode === "recording" && "Relachez pour publier"}
        </Text>

        {mode === "recording" && (
          <Text className="text-white text-xl mt-4">{format(duration)}</Text>
        )}
      </View>

      {/* FEEDBACK OVERLAY */}
      {justPosted && (
        <View className="absolute bottom-24 self-center bg-black/80 px-6 py-4 rounded-xl">
          <Text className="text-white text-center mb-2">
            ✅ Ta voix est publiée
          </Text>

          <Pressable onPress={handleRedo}>
            <Text className="text-blue-400 text-center">Remplacer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
