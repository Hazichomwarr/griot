// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import NowLiveToast from "@/src/components/NowLiveToast";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const recordings = useRecordingStore((s) => s.recordings);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);
  const incrementViews = useRecordingStore((s) => s.incrementViews);

  const [showToast, setShowToast] = useState(false);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<any>>(null);

  console.log("recordings:", recordings);

  // AutoPlay when app opens
  useEffect(() => {
    if (recordings.length > 0 && !activeId) {
      setActive(recordings[0].id);
    }
  }, [recordings]);

  // Auto Scroll to next Audio
  useEffect(() => {
    if (!activeId) return;

    const index = recordings.findIndex((r) => r.id === activeId);
    if (index === -1) return;

    setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true });
    }, 50); //slight delay to wait for Flatlist
  }, [activeId]);

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
        ref={listRef}
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={recordings[index + 1]}
            sharedNextSoundRef={sharedNextSoundRef}
          />
        )}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
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

      {/* FLOATING SYSTEM */}
      {/* <Pressable
        onPress={() => router.push("/record")}
        className="absolute top-2 self-center bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20"
      >
        <Text className="text-white text-xl p-2 rounded-xl">🎤 Record</Text>
      </Pressable> */}
      <FloatingMic />

      {/* FEEDBACK */}
      <NowLiveToast visible={showToast} onClose={() => setShowToast(false)} />
    </View>
  );
}
