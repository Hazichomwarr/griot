// src/components/AudioCard.tsx

import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { safeAudioCleanup } from "@/src/lib/safeAudioCleanup";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioPost, useRecordingStore } from "../store/useRecordingStore";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const waveformBars = [8, 14, 22, 13, 28, 18, 10, 24, 32, 15, 20, 26];

type Props = {
  item: AudioPost;
  nextItem?: AudioPost;
  sharedNextSoundRef: React.MutableRefObject<Audio.Sound | null>;
};

export default function AudioCard({
  item,
  nextItem,
  sharedNextSoundRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const isCompact = usableHeight < 700 || SCREEN_WIDTH < 390;
  const t = getStrings();
  const country = item.country || t.audioCard.countryFallback;
  const neighborhood = item.neighborhood || t.audioCard.neighborhoodFallback;
  const town = item.town || t.audioCard.townFallback;
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
  useEffect(() => {
    if (soundRef.current) {
      safeAudioCleanup(soundRef.current);
      soundRef.current = null;
    }
  }, [stopAllAudioFlag]);

  const toggleSave = useRecordingStore((s) => s.toggleSave);
  const isSaved = useRecordingStore((s) => s.isSaved(item.id));

  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const soundRef = useRef<Audio.Sound | null>(null);
  const nextSoundRef = sharedNextSoundRef;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(
    item.duration ? item.duration * 1000 : 0,
  );
  const waveformCount = isCompact ? 32 : 48;

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setPositionMillis(0);
    setDurationMillis(item.duration ? item.duration * 1000 : 0);
  }, [item.id, item.duration]);

  // 🎧 PLAYBACK ENGINE
  async function handlePlayback() {
    try {
      if (!item.uri) {
        console.log("Skipping post with missing uri:", item);
        return;
      }
      // 👉 ACTIVE CARD
      if (activeId === item.id) {
        // 🎧 PLAY CURRENT (reuse preload if available)
        if (!soundRef.current) {
          let sound: Audio.Sound | null = null;

          // 1. Try to reuse preloaded sound
          if (nextSoundRef.current) {
            const preloaded = nextSoundRef.current;
            const status = await preloaded.getStatusAsync();

            if (status.isLoaded) {
              sound = preloaded;
              nextSoundRef.current = null;
            }
          }

          // 2. Fallback → create fresh sound
          if (!sound) {
            const result = await Audio.Sound.createAsync(
              { uri: item.uri },
              { shouldPlay: false },
            );
            sound = result.sound;
          }

          soundRef.current = sound;

          // 🎯 Attach listener ONCE
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;

            setIsPlaying(status.isPlaying);
            setPositionMillis(status.positionMillis);

            if (status.durationMillis) {
              setDurationMillis(status.durationMillis);
              setProgress(status.positionMillis / status.durationMillis);
            }

            if (status.didJustFinish) {
              // Reset UI
              setIsPlaying(false);
              setProgress(0);
              setPositionMillis(0);

              // AUTO-ADVANCE with tiny delay smoother flow
              setTimeout(() => {
                if (nextItem?.id) {
                  setActive(nextItem.id);
                }
              }, 120);
            }
          });

          // ▶️ Safe play
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.playAsync();
          }
        }

        // ⚡ PRELOAD NEXT (non-blocking)
        if (nextItem && !nextSoundRef.current) {
          Audio.Sound.createAsync({ uri: nextItem.uri }, { shouldPlay: false })
            .then(({ sound }) => {
              nextSoundRef.current = sound;
            })
            .catch(() => {});
        }
      }

      // 👉 NOT ACTIVE → CLEANUP
      else {
        if (soundRef.current) {
          try {
            await soundRef.current.setVolumeAsync(0); // smooth fade out
          } catch {}
          await safeAudioCleanup(soundRef.current);
          soundRef.current = null;
        }
      }
    } catch (err) {
      console.log("handlePlayback error:", err);
    }
  }

  useEffect(() => {
    handlePlayback();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [activeId]);

  // 🎛 toggle
  async function togglePlay() {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
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
              className="text-white text-center font-medium"
              numberOfLines={isCompact ? 4 : 5}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={{
                fontSize: isCompact ? 28 : 34,
                lineHeight: isCompact ? 35 : 42,
              }}
            >
              {item.transcript || t.audioCard.fallbackTranscript}
            </Text>

            <Text
              className="text-white/85 text-center"
              numberOfLines={1}
              style={{
                marginTop: isCompact ? 18 : 28,
                fontSize: isCompact ? 14 : 16,
              }}
            >
              {item.username} • {neighborhood} •{" "}
              <Text style={{ color: theme.light }}>{t.audioCard.now}</Text>
              {item.distance ? ` • ${item.distance}` : ""}
            </Text>

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
