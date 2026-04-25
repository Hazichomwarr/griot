// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useRef } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const recordings = useRecordingStore((s) => s.recordings);
  const setActive = useRecordingStore((s) => s.setActive);
  const incrementViews = useRecordingStore((s) => s.incrementViews);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);

  console.log("recordings:", recordings);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!viewableItems.length) return;

    const item = viewableItems[0]?.item;
    if (item?.id) {
      setActive(item.id);
      incrementViews(item.id);
    }
  });
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  return (
    <View className="flex-1">
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={recordings[index + 1]}
            sharedNextSoundRef={sharedNextSoundRef}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({
          length: usableHeight,
          offset: usableHeight * index,
          index,
        })}
      />
      <Pressable
        onPress={() => router.push("/record")}
        className="absolute top-2 self-center bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20"
      >
        <Text className="text-white text-xl p-2 rounded-xl">🎤 Record</Text>
      </Pressable>
    </View>
  );
}
