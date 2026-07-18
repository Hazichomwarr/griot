// app/record.tsx
import { getStrings, type Strings } from "@/src/lib/i18n/strings";
import {
  getVoiceTitleError,
  MAX_VOICE_TITLE_LENGTH,
} from "@/src/lib/postPresentation";
import { Category, useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createPost, getPosts } from "@/src/services/postService";
import uploadAudio from "@/src/services/uploadService";

type Mode = "idle" | "recording";

type CapturedLocation = {
  latitude: number | null;
  longitude: number | null;
};

type ResolvedPlace = {
  neighborhood: string;
  town: string;
  country: string;
};

type LocalProfilePlace = {
  profile?: Partial<ResolvedPlace>;
  neighborhood?: string;
  town?: string;
  country?: string;
};

type Categories = {
  key: Category;
  emoji: string;
  labelKey: keyof Strings["categories"];
  bgColor?: string;
};

const CATEGORIES: Categories[] = [
  {
    key: "moments",
    emoji: "😂",
    labelKey: "moments",
    bgColor: "bg-black",
  },
  {
    key: "around_you",
    emoji: "📍",
    labelKey: "aroundYou",
    bgColor: "bg-red-900/20",
  },
];

const FALLBACK_PLACE: ResolvedPlace = {
  neighborhood: "Karpala",
  town: "Ouagadougou",
  country: "Burkina Faso",
};

async function captureLocation(): Promise<CapturedLocation> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      console.log("location denied");
      return { latitude: null, longitude: null };
    }

    console.log("location granted");

    const location =
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch((err) => {
        console.log("fresh location capture failed:", err);
        return null;
      })) ??
      (await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
      }));

    if (!location) {
      console.log("location capture failed: no current or last known location");
      return { latitude: null, longitude: null };
    }

    const capturedLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    console.log("captured location:", JSON.stringify(capturedLocation, null, 2));
    return capturedLocation;
  } catch (err) {
    console.log("location capture failed:", err);
    return { latitude: null, longitude: null };
  }
}

function firstValue(...values: (string | null | undefined)[]) {
  return values.find((value) => value && value.trim().length > 0);
}

function getLocalProfilePlace(): ResolvedPlace {
  const state = useRecordingStore.getState() as unknown as LocalProfilePlace;

  return {
    neighborhood:
      firstValue(state.profile?.neighborhood, state.neighborhood) ??
      FALLBACK_PLACE.neighborhood,
    town:
      firstValue(state.profile?.town, state.town) ?? FALLBACK_PLACE.town,
    country:
      firstValue(state.profile?.country, state.country) ??
      FALLBACK_PLACE.country,
  };
}

async function resolvePlace(location: CapturedLocation): Promise<ResolvedPlace> {
  if (location.latitude === null || location.longitude === null) {
    console.log("reverse geocoding skipped: missing coordinates");
    console.log("resolved place:", JSON.stringify(FALLBACK_PLACE, null, 2));
    return FALLBACK_PLACE;
  }

  if (Platform.OS === "web") {
    const place = getLocalProfilePlace();
    console.log("reverse geocoding skipped on web");
    console.log("resolved place:", JSON.stringify(place, null, 2));
    return place;
  }

  try {
    const places = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    console.log("reverse geocode results:", JSON.stringify(places, null, 2));

    const [place] = places;

    const resolvedPlace = {
      neighborhood:
        firstValue(
          place?.district,
          place?.street,
          place?.name,
          place?.formattedAddress,
        ) ?? FALLBACK_PLACE.neighborhood,
      town:
        firstValue(place?.city, place?.subregion, place?.region) ??
        FALLBACK_PLACE.town,
      country:
        firstValue(place?.country, place?.isoCountryCode) ??
        FALLBACK_PLACE.country,
    };

    console.log("reverse geocoding resolved on native");
    console.log("resolved place:", JSON.stringify(resolvedPlace, null, 2));
    return resolvedPlace;
  } catch (err) {
    console.log("reverse geocoding failed:", err);
    console.log("resolved place:", JSON.stringify(FALLBACK_PLACE, null, 2));
    return FALLBACK_PLACE;
  }
}

export default function Record() {
  const insets = useSafeAreaInsets();
  const t = getStrings();

  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);

  // Stop all feed audio when entering record screen
  useEffect(() => {
    triggerStopAllAudio();
  }, [triggerStopAllAudio]);

  const setPosts = useRecordingStore((s) => s.setPosts);
  const deleteRecording = useRecordingStore((s) => s.deleteRecording);
  const addMyPostId = useRecordingStore((s) => s.addMyPostId);

  const [mode, setMode] = useState<Mode>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const previewSoundRef = useRef<Audio.Sound | null>(null);

  const [category, setCategory] = useState<Category>("moments");

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);
  const [voiceTitle, setVoiceTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const [justPosted, setJustPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);
  const titleError = pendingUri ? getVoiceTitleError(voiceTitle, t) : "";
  const trimmedTitle = voiceTitle.trim();
  const canPublish =
    Boolean(pendingUri) && !titleError && !isPublishing && mode !== "recording";

  function goBackToFeed() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  async function discardActiveRecording() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const activeRecording = recordingRef.current;
    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch (err) {
        console.log("discard active recording error:", err);
      }
    }

    recordingRef.current = null;
    setRecording(null);
    setMode("idle");
    setDuration(0);
  }

  async function discardDraft() {
    if (previewSoundRef.current) {
      await previewSoundRef.current.unloadAsync().catch(() => {});
      previewSoundRef.current = null;
    }

    setPendingUri(null);
    setPendingDuration(0);
    setVoiceTitle("");
    setPublishError("");
  }

  function confirmDiscard(onDiscard: () => void) {
    if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
      const confirmed = globalThis.confirm(
        `${t.record.discardRecordingTitle}\n\n${t.record.discardRecordingMessage}`,
      );

      if (confirmed) {
        onDiscard();
      }

      return;
    }

    Alert.alert(t.record.discardRecordingTitle, t.record.discardRecordingMessage, [
      {
        text: t.record.keepRecording,
        style: "cancel",
      },
      {
        text: t.record.discard,
        style: "destructive",
        onPress: onDiscard,
      },
    ]);
  }

  function handleBack() {
    if (mode === "recording") {
      confirmDiscard(() => {
        void discardActiveRecording().then(goBackToFeed);
      });
      return;
    }

    if (pendingUri) {
      confirmDiscard(() => {
        void discardDraft().then(goBackToFeed);
      });
      return;
    }

    goBackToFeed();
  }

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
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      recordingRef.current = recording;
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

  // ⏹ STOP + DRAFT
  async function stopRecording() {
    if (!recording) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setRecording(null);
    recordingRef.current = null;
    setMode("idle");

    if (uri) {
      setPendingUri(uri);
      setPendingDuration(duration);
    }
    setDuration(0);
  }

  async function publishRecording() {
    if (!pendingUri || !canPublish) return;

    setIsPublishing(true);
    setPublishError("");

    try {
      // 1. Upload audio to Cloudinary
      const audioUrl = await uploadAudio(pendingUri);

      if (!audioUrl) {
        console.log("Audio upload failed");
        setPublishError(t.record.publishError);
        return;
      }
      console.log("Public Audio URL:", audioUrl);

      const location = await captureLocation();
      const place = await resolvePlace(location);

      // 2. Create DB post
      const createdPost = await createPost({
        audio_url: audioUrl,
        duration: Math.floor(pendingDuration / 1000),
        title: trimmedTitle,

        views: 0,

        reactions: {
          "😂": 0,
          "🚨": 0,
          "👍": 0,
        },

        username: "",
        avatar: "",
        neighborhood: place.neighborhood,
        town: place.town,
        country: place.country,

        category,

        transcript: "",
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (!createdPost) {
        console.log("DB post creation failed");
        setPublishError(t.record.publishError);
        return;
      }

      setLastPostedId(createdPost.id);
      addMyPostId(createdPost.id);

      const posts = await getPosts();
      setPosts(posts);
      await discardDraft();

      // feedback
      setJustPosted(true);

      setTimeout(() => {
        setJustPosted(false);
      }, 3000);
    } catch (err) {
      console.log("publishRecording error:", err);
      setPublishError(t.record.publishError);
    } finally {
      setIsPublishing(false);
    }
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

  async function handleRecordAgain() {
    await discardDraft();
    setJustPosted(false);

    if (recording) return;
    void startRecording();
  }

  async function playPreview() {
    if (!pendingUri) return;

    try {
      if (previewSoundRef.current) {
        await previewSoundRef.current.replayAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: pendingUri },
        { shouldPlay: true },
      );
      previewSoundRef.current = sound;
    } catch (err) {
      console.log("play preview error:", err);
    }
  }

  //cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (previewSoundRef.current) {
        previewSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View
      className="flex-1 bg-black px-6"
      style={{
        paddingTop: insets.top + 14,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handleBack}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
        >
          <Text className="text-white text-2xl">‹</Text>
        </Pressable>
        <Text className="text-white/70 tracking-[6px] font-semibold">
          GRIOT
        </Text>
        <View className="w-11 h-11" />
      </View>

      <View className="mt-8 items-center">
        <Text className="text-white text-3xl font-semibold text-center">
          {t.record.title}
        </Text>
        <Text className="text-white/55 text-base text-center mt-3">
          {t.record.prompt}
        </Text>
      </View>

      <View className="mt-8 flex-row justify-center gap-4">
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
                {t.categories[c.labelKey]}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* CENTER */}
      <View className="flex-1 items-center justify-center">
        <View
          className="absolute rounded-full border border-blue-400/10"
          style={{ width: 270, height: 270 }}
        />
        <View
          className="absolute rounded-full bg-blue-500/5 border border-blue-300/15"
          style={{ width: 220, height: 220 }}
        />
        <Pressable
          onPress={() => {
            if (pendingUri) {
              void playPreview();
            }
          }}
          onPressIn={() => {
            if (mode === "idle" && !pendingUri && !isPublishing) {
              startRecording();
            }
          }}
          onPressOut={() => {
            if (mode === "recording") stopRecording();
          }}
          className={`w-36 h-36 rounded-full items-center justify-center border ${
            mode === "recording"
              ? "bg-red-600 border-red-300"
              : pendingUri
                ? "bg-blue-600 border-blue-200"
                : "bg-neutral-900 border-blue-300/40"
          }`}
        >
          <Text className="text-white text-3xl">
            {mode === "recording" ? "●" : "🎤"}
          </Text>
        </Pressable>

        <Text className="text-neutral-300 text-base font-semibold mt-6">
          {mode === "recording"
            ? t.record.listening
            : pendingUri
              ? t.record.playPreview
              : t.record.holdToSpeak}
        </Text>
        <Text className="text-neutral-500 text-sm mt-2">
          {mode === "recording" ? t.record.releaseToFinish : ""}
        </Text>

        {mode === "recording" && (
          <Text className="text-white text-xl mt-4">{format(duration)}</Text>
        )}
      </View>

      {pendingUri && (
        <View className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 mb-4">
          <Text className="text-white font-semibold mb-2">
            {t.record.voiceTitleLabel}
          </Text>
          <TextInput
            value={voiceTitle}
            onChangeText={(value) => {
              setVoiceTitle(value);
              setPublishError("");
            }}
            maxLength={MAX_VOICE_TITLE_LENGTH}
            editable={!isPublishing}
            placeholder={t.record.voiceTitlePlaceholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white text-base"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-red-200/80 text-xs">
              {publishError || (voiceTitle.length > 0 ? titleError : "")}
            </Text>
            <Text className="text-white/45 text-xs">
              {t.record.voiceTitleCharacterCount(
                voiceTitle.length,
                MAX_VOICE_TITLE_LENGTH,
              )}
            </Text>
          </View>

          <View className="flex-row gap-3 mt-4">
            <Pressable
              disabled={isPublishing}
              onPress={() => {
                void playPreview();
              }}
              className="flex-1 rounded-full border border-white/15 py-3 items-center"
              style={{ opacity: isPublishing ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold">
                {t.record.playPreview}
              </Text>
            </Pressable>
            <Pressable
              disabled={isPublishing}
              onPress={() => {
                void handleRecordAgain();
              }}
              className="flex-1 rounded-full border border-white/15 py-3 items-center"
              style={{ opacity: isPublishing ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold">
                {t.record.recordAgain}
              </Text>
            </Pressable>
          </View>

          <Pressable
            disabled={!canPublish}
            onPress={() => {
              void publishRecording();
            }}
            className="rounded-full py-4 items-center mt-3"
            style={{
              opacity: canPublish ? 1 : 0.45,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text className="text-black font-semibold">
              {isPublishing ? t.record.publishing : t.record.publish}
            </Text>
          </Pressable>
        </View>
      )}

      {/* FEEDBACK OVERLAY */}
      {justPosted && (
        <View className="absolute bottom-24 self-center bg-black/80 px-6 py-4 rounded-xl">
          <Text className="text-white text-center mb-2">
            ✅ {t.record.published}
          </Text>

          <Pressable onPress={handleRedo}>
            <Text className="text-blue-400 text-center">
              {t.record.replace}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
