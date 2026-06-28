// app/record.tsx
import { getStrings, type Strings } from "@/src/lib/i18n/strings";
import { Category, useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
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
    key: "social",
    emoji: "😂",
    labelKey: "social",
    bgColor: "bg-black",
  },
  {
    key: "security",
    emoji: "🚨",
    labelKey: "security",
    bgColor: "bg-red-900/20",
  },
  {
    key: "vente",
    emoji: "🛒",
    labelKey: "vente",
    bgColor: "bg-gren-900/20",
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

function firstValue(...values: Array<string | null | undefined>) {
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
  }, []);

  const setPosts = useRecordingStore((s) => s.setPosts);
  const deleteRecording = useRecordingStore((s) => s.deleteRecording);
  const addMyPostId = useRecordingStore((s) => s.addMyPostId);

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
      try {
        // 1. Upload audio to Cloudinary
        const audioUrl = await uploadAudio(uri);

        if (!audioUrl) {
          console.log("Audio upload failed");
          return;
        }
        console.log("Public Audio URL:", audioUrl);

        const location = await captureLocation();
        const place = await resolvePlace(location);

        // 2. Create DB post
        const createdPost = await createPost({
          audio_url: audioUrl,
          duration: Math.floor(duration / 1000),

          views: 0,

          reactions: {
            "😂": 0,
            "🚨": 0,
            "👍": 0,
          },

          username: "Hamza",
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
          return;
        }

        setLastPostedId(createdPost.id);
        addMyPostId(createdPost.id);

        const posts = await getPosts();
        setPosts(posts);

        // feedback
        setJustPosted(true);

        setTimeout(() => {
          setJustPosted(false);
        }, 3000);
      } catch (err) {
        console.log("stopRecording upload error:", err);
      }
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
          {t.record.title}
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
                {t.categories[c.labelKey]}
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
          {mode === "idle" && t.record.holdToSpeak}
          {mode === "recording" && t.record.releaseToPublish}
        </Text>

        {mode === "recording" && (
          <Text className="text-white text-xl mt-4">{format(duration)}</Text>
        )}
      </View>

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
