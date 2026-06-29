import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Saved() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const t = getStrings();

  const posts = useRecordingStore((s) => s.posts);
  const savedIds = useRecordingStore((s) => s.saved);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const savedPosts = posts.filter((r) => savedIds.includes(r.id));
  const activePost = savedPosts.find((post) => post.id === activeId);
  const activeTheme = getCategoryTheme(activePost?.category);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const item = viewableItems[0]?.item;
    if (item?.id) {
      setActive(item.id);
    }
  });
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });

  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);
  useEffect(() => {
    triggerStopAllAudio();
  }, []);

  useEffect(() => {
    if (savedPosts.length > 0 && !activePost) {
      setActive(savedPosts[0].id);
    }
  }, [savedPosts, activePost]);

  if (savedPosts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg font-semibold">
          {t.saved.emptyTitle}
        </Text>
        <Text className="text-white/60 text-center mt-2 px-8">
          {t.saved.emptyBody}
        </Text>
        <FloatingMic
          activeRoute="saved"
          accentColor={activeTheme.primary}
          onPressFeed={() => router.push("/")}
          onPressMyVoices={() => router.push("/my-voices")}
          onPressRecord={() => router.push("/record")}
          onPressSaved={() => router.push("/saved")}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={savedPosts[index + 1]}
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
      <FloatingMic
        activeRoute="saved"
        accentColor={activeTheme.primary}
        onPressFeed={() => router.push("/")}
        onPressMyVoices={() => router.push("/my-voices")}
        onPressRecord={() => router.push("/record")}
        onPressSaved={() => router.push("/saved")}
      />
    </View>
  );
}
