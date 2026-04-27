// src/components/AudioCard.tsx
import { safeAudioCleanup } from "@/lib/safeAudioCleanup";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AudioPost,
  Category,
  Reactions,
  useRecordingStore,
} from "../store/useRecordingStore";

const categoryMap: Record<Category, string> = {
  social: "😂",
  security: "🚨",
  vente: "🛒",
};
const bgMap = {
  social: "bg-black",
  security: "bg-red-900/20",
  vente: "bg-green-900/20",
};

type Props = {
  item: AudioPost;
  nextItem?: AudioPost;
  sharedNextSoundRef: React.MutableRefObject<Audio.Sound | null>;
};

const emojis: (keyof Reactions)[] = ["😂", "🚨", "👍"];

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function AudioCard({
  item,
  nextItem,

  sharedNextSoundRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const stopAllAudioFlag = useRecordingStore((s) => s.stopAllAudioFlag);
  useEffect(() => {
    if (soundRef.current) {
      safeAudioCleanup(soundRef.current);
      soundRef.current = null;
    }
  }, [stopAllAudioFlag]);

  const setActive = useRecordingStore((s) => s.setActive);
  const activeId = useRecordingStore((s) => s.activeId);
  const addReaction = useRecordingStore((s) => s.addReaction);

  const soundRef = useRef<Audio.Sound | null>(null);
  const nextSoundRef = sharedNextSoundRef; //for preloading

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handlePlayback() {
    try {
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

            if (status.durationMillis) {
              setProgress(status.positionMillis / status.durationMillis);
            }

            if (status.didJustFinish) {
              // Reset UI
              setIsPlaying(false);
              setProgress(0);

              // AUTO-ADVANCE
              if (nextItem?.id) {
                setActive(nextItem.id);
              }
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

      if (nextSoundRef.current) {
        nextSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [activeId]);

  //Tap to pause / resume
  async function togglePlay() {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      //if finished -> restart from 0
      if (status.positionMillis === status.durationMillis) {
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
    }
  }

  return (
    <Pressable
      onPress={togglePlay}
      style={{ height: usableHeight }}
      className={`${bgMap[item.category]} justify-around px-6 py-10`}
    >
      {/* TOP — minimal identity */}
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-lg font-semibold">
          {item.neighborhood}
        </Text>
        <Text className="ml-1 text-neutral-700 text-sm">({item.town})</Text>

        {/* 👉 CATEGORY BADGE */}
        <View className="ml-auto bg-white/10 px-3 py-2 rounded-full">
          <Text className="text-white font-semibold text-sm">
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* CENTER — premium listening zone */}
      <View className="items-center">
        {/* subtle pulse instead of fake waveform */}
        <View className="w-32 h-32 rounded-full bg-neutral-800 items-center justify-center mb-8">
          <Text className="text-white text-3xl">{isPlaying ? "⏸" : "▶"}</Text>
        </View>

        {/* progress bar */}
        <View className="w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-white"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      <View className="mt-6">
        {/* Views */}
        <Text className="text-gray-400 text-sm mb-3">{item.views} écoutes</Text>

        {/* Reactions */}
        <View className="flex-row justify-around items-center">
          {emojis.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => addReaction(item.id, emoji)}
              className="items-center"
            >
              <Text className="text-2xl">{emoji}</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {item.reactions[emoji]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Pressable>
  );
}
