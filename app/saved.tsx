import AudioCard from "@/src/components/AudioCard";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Saved() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const recordings = useRecordingStore((s) => s.recordings);
  const savedIds = useRecordingStore((s) => s.saved);

  const savedRecordings = recordings.filter((r) => savedIds.includes(r.id));

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);

  // Stop all feed audio when entering record screen
  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);
  useEffect(() => {
    triggerStopAllAudio();
  }, []);

  if (savedRecordings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white opacity-60">No saved voices yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={savedRecordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={savedRecordings[index + 1]}
            sharedNextSoundRef={sharedNextSoundRef}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: usableHeight,
          offset: usableHeight * index,
          index,
        })}
      />
    </View>
  );
}
