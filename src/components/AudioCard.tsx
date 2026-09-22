// src/components/AudioCard.tsx

import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { configurePlaybackAudioMode } from "@/src/lib/audioSession";
import { getPostTitle } from "@/src/lib/postPresentation";
import { safeAudioCleanup } from "@/src/lib/safeAudioCleanup";
import {
  incrementPostViews,
  incrementReaction,
} from "@/src/services/postService";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AudioPost, Reactions } from "../store/useRecordingStore";
import { useRecordingStore } from "../store/useRecordingStore";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const waveformBars = [8, 14, 22, 13, 28, 18, 10, 24, 32, 15, 20, 26];
const reactionEmojis: (keyof Reactions)[] = ["😂", "🚨", "👍"];

type Props = {
  item: AudioPost;
  nextItem?: AudioPost;
  showCategoryHeader?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  onReport?: () => void;
  reported?: boolean;
};

export default function AudioCard({
  item,
  nextItem,
  showCategoryHeader = true,
  onDelete,
  deleting = false,
  onReport,
  reported = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const isCompact = usableHeight < 700 || SCREEN_WIDTH < 390;
  const t = getStrings();
  const country = item.country || t.audioCard.countryFallback;
  const neighborhood = item.neighborhood?.trim();
  const town = item.town || t.audioCard.townFallback;
  const displayTitle = getPostTitle(item, t);
  const theme = getCategoryTheme(item.category);
  const categoryLabel =
    item.category === "around_you"
      ? t.categories.aroundYou
      : t.categories.moments;
  const categoryEmoji = item.category === "around_you" ? "📍" : "😂";
  const categoryDescription =
    item.category === "around_you"
      ? t.categories.aroundYouDescription
      : t.categories.momentsDescription;

  const stopAllAudioFlag = useRecordingStore((s) => s.stopAllAudioFlag);

  const toggleSave = useRecordingStore((s) => s.toggleSave);
  const isSaved = useRecordingStore((s) => s.isSaved(item.id));
  const incrementViews = useRecordingStore((s) => s.incrementViews);
  const hasViewedPost = useRecordingStore((s) => s.hasViewedPost);
  const addReaction = useRecordingStore((s) => s.addReaction);
  const hasReacted = useRecordingStore((s) => s.hasReactedToPost(item.id));

  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const player = useAudioPlayer(item.uri, { updateInterval: 200 });
  const playbackStatus = useAudioPlayerStatus(player);
  const viewRegistrationStartedRef = useRef(false);
  const finishHandledRef = useRef(false);
  const wasActiveRef = useRef(false);
  const lastStopAllAudioFlagRef = useRef(stopAllAudioFlag);
  const playbackGenerationRef = useRef(0);

  const isPlaying = playbackStatus.playing;
  const positionMillis = playbackStatus.currentTime * 1000;
  const durationMillis = playbackStatus.duration
    ? playbackStatus.duration * 1000
    : (item.duration ?? 0) * 1000;
  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;
  const waveformCount = isCompact ? 32 : 48;
  const metadata = [
    neighborhood,
    t.audioCard.now,
    t.audioCard.listens(item.views),
    item.distance ? `📍 ${item.distance} ${t.audioCard.away}` : "",
  ].filter(Boolean);

  useEffect(() => {
    viewRegistrationStartedRef.current = false;
  }, [item.id, item.duration]);

  const registerView = useCallback(() => {
    if (viewRegistrationStartedRef.current || hasViewedPost(item.id)) return;

    viewRegistrationStartedRef.current = true;
    incrementViews(item.id);

    incrementPostViews(item.id)
      .then((succeeded) => {
        if (!succeeded) {
          console.log("View persisted locally only:", item.id);
        }
      })
      .catch((err) => {
        console.log("View persistence skipped:", err);
      });
  }, [hasViewedPost, incrementViews, item.id]);

  function handleReaction(emoji: keyof Reactions) {
    if (useRecordingStore.getState().hasReactedToPost(item.id)) return;

    addReaction(item.id, emoji);

    incrementReaction(item.id, emoji)
      .then((succeeded) => {
        if (!succeeded) {
          console.log("Reaction persisted locally only:", item.id, emoji);
        }
      })
      .catch((err) => {
        console.log("Reaction persistence skipped:", err);
      });
  }

  const startPlayback = useCallback(async () => {
    const generation = playbackGenerationRef.current;
    const stopAllFlag = useRecordingStore.getState().stopAllAudioFlag;

    try {
      await configurePlaybackAudioMode();

      if (
        generation === playbackGenerationRef.current &&
        stopAllFlag === useRecordingStore.getState().stopAllAudioFlag &&
        useRecordingStore.getState().activeId === item.id
      ) {
        player.play();
      }
    } catch (err) {
      console.log("Audio playback setup error:", err);
    }
  }, [item.id, player]);

  useEffect(() => {
    const isActive = activeId === item.id;

    if (isActive && !wasActiveRef.current) {
      // A new active session gets one completion transition.
      finishHandledRef.current = false;
    }
    wasActiveRef.current = isActive;

    if (isActive) {
      void startPlayback();
      return;
    }

    void safeAudioCleanup(player);
  }, [activeId, item.id, player, startPlayback]);

  useEffect(() => {
    if (lastStopAllAudioFlagRef.current === stopAllAudioFlag) return;

    lastStopAllAudioFlagRef.current = stopAllAudioFlag;
    playbackGenerationRef.current += 1;
    void safeAudioCleanup(player);
  }, [stopAllAudioFlag, player]);

  useEffect(() => {
    if (activeId === item.id && playbackStatus.playing) {
      registerView();
    }
  }, [activeId, item.id, playbackStatus.playing, registerView]);

  useEffect(() => {
    if (
      activeId !== item.id ||
      !playbackStatus.didJustFinish ||
      finishHandledRef.current
    ) {
      return;
    }

    finishHandledRef.current = true;
    void player.seekTo(0).catch((err) => {
      console.log("Audio finish reset error:", err);
    });

    const advanceTimeout = setTimeout(() => {
      if (nextItem?.id) setActive(nextItem.id);
    }, 120);

    return () => clearTimeout(advanceTimeout);
  }, [
    activeId,
    item.id,
    nextItem?.id,
    playbackStatus.didJustFinish,
    player,
    setActive,
    stopAllAudioFlag,
  ]);

  // 🎛 toggle
  async function togglePlay() {
    if (activeId !== item.id) {
      setActive(item.id);
      return;
    }

    if (playbackStatus.playing) {
      player.pause();
    } else {
      void startPlayback();
    }
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <Pressable
      onPress={togglePlay}
      style={{ height: usableHeight, backgroundColor: theme.bg }}
    >
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade",
        }}
        blurRadius={50}
        className="flex-1"
      >
        <View
          className="absolute inset-0"
          style={{ backgroundColor: theme.bg }}
        />
        <View
          className="absolute rounded-full self-center"
          style={{
            width: isCompact ? 250 : 320,
            height: isCompact ? 250 : 320,
            top: isCompact ? "43%" : "32%",
            backgroundColor: `${theme.deep}55`,
          }}
        />
        <View className="absolute inset-0 bg-black/55" />

        <View
          className="flex-1"
          style={{ paddingHorizontal: isCompact ? 18 : 24 }}
        >
          {/* TOP BAR */}
          <View
            style={{ paddingTop: insets.top + (isCompact ? 8 : 16) }}
            className="items-center"
          >
            <Text
              className="tracking-[6px] font-semibold"
              style={{
                color: theme.light,
                fontSize: isCompact ? 16 : 18,
              }}
            >
              GRIOT
            </Text>

            {showCategoryHeader && (
              <View
                className="rounded-full border border-white/10"
                style={{
                  marginTop: isCompact ? 18 : 32,
                  paddingHorizontal: isCompact ? 18 : 20,
                  paddingVertical: isCompact ? 9 : 12,
                  backgroundColor: `${theme.primary}CC`,
                }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{ fontSize: isCompact ? 16 : 18 }}
                >
                  {categoryEmoji} {categoryLabel}
                </Text>
              </View>
            )}

            {showCategoryHeader && (
              <Text
                className="text-white/85 text-center"
                numberOfLines={isCompact ? 2 : 3}
                style={{
                  marginTop: isCompact ? 12 : 16,
                  paddingHorizontal: isCompact ? 8 : 32,
                  fontSize: isCompact ? 14 : 16,
                  lineHeight: isCompact ? 18 : 22,
                }}
              >
                {categoryDescription}
              </Text>
            )}
          </View>

          {/* CENTER — VOICE */}
          <View
            className="flex-1 justify-center items-center"
            style={{
              paddingHorizontal: isCompact ? 4 : 16,
              paddingBottom: isCompact ? 104 : 144,
            }}
          >
            <Text
              className="text-white text-center font-normal"
              numberOfLines={isCompact ? 4 : 5}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={{
                fontSize: isCompact ? 25 : 32,
                lineHeight: isCompact ? 31 : 40,
              }}
            >
              {displayTitle}
            </Text>

            <Text
              className="text-white/85 text-center"
              numberOfLines={1}
              style={{
                marginTop: isCompact ? 18 : 28,
                fontSize: isCompact ? 14 : 16,
              }}
            >
              {metadata.join(" • ")}
            </Text>

            <View
              className="flex-row items-center justify-center"
              style={{ marginTop: isCompact ? 12 : 16 }}
            >
              {reactionEmojis.map((emoji) => (
                <Pressable
                  key={emoji}
                  disabled={hasReacted}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className="rounded-full border flex-row items-center"
                  style={{
                    marginHorizontal: 4,
                    paddingHorizontal: isCompact ? 10 : 12,
                    paddingVertical: isCompact ? 5 : 6,
                    opacity: hasReacted ? 0.45 : 1,
                    borderColor: hasReacted
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.15)",
                    backgroundColor: hasReacted
                      ? "rgba(120,120,120,0.18)"
                      : "rgba(0,0,0,0.25)",
                  }}
                  accessibilityLabel={t.audioCard.reactWith(emoji)}
                >
                  <Text
                    style={{
                      color: hasReacted ? "#A3A3A3" : "#FFFFFF",
                      fontSize: isCompact ? 13 : 14,
                    }}
                  >
                    {emoji} {item.reactions[emoji] ?? 0}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* PLAYER */}
            <View
              className="items-center w-full"
              style={{ marginTop: isCompact ? 22 : 28 }}
            >
              <View className="w-full flex-row items-center justify-center">
                <View style={{ width: isCompact ? 42 : 48 }} />
                <View
                  className="rounded-full border items-center justify-center"
                  style={{
                    width: isCompact ? 88 : 112,
                    height: isCompact ? 88 : 112,
                    borderColor: theme.primary,
                  }}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: isCompact ? 26 : 30,
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </Text>
                </View>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    toggleSave(item.id);
                  }}
                  className="rounded-full border border-white/40 items-center justify-center"
                  style={{
                    width: isCompact ? 42 : 48,
                    height: isCompact ? 42 : 48,
                    marginLeft: isCompact ? 18 : 28,
                  }}
                  accessibilityLabel={
                    isSaved ? t.actions.saved : t.actions.save
                  }
                >
                  <Text
                    className="text-lg"
                    style={{ color: isSaved ? theme.light : "#FFFFFF" }}
                  >
                    {isSaved ? "▰" : "▱"}
                  </Text>
                </Pressable>
                {onDelete && (
                  <Pressable
                    disabled={deleting}
                    onPress={(event) => {
                      event.stopPropagation();
                      onDelete();
                    }}
                    className="rounded-full border border-white/40 items-center justify-center"
                    style={{
                      width: isCompact ? 42 : 48,
                      height: isCompact ? 42 : 48,
                      marginLeft: isCompact ? 10 : 14,
                      opacity: deleting ? 0.45 : 1,
                    }}
                    accessibilityLabel={t.myVoices.deleteVoice}
                  >
                    {deleting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text className="text-lg" style={{ color: "#FFFFFF" }}>
                        🗑
                      </Text>
                    )}
                  </Pressable>
                )}
                {onReport && (
                  <Pressable
                    disabled={reported}
                    onPress={(event) => {
                      event.stopPropagation();
                      onReport();
                    }}
                    className="rounded-full border border-white/40 items-center justify-center"
                    style={{
                      width: isCompact ? 42 : 48,
                      height: isCompact ? 42 : 48,
                      marginLeft: isCompact ? 10 : 14,
                      opacity: reported ? 0.45 : 1,
                    }}
                    accessibilityLabel={
                      reported
                        ? t.report.alreadyReported
                        : t.report.reportVoice
                    }
                  >
                    <Text
                      className="text-base"
                      style={{ color: reported ? "#A3A3A3" : "#FFFFFF" }}
                    >
                      {reported ? "✓" : "⚑"}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View
                className="items-center"
                style={{ marginTop: isCompact ? 12 : 20 }}
              >
                <Text className="text-white/75 text-sm">
                  📍 {town}, {country}
                </Text>
              </View>

              <View
                className="flex-row items-end gap-[2px] mb-3"
                style={{
                  height: isCompact ? 38 : 56,
                  marginTop: isCompact ? 18 : 32,
                }}
              >
                {Array.from({ length: waveformCount }).map((_, i) => (
                  <View
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                      height:
                        waveformBars[i % waveformBars.length] *
                        (isCompact ? 0.82 : 1),
                      backgroundColor: theme.primary,
                      opacity: i / waveformCount + 0.18,
                    }}
                  />
                ))}
              </View>

              <View className="w-full flex-row items-center gap-3">
                <Text className="text-white/85 text-xs">
                  {formatTime(positionMillis)}
                </Text>
                <View className="flex-1 h-[3px] bg-white/15 rounded-full overflow-hidden">
                  <View
                    className="h-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: theme.primary,
                    }}
                  />
                </View>
                <Text className="text-white/85 text-xs">
                  {formatTime(durationMillis)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
