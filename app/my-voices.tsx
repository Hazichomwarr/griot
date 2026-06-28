import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import { getStrings } from "@/src/lib/i18n/strings";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function MyVoices() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const t = getStrings();

  const posts = useRecordingStore((s) => s.posts);
  const myPostIds = useRecordingStore((s) => s.myPostIds);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);
  const toggleSave = useRecordingStore((s) => s.toggleSave);
  const isSavedFn = useRecordingStore((s) => s.isSaved);
  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);

  const myPosts = posts.filter((post) => myPostIds.includes(post.id));
  const activePost = myPosts.find((post) => post.id === activeId);
  const isSaved = activePost ? isSavedFn(activePost.id) : false;

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const item = viewableItems[0]?.item;
    if (item?.id) {
      setActive(item.id);
    }
  });
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });

  useEffect(() => {
    triggerStopAllAudio();
  }, []);

  useEffect(() => {
    if (myPosts.length > 0 && !activePost) {
      setActive(myPosts[0].id);
    }
  }, [myPosts, activePost]);

  if (myPosts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg font-semibold">
          {t.myVoices.emptyTitle}
        </Text>
        <Text className="text-white/60 text-center mt-2 px-8">
          {t.myVoices.emptyBody}
        </Text>
        <FloatingMic
          onPressRecord={() => router.push("/record")}
          onPressVoices={() => router.push("/")}
          onToggleSave={() => {}}
          isSaved={false}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={myPosts[index + 1]}
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
        onPressRecord={() => router.push("/record")}
        onPressVoices={() => router.push("/")}
        onToggleSave={() => activePost && toggleSave(activePost.id)}
        isSaved={isSaved}
      />
    </View>
  );
}
