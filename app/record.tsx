// app/record.tsx
import { getStrings, type Strings } from "@/src/lib/i18n/strings";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  exceedsCategoryDuration,
  getMaxDurationMillis,
  getVoiceTitleError,
  MAX_VOICE_TITLE_LENGTH,
} from "@/src/lib/postPresentation";
import { Category, useRecordingStore } from "@/src/store/useRecordingStore";
import CircularVoiceRecorder from "@/src/components/CircularVoiceRecorder";
import FloatingMic, { getFloatingNavContentInset } from "@/src/components/FloatingMic";
import VoiceAtmosphere from "@/src/components/VoiceAtmosphere";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createPost, getPosts } from "@/src/services/postService";
import uploadAudio from "@/src/services/uploadService";
import {
  configurePlaybackAudioMode,
  configureRecordingAudioMode,
} from "@/src/lib/audioSession";
import { useGriotAudioPlayer } from "@/src/lib/useGriotAudioPlayer";

type Mode = "idle" | "recording";
type RecordingOperation = "idle" | "starting" | "recording" | "stopping";

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
};

const CATEGORIES: Categories[] = [
  {
    key: "around_you",
    emoji: "📍",
    labelKey: "aroundYou",
  },
  {
    key: "contes",
    emoji: "🌙",
    labelKey: "contes",
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

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
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
    return FALLBACK_PLACE;
  }

  if (Platform.OS === "web") {
    const place = getLocalProfilePlace();
    console.log("reverse geocoding skipped on web");
    return place;
  }

  try {
    const places = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

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
    return resolvedPlace;
  } catch (err) {
    console.log("reverse geocoding failed:", err);
    return FALLBACK_PLACE;
  }
}

export default function Record() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const recordingOperationRef = useRef<RecordingOperation>("idle");
  const recordingReleaseRequestedRef = useRef(false);
  const startRecordingPromiseRef = useRef<Promise<void> | null>(null);
  const recorderStateRef = useRef(recorderState);
  const isMountedRef = useRef(true);
  const previewOperationRef = useRef(false);

  const [category, setCategory] = useState<Category>("around_you");

  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const previewPlayer = useGriotAudioPlayer(pendingUri);
  const previewStatus = useAudioPlayerStatus(previewPlayer);
  const [pendingDuration, setPendingDuration] = useState(0);
  const [voiceTitle, setVoiceTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const [justPosted, setJustPosted] = useState(false);
  const [lastPostedId, setLastPostedId] = useState<string | null>(null);
  const titleError = pendingUri ? getVoiceTitleError(voiceTitle, t) : "";
  const trimmedTitle = voiceTitle.trim();
  const draftDurationMillis = Math.max(
    pendingDuration,
    previewStatus.duration > 0 ? previewStatus.duration * 1000 : 0,
  );
  const durationError =
    pendingUri && exceedsCategoryDuration(category, draftDurationMillis)
      ? t.record.contesDurationTooLong
      : "";
  const canPublish =
    Boolean(pendingUri) &&
    !titleError &&
    !durationError &&
    !isPublishing &&
    mode !== "recording";

  useEffect(() => {
    recorderStateRef.current = recorderState;
  }, [recorderState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      recordingOperationRef.current = "idle";
      recordingReleaseRequestedRef.current = false;
      previewOperationRef.current = false;
    };
  }, []);

  function goBackToFeed() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  async function discardActiveRecording() {
    if (recordingOperationRef.current === "starting") {
      recordingReleaseRequestedRef.current = true;
      await startRecordingPromiseRef.current;
      return;
    }

    await stopRecording(false);
  }

  async function discardDraft() {
    try {
      await configurePlaybackAudioMode();
      previewPlayer.pause();
      await previewPlayer.seekTo(0);
    } catch (err) {
      console.log("discard preview cleanup error:", err);
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
    if (recordingOperationRef.current !== "idle") {
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
    if (recordingOperationRef.current !== "idle") return;

    recordingOperationRef.current = "starting";
    recordingReleaseRequestedRef.current = false;

    const startPromise = (async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted || !isMountedRef.current) {
        recordingOperationRef.current = "idle";
        recordingReleaseRequestedRef.current = false;
        await configurePlaybackAudioMode();
        if (isMountedRef.current) setMode("idle");
        return;
      }

      // stop all audio before recording
      triggerStopAllAudio();

      await configureRecordingAudioMode();
      if (!isMountedRef.current) {
        recordingOperationRef.current = "idle";
        recordingReleaseRequestedRef.current = false;
        await configurePlaybackAudioMode();
        return;
      }

      await recorder.prepareToRecordAsync();
      if (!isMountedRef.current) {
        recordingOperationRef.current = "idle";
        recordingReleaseRequestedRef.current = false;
        await configurePlaybackAudioMode();
        return;
      }

      recorder.record();
      recordingOperationRef.current = "recording";
      setMode("recording");

      if (recordingReleaseRequestedRef.current) {
        await stopRecording(false);
      }
    } catch (err) {
      console.log("Failed to start recording:", err);
      recordingOperationRef.current = "idle";
      recordingReleaseRequestedRef.current = false;
      await configurePlaybackAudioMode().catch((modeError) => {
        console.log("Failed to restore playback audio mode:", modeError);
      });
      if (isMountedRef.current) setMode("idle");
    }
    })();

    startRecordingPromiseRef.current = startPromise;
    await startPromise;
    if (startRecordingPromiseRef.current === startPromise) {
      startRecordingPromiseRef.current = null;
    }
  }

  // ⏹ STOP + DRAFT
  async function stopRecording(createDraft = true) {
    if (recordingOperationRef.current !== "recording") return;

    recordingOperationRef.current = "stopping";
    let uri: string | null = null;
    let durationMillis = recorderStateRef.current.durationMillis;

    try {
      const preStopState = recorderStateRef.current;
      durationMillis = Math.max(durationMillis, preStopState.durationMillis);
      await recorder.stop();

      if (isMountedRef.current) {
        const stoppedState = recorder.getStatus();
        uri = stoppedState.url;
        durationMillis = Math.max(durationMillis, stoppedState.durationMillis);
      }
    } catch (err) {
      console.log("stop recording error:", err);
    } finally {
      recordingOperationRef.current = "idle";
      recordingReleaseRequestedRef.current = false;
      await configurePlaybackAudioMode().catch((modeError) => {
        console.log("Failed to restore playback audio mode:", modeError);
      });

      if (!isMountedRef.current) return;

      setMode("idle");
      if (createDraft && uri) {
        setPendingUri(uri);
        setPendingDuration(durationMillis);
      }
    }
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
      const location = await captureLocation();
      const place = await resolvePlace(location);

      // 2. Create DB post
      const createdPost = await createPost({
        audio_url: audioUrl,
        duration: Math.floor(draftDurationMillis / 1000),
        title: trimmedTitle || null,

        views: 0,

        reactions: {
          "😂": 0,
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
    if (recordingOperationRef.current !== "idle") return;
    void startRecording();
  }

  async function handleRecordAgain() {
    await discardDraft();
    setJustPosted(false);

    if (recordingOperationRef.current !== "idle") return;
    void startRecording();
  }

  async function togglePreview() {
    if (!pendingUri || previewOperationRef.current) return;

    previewOperationRef.current = true;

    try {
      if (previewStatus.playing) {
        previewPlayer.pause();
        return;
      }

      await configurePlaybackAudioMode();
      if (!isMountedRef.current) return;

      if (
        previewStatus.duration > 0 &&
        previewStatus.currentTime >= previewStatus.duration - 0.05
      ) {
        await previewPlayer.seekTo(0);
      }
      previewPlayer.play();
    } catch (err) {
      console.log("play preview error:", err);
    } finally {
      previewOperationRef.current = false;
    }
  }

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const recorderSize = Math.min(280, Math.max(242, width - 96));
  const isCompact = height < 720;
  const showSupport = height >= 880;
  const isRecording = mode === "recording";
  const isDraft = Boolean(pendingUri);
  const instrumentSize = isDraft ? Math.round(recorderSize * 0.82) : recorderSize;
  const navContentInset = getFloatingNavContentInset(insets.bottom);
  const previewDurationMillis = previewStatus.duration
    ? previewStatus.duration * 1000
    : pendingDuration;
  const previewPositionMillis = previewStatus.currentTime * 1000;
  const previewProgress =
    previewDurationMillis > 0 ? previewPositionMillis / previewDurationMillis : 0;
  const maxDurationMillis = getMaxDurationMillis(category);
  const recordingProgress = Math.min(
    recorderState.durationMillis / (maxDurationMillis ?? 60_000),
    1,
  );
  const recordingElapsedLabel = maxDurationMillis
    ? `${format(recorderState.durationMillis)} / ${format(maxDurationMillis)}`
    : format(recorderState.durationMillis);
  const idleHint =
    !pendingUri && maxDurationMillis ? t.record.contesDurationHint : undefined;

  const recordContent = (
    <>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t.actions.cancel}
          className="w-14 h-14 rounded-full bg-white/10 items-center justify-center"
        >
          <Feather name="chevron-left" size={30} color="#FFFFFF" />
        </Pressable>
        <View className="items-center">
          <Text className="tracking-[7px] font-semibold" style={{ color: "#F5C04B", fontSize: 18 }}>
            GRIOT
          </Text>
          <Text className="text-white/55 text-xs" style={{ marginTop: 4 }}>
            {t.record.tagline}
          </Text>
        </View>
        <View className="w-14 h-14" />
      </View>

      {!isDraft ? (
        <>
          <View className="items-center" style={{ marginTop: isCompact ? 28 : 42, opacity: isRecording ? 0.58 : 1 }}>
            <Text className="text-white font-semibold text-center" style={{ fontSize: isCompact ? 32 : 38 }}>
              {t.record.title}
            </Text>
            <Text className="text-white/60 text-lg text-center" style={{ marginTop: 12 }}>
              {t.record.prompt}
            </Text>
          </View>

          <View
            className="self-center flex-row rounded-full border border-white/10 bg-black/45 p-1"
            style={{ marginTop: isCompact ? 22 : 30, opacity: isRecording ? 0.55 : 1 }}
          >
            {CATEGORIES.map((item) => {
              const selected = category === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setCategory(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={t.categories[item.labelKey]}
                  accessibilityState={{ selected }}
                  disabled={isRecording}
                  className="rounded-full flex-row items-center justify-center"
                  style={{
                    minWidth: isCompact ? 118 : 138,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: selected ? "#F5B820" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                  <Text
                    className="font-semibold"
                    style={{ color: selected ? "#16110A" : "#FFFFFF", marginLeft: 8 }}
                  >
                    {t.categories[item.labelKey]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View className="items-center" style={{ marginTop: isDraft ? 26 : isCompact ? 28 : 42 }}>
        <Pressable
          onPress={() => {
            if (pendingUri) void togglePreview();
          }}
          onPressIn={() => {
            if (__DEV__ && !pendingUri) console.log("[Record responder] press-in");
            if (mode === "idle" && !pendingUri && !isPublishing) void startRecording();
          }}
          onPressOut={() => {
            if (__DEV__ && !pendingUri) console.log("[Record responder] press-out");
            if (recordingOperationRef.current === "starting") {
              recordingReleaseRequestedRef.current = true;
            } else if (recordingOperationRef.current === "recording") {
              void stopRecording();
            }
          }}
          onResponderTerminate={() => {
            if (__DEV__ && !pendingUri) console.log("[Record responder] terminated");
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isRecording ? t.record.releaseToFinish : pendingUri ? t.record.playPreview : t.record.holdToSpeak
          }
          accessibilityHint={pendingUri ? undefined : t.record.holdToSpeak}
          disabled={isPublishing}
          style={{ width: instrumentSize, height: instrumentSize }}
        >
          <CircularVoiceRecorder
            size={instrumentSize}
            state={isRecording ? "recording" : pendingUri ? "preview" : "idle"}
            playing={previewStatus.playing}
            progress={isRecording ? recordingProgress : previewProgress}
            primaryLabel={
              isRecording
                ? t.record.listening
                : pendingUri
                  ? previewStatus.playing
                    ? t.record.pausePreview
                    : t.record.playPreview
                  : t.record.holdToSpeak
            }
            secondaryLabel={isRecording ? t.record.releaseToFinish : idleHint}
            elapsedLabel={
              isRecording
                ? recordingElapsedLabel
                : pendingUri
                  ? `${format(previewPositionMillis)} / ${format(previewDurationMillis)}`
                  : undefined
            }
          />
        </Pressable>
      </View>

      {pendingUri ? (
        <View className="rounded-3xl border border-white/10 bg-black/45 p-4" style={{ marginTop: 30 }}>
          <Text className="text-white font-semibold mb-2">{t.record.voiceTitleLabel}</Text>
          <TextInput
            value={voiceTitle}
            onChangeText={(value) => {
              setVoiceTitle(value);
              setPublishError("");
            }}
            maxLength={MAX_VOICE_TITLE_LENGTH}
            editable={!isPublishing}
            accessibilityLabel={t.record.voiceTitleLabel}
            placeholder={t.record.voiceTitlePlaceholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white text-base"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="flex-1 mr-3 text-red-200/80 text-xs">
              {publishError || durationError || (voiceTitle.length > 0 ? titleError : "")}
            </Text>
            <Text className="text-white/45 text-xs">
              {t.record.voiceTitleCharacterCount(voiceTitle.length, MAX_VOICE_TITLE_LENGTH)}
            </Text>
          </View>
          <View className="flex-row self-start rounded-full border border-white/10 bg-black/30 p-1" style={{ marginTop: 14 }}>
            {CATEGORIES.map((item) => {
              const selected = category === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setCategory(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={t.categories[item.labelKey]}
                  accessibilityState={{ selected }}
                  disabled={isPublishing}
                  className="rounded-full flex-row items-center"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    backgroundColor: selected ? "rgba(245,184,32,0.22)" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{item.emoji}</Text>
                  <Text className="text-xs font-medium" style={{ color: selected ? "#F5C04B" : "#FFFFFF99", marginLeft: 5 }}>
                    {t.categories[item.labelKey]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="flex-row gap-3 mt-4">
            <Pressable
              disabled={isPublishing}
              onPress={() => void handleRecordAgain()}
              accessibilityRole="button"
              accessibilityLabel={t.record.recordAgain}
              className="flex-1 rounded-full border border-white/15 py-3 items-center"
              style={{ opacity: isPublishing ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold">{t.record.recordAgain}</Text>
            </Pressable>
            <Pressable
              disabled={isPublishing}
              onPress={() => void discardDraft()}
              accessibilityRole="button"
              accessibilityLabel={t.record.discard}
              className="flex-1 rounded-full py-3 items-center"
              style={{ opacity: isPublishing ? 0.5 : 1 }}
            >
              <Text className="text-red-200/80 font-medium">{t.record.discard}</Text>
            </Pressable>
          </View>
          <Pressable
            disabled={!canPublish}
            onPress={() => void publishRecording()}
            accessibilityRole="button"
            accessibilityLabel={t.record.publish}
            className="rounded-full py-4 items-center mt-3"
            style={{ opacity: canPublish ? 1 : 0.45, backgroundColor: "#F5B820" }}
          >
            <Text className="text-black font-semibold">
              {isPublishing ? t.record.publishing : t.record.publish}
            </Text>
          </Pressable>
        </View>
      ) : showSupport && !isRecording ? (
        <View className="flex-row justify-between" style={{ marginTop: 56 }}>
          {[
            ["waveform", t.record.supportMomentsTitle, t.record.supportMomentsBody],
            ["compass-outline", t.record.supportPerspectiveTitle, t.record.supportPerspectiveBody],
            ["account-group-outline", t.record.supportWorldTitle, t.record.supportWorldBody],
          ].map(([icon, title, body]) => (
            <View key={title} className="items-center" style={{ width: "31%" }}>
              <MaterialCommunityIcons name={icon as "waveform"} size={26} color="#FFFFFF" />
              <Text className="text-white text-center font-medium text-sm" style={{ marginTop: 10 }}>
                {title}
              </Text>
              <Text className="text-white/50 text-center text-xs" style={{ marginTop: 5 }}>
                {body}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );

  return (
    <View className="flex-1 bg-black">
      <VoiceAtmosphere category={category} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isDraft ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + 14,
              paddingBottom: navContentInset,
              paddingHorizontal: isCompact ? 20 : 26,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t.actions.cancel}
            className="w-14 h-14 rounded-full bg-white/10 items-center justify-center"
          >
            <Feather name="chevron-left" size={30} color="#FFFFFF" />
          </Pressable>
          <View className="items-center">
            <Text className="tracking-[7px] font-semibold" style={{ color: "#F5C04B", fontSize: 18 }}>
              GRIOT
            </Text>
            <Text className="text-white/55 text-xs" style={{ marginTop: 4 }}>
              {t.record.tagline}
            </Text>
          </View>
          <View className="w-14 h-14" />
        </View>

        {!isDraft ? (
          <>
            <View className="items-center" style={{ marginTop: isCompact ? 28 : 42, opacity: isRecording ? 0.58 : 1 }}>
              <Text className="text-white font-semibold text-center" style={{ fontSize: isCompact ? 32 : 38 }}>
                {t.record.title}
              </Text>
              <Text className="text-white/60 text-lg text-center" style={{ marginTop: 12 }}>
                {t.record.prompt}
              </Text>
            </View>

            <View
              className="self-center flex-row rounded-full border border-white/10 bg-black/45 p-1"
              style={{ marginTop: isCompact ? 22 : 30, opacity: isRecording ? 0.55 : 1 }}
            >
              {CATEGORIES.map((item) => {
                const selected = category === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setCategory(item.key)}
                    accessibilityRole="button"
                    accessibilityLabel={t.categories[item.labelKey]}
                    accessibilityState={{ selected }}
                    disabled={isRecording}
                    className="rounded-full flex-row items-center justify-center"
                    style={{
                      minWidth: isCompact ? 118 : 138,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      backgroundColor: selected ? "#F5B820" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                    <Text
                      className="font-semibold"
                      style={{ color: selected ? "#16110A" : "#FFFFFF", marginLeft: 8 }}
                    >
                      {t.categories[item.labelKey]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <View className="items-center" style={{ marginTop: isDraft ? 26 : isCompact ? 28 : 42 }}>
          <Pressable
            onPress={() => {
              if (pendingUri) void togglePreview();
            }}
            onPressIn={() => {
              if (mode === "idle" && !pendingUri && !isPublishing) void startRecording();
            }}
            onPressOut={() => {
              if (recordingOperationRef.current === "starting") {
                recordingReleaseRequestedRef.current = true;
              } else if (recordingOperationRef.current === "recording") {
                void stopRecording();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isRecording ? t.record.releaseToFinish : pendingUri ? t.record.playPreview : t.record.holdToSpeak
            }
            accessibilityHint={pendingUri ? undefined : t.record.holdToSpeak}
            disabled={isPublishing}
            style={{ width: instrumentSize, height: instrumentSize }}
          >
            <CircularVoiceRecorder
              size={instrumentSize}
              state={isRecording ? "recording" : pendingUri ? "preview" : "idle"}
              playing={previewStatus.playing}
              progress={isRecording ? recordingProgress : previewProgress}
              primaryLabel={
                isRecording
                  ? t.record.listening
                  : pendingUri
                    ? previewStatus.playing
                      ? t.record.pausePreview
                      : t.record.playPreview
                    : t.record.holdToSpeak
              }
              secondaryLabel={isRecording ? t.record.releaseToFinish : idleHint}
              elapsedLabel={
                isRecording
                  ? recordingElapsedLabel
                  : pendingUri
                    ? `${format(previewPositionMillis)} / ${format(previewDurationMillis)}`
                    : undefined
              }
            />
          </Pressable>
        </View>

        {pendingUri ? (
          <View className="rounded-3xl border border-white/10 bg-black/45 p-4" style={{ marginTop: 30 }}>
            <Text className="text-white font-semibold mb-2">{t.record.voiceTitleLabel}</Text>
            <TextInput
              value={voiceTitle}
              onChangeText={(value) => {
                setVoiceTitle(value);
                setPublishError("");
              }}
              maxLength={MAX_VOICE_TITLE_LENGTH}
              editable={!isPublishing}
              accessibilityLabel={t.record.voiceTitleLabel}
              placeholder={t.record.voiceTitlePlaceholder}
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white text-base"
            />
            <View className="flex-row justify-between mt-2">
              <Text className="flex-1 mr-3 text-red-200/80 text-xs">
              {publishError || durationError || (voiceTitle.length > 0 ? titleError : "")}
            </Text>
              <Text className="text-white/45 text-xs">
                {t.record.voiceTitleCharacterCount(voiceTitle.length, MAX_VOICE_TITLE_LENGTH)}
              </Text>
            </View>
            <View className="flex-row self-start rounded-full border border-white/10 bg-black/30 p-1" style={{ marginTop: 14 }}>
              {CATEGORIES.map((item) => {
                const selected = category === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setCategory(item.key)}
                    accessibilityRole="button"
                    accessibilityLabel={t.categories[item.labelKey]}
                    accessibilityState={{ selected }}
                    disabled={isPublishing}
                    className="rounded-full flex-row items-center"
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      backgroundColor: selected ? "rgba(245,184,32,0.22)" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{item.emoji}</Text>
                    <Text className="text-xs font-medium" style={{ color: selected ? "#F5C04B" : "#FFFFFF99", marginLeft: 5 }}>
                      {t.categories[item.labelKey]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="flex-row gap-3 mt-4">
              <Pressable
                disabled={isPublishing}
                onPress={() => void handleRecordAgain()}
                accessibilityRole="button"
                accessibilityLabel={t.record.recordAgain}
                className="flex-1 rounded-full border border-white/15 py-3 items-center"
                style={{ opacity: isPublishing ? 0.5 : 1 }}
              >
                <Text className="text-white font-semibold">{t.record.recordAgain}</Text>
              </Pressable>
              <Pressable
                disabled={isPublishing}
                onPress={() => void discardDraft()}
                accessibilityRole="button"
                accessibilityLabel={t.record.discard}
                className="flex-1 rounded-full py-3 items-center"
                style={{ opacity: isPublishing ? 0.5 : 1 }}
              >
                <Text className="text-red-200/80 font-medium">{t.record.discard}</Text>
              </Pressable>
            </View>
            <Pressable
              disabled={!canPublish}
              onPress={() => void publishRecording()}
              accessibilityRole="button"
              accessibilityLabel={t.record.publish}
              className="rounded-full py-4 items-center mt-3"
              style={{ opacity: canPublish ? 1 : 0.45, backgroundColor: "#F5B820" }}
            >
              <Text className="text-black font-semibold">
                {isPublishing ? t.record.publishing : t.record.publish}
              </Text>
            </Pressable>
          </View>
        ) : showSupport && !isRecording ? (
          <View className="flex-row justify-between" style={{ marginTop: 56 }}>
            {[
              ["waveform", t.record.supportMomentsTitle, t.record.supportMomentsBody],
              ["compass-outline", t.record.supportPerspectiveTitle, t.record.supportPerspectiveBody],
              ["account-group-outline", t.record.supportWorldTitle, t.record.supportWorldBody],
            ].map(([icon, title, body]) => (
              <View key={title} className="items-center" style={{ width: "31%" }}>
                <MaterialCommunityIcons name={icon as "waveform"} size={26} color="#FFFFFF" />
                <Text className="text-white text-center font-medium text-sm" style={{ marginTop: 10 }}>
                  {title}
                </Text>
                <Text className="text-white/50 text-center text-xs" style={{ marginTop: 5 }}>
                  {body}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
          </ScrollView>
        ) : (
          <View
            className="flex-1"
            style={{
              paddingTop: insets.top + 14,
              paddingBottom: navContentInset,
              paddingHorizontal: isCompact ? 20 : 26,
            }}
          >
            {recordContent}
          </View>
        )}
      </KeyboardAvoidingView>

      <FloatingMic
        activeRoute="record"
        showRecordLabel
        onPressFeed={() => router.replace("/")}
        onPressMyVoices={() => router.replace("/my-voices")}
        onPressRecord={() => undefined}
        onPressSaved={() => router.replace("/saved")}
      />

      {justPosted && (
        <View className="absolute self-center rounded-xl bg-black/80 px-6 py-4" style={{ bottom: navContentInset }}>
          <Text className="text-white text-center mb-2">{t.record.published}</Text>
          <Pressable onPress={handleRedo} accessibilityRole="button" accessibilityLabel={t.record.replace}>
            <Text style={{ color: "#F5B820" }} className="text-center">
              {t.record.replace}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
