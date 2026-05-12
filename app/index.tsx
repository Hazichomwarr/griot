// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import NowLiveToast from "@/src/components/NowLiveToast";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const posts = useRecordingStore((s) => s.posts);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const incrementViews = useRecordingStore((s) => s.incrementViews);

  const isSavedFn = useRecordingStore((s) => s.isSaved);
  const toggleSaveFn = useRecordingStore((s) => s.toggleSave);

  const activePost = posts.find((p) => p.id === activeId);
  const isSaved = activeId ? isSavedFn(activeId) : false;

  const [showToast, setShowToast] = useState(false);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<any>>(null);

  //console.log("recordings:", posts);

  // AutoPlay when app opens
  useEffect(() => {
    if (posts.length > 0 && !activeId) {
      setActive(posts[0].id);
    }
  }, [posts]);

  // Auto Scroll to next Audio
  useEffect(() => {
    if (!activeId) return;

    const index = posts.findIndex((p) => p.id === activeId);
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
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={posts[index + 1]}
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
      <FloatingMic
        onPressRecord={() => router.push("/record")}
        onPressVoices={() => router.push("/saved")}
        onToggleSave={() => activePost && toggleSaveFn(activePost.id)}
        isSaved={isSaved}
      />

      {/* FEEDBACK */}
      <NowLiveToast visible={showToast} onClose={() => setShowToast(false)} />
    </View>
  );
}
