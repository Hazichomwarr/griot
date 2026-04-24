// src/components/AudioCard.tsx
import { safeAudioCleanup } from "@/lib/safeAudioCleanup";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AudioPost,
  Category,
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
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function AudioCard({ item }: Props) {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const activeId = useRecordingStore((s) => s.activeId);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handlePlayback() {
    // if (!item?.uri) return;
    if (activeId === item.id) {
      const { sound } = await Audio.Sound.createAsync({
        uri: item.uri,
      });
      //   await sound.setVolumeAsync(1.0); // max volume;
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);

        if (status.durationMillis) {
          setProgress(status.positionMillis / status.durationMillis);
        }
        if (status.didJustFinish) {
          //   sound.unloadAsync(); don't destroy it
          setIsPlaying(false);
          setProgress(0);
        }
      });
      await sound.playAsync();
    } else {
      if (soundRef.current) {
        await safeAudioCleanup(soundRef.current); //use  safeAudioCleanup helper to avoid Race consition between UI and async system.
      }
      soundRef.current = null;
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
      className="bg-black justify-between px-6 py-10"
    >
      {/* TOP — minimal identity */}
      <View>
        <Text className="text-white text-lg font-semibold">
          {item.neighborhood}
        </Text>
        <Text className="text-neutral-400 text-sm">{item.town}</Text>

        {/* 👉 CATEGORY BADGE */}
        <View
          className={`ml-auto bg-white/10 px-3 py-1 rounded-full ${bgMap[item.category]}`}
        >
          <Text className="text-white text-sm">
            {categoryMap[item.category]} {item.category}
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

      {/* BOTTOM — category (light touch) */}
      <View>
        <Text className="text-neutral-500 text-xs">#{item.category}</Text>
      </View>
    </Pressable>
  );
}
