// src/components/AudioCard.tsx

import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { configurePlaybackAudioMode } from "@/src/lib/audioSession";
import { getPostTitle } from "@/src/lib/postPresentation";
import { safeAudioCleanup } from "@/src/lib/safeAudioCleanup";
import { useGriotAudioPlayer } from "@/src/lib/useGriotAudioPlayer";
import {
  incrementPostViews,
  incrementReaction,
} from "@/src/services/postService";
import { useAudioPlayerStatus } from "expo-audio";
import React, { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CircularAudioProgress from "./CircularAudioProgress";
import VoiceAtmosphere from "./VoiceAtmosphere";
import type { AudioPost, Reactions } from "../store/useRecordingStore";
import { useRecordingStore } from "../store/useRecordingStore";

const reactionEmojis: (keyof Reactions)[] = ["😂", "🚨", "👍"];

type Props = {
  item: AudioPost;
  nextItem?: AudioPost;
  showCategoryHeader?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  onReport?: () => void;
  reported?: boolean;
  pageHeight?: number;
};

export default function AudioCard({
  item,
  nextItem,
  showCategoryHeader = true,
  onDelete,
  deleting = false,
  onReport,
  reported = false,
  pageHeight,
}: Props) {
  const insets = useSafeAreaInsets();
  const screenHeight = pageHeight ?? 760;
  const isCompact = screenHeight < 700;
  const t = getStrings();
  const neighborhood = item.neighborhood?.trim();
  const town = item.town || t.audioCard.townFallback;
  const displayTitle = getPostTitle(item, t);
  const theme = getCategoryTheme(item.category);
  const categoryLabel =
    item.category === "around_you"
      ? t.categories.aroundYou
      : t.categories.moments;
  const categoryEmoji = item.category === "around_you" ? "📍" : "😂";
  const stopAllAudioFlag = useRecordingStore((s) => s.stopAllAudioFlag);

  const toggleSave = useRecordingStore((s) => s.toggleSave);
  const isSaved = useRecordingStore((s) => s.isSaved(item.id));
  const incrementViews = useRecordingStore((s) => s.incrementViews);
  const hasViewedPost = useRecordingStore((s) => s.hasViewedPost);
  const addReaction = useRecordingStore((s) => s.addReaction);
  const hasReacted = useRecordingStore((s) => s.hasReactedToPost(item.id));

  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const player = useGriotAudioPlayer(item.uri, { updateInterval: 200 });
  const playbackStatus = useAudioPlayerStatus(player);
  const viewRegistrationStartedRef = useRef(false);
  const finishHandledRef = useRef(false);
  const wasActiveRef = useRef(false);
  const lastStopAllAudioFlagRef = useRef(stopAllAudioFlag);
  const playbackGenerationRef = useRef(0);
  const playOnActivationRef = useRef(false);

  const isPlaying = playbackStatus.playing;
  const positionMillis = playbackStatus.currentTime * 1000;
  const durationMillis = playbackStatus.duration
    ? playbackStatus.duration * 1000
    : (item.duration ?? 0) * 1000;
  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;
  const locationLabel = neighborhood || town;
  const contextLabel =
    item.category === "around_you" && item.distance
      ? `${locationLabel} · ${item.distance} ${t.audioCard.away}`
      : `${locationLabel} · ${t.audioCard.now}`;

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
      if (playOnActivationRef.current) {
        playOnActivationRef.current = false;
        void startPlayback();
      }
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
      playOnActivationRef.current = true;
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
    <View style={{ height: screenHeight, backgroundColor: theme.bg }}>
      <VoiceAtmosphere category={item.category} />
      <View
        className="flex-1 justify-between"
        style={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 106,
          paddingHorizontal: isCompact ? 20 : 26,
        }}
      >
        <View className="items-center">
          <Text className="tracking-[6px] font-semibold" style={{ color: theme.light, fontSize: 17 }}>
            GRIOT
          </Text>
          {showCategoryHeader && (
            <View
              className="rounded-full border border-white/10"
              style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "rgba(0,0,0,0.22)" }}
            >
              <Text className="text-xs font-semibold" style={{ color: theme.light }}>
                {categoryEmoji} {categoryLabel}
              </Text>
            </View>
          )}
          <Text className="text-white/65 text-sm" style={{ marginTop: 15 }} numberOfLines={1}>
            {contextLabel}
          </Text>
        </View>

        <View className="items-center">
          <CircularAudioProgress
            progress={progress}
            playing={isPlaying}
            accentColor={theme.primary}
            onToggle={togglePlay}
            accessibilityLabel={
              isPlaying ? t.audioCard.pauseVoice : t.audioCard.playVoice
            }
          />
          <Text className="text-white/75 text-sm" style={{ marginTop: 12 }}>
            {formatTime(positionMillis)} / {formatTime(durationMillis)}
          </Text>
        </View>

        <View className="items-center">
          <Text
            className="text-white text-center font-medium"
            numberOfLines={2}
            style={{ fontSize: isCompact ? 23 : 27, lineHeight: isCompact ? 29 : 34 }}
          >
            {displayTitle}
          </Text>
          <Text className="text-white/50 text-xs" style={{ marginTop: 10 }}>
            {t.audioCard.listens(item.views)}
          </Text>

          <View className="flex-row items-center justify-center" style={{ marginTop: 18 }}>
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
                    marginHorizontal: 3,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
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
          <View className="flex-row items-center justify-center" style={{ marginTop: 16 }}>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    toggleSave(item.id);
                  }}
                  className="rounded-full border border-white/40 items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
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
                    width: 42,
                    height: 42,
                    marginLeft: 10,
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
                    width: 42,
                    height: 42,
                    marginLeft: 10,
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
          <Text className="text-white/45 text-xs" style={{ marginTop: 18 }}>
            ↑ {t.feed.swipeNext}
          </Text>
          </View>
        </View>
      </View>
  );
}
