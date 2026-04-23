import { safeAudioCleanup } from "@/lib/safeAudioCleanup";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useRecordingStore } from "../store/useRecordingStore";

export default function AudioCard({ item }: any) {
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
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);

        if (status.durationMillis) {
          setProgress(status.positionMillis / status.durationMillis);
        }
        if (status.didJustFinish) {
          sound.unloadAsync();
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
      await soundRef.current.playAsync();
    }
  }
  const { height } = Dimensions.get("window");

  return (
    <Pressable
      onPress={togglePlay}
      style={{ height }}
      className="flex-1 justify-center items-center bg-black/50 mb-4 rounded"
    >
      <Text className="text-white mb-4">
        {isPlaying ? "Playing" : "Paused"}
      </Text>

      {/* Avatar placeholder */}
      <View className="w-32 h-32 bg-gray-600 rounded-full mb-6" />

      {/* Waveform */}
      <View className="flex-row gap-[2px] mt-2">
        {[...Array(25)].map((_, i) => (
          <View
            key={i}
            className="w-[2px] bg-white"
            style={{ height: Math.random() * 20 + 5 }}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View className="w-3/4 h-1 bg-gray-700 rounded">
        <View
          className="h-1 bg-white rounded"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </Pressable>
  );
}
