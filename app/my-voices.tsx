import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { deletePost } from "@/src/services/postService";
import type { AudioPost } from "@/src/store/useRecordingStore";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Platform, Text, View } from "react-native";
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
  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);
  const removePost = useRecordingStore((s) => s.removePost);

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const myPosts = useMemo(
    () => posts.filter((post) => myPostIds.includes(post.id)),
    [posts, myPostIds],
  );
  const activePost = myPosts.find((post) => post.id === activeId);
  const activeTheme = getCategoryTheme(activePost?.category);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item?: AudioPost }[] }) => {
      const item = viewableItems[0]?.item;
      if (item?.id) {
        setActive(item.id);
      }
    },
    [setActive],
  );
  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 80 }),
    [],
  );

  useEffect(() => {
    triggerStopAllAudio();
  }, [triggerStopAllAudio]);

  useEffect(() => {
    if (myPosts.length > 0 && !activePost) {
      setActive(myPosts[0].id);
    }
  }, [myPosts, activePost, setActive]);

  const handleDelete = useCallback(
    async (postId: string) => {
      if (deletingPostId) return;

      if (!myPostIds.includes(postId)) {
        console.log("Delete skipped for non-owned post:", postId);
        Alert.alert(t.myVoices.deleteVoiceError);
        return;
      }

      setDeletingPostId(postId);

      try {
        if (activeId === postId) {
          triggerStopAllAudio();
        }

        await deletePost(postId);
        await removePost(postId);
      } catch (error) {
        console.log("delete voice error:", error);
        Alert.alert(t.myVoices.deleteVoiceError);
      } finally {
        setDeletingPostId(null);
      }
    },
    [
      activeId,
      deletingPostId,
      myPostIds,
      removePost,
      t.myVoices.deleteVoiceError,
      triggerStopAllAudio,
    ],
  );

  const confirmDelete = useCallback(
    (postId: string) => {
      if (deletingPostId) return;

      console.log("Delete voice requested:", postId);

      if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
        const confirmed = globalThis.confirm(
          `${t.myVoices.deleteVoiceTitle}\n\n${t.myVoices.deleteVoiceMessage}`,
        );

        if (confirmed) {
          void handleDelete(postId);
        }

        return;
      }

      Alert.alert(t.myVoices.deleteVoiceTitle, t.myVoices.deleteVoiceMessage, [
        {
          text: t.actions.cancel,
          style: "cancel",
        },
        {
          text: t.actions.delete,
          style: "destructive",
          onPress: () => {
            void handleDelete(postId);
          },
        },
      ]);
    },
    [
      deletingPostId,
      handleDelete,
      t.actions.cancel,
      t.actions.delete,
      t.myVoices.deleteVoiceMessage,
      t.myVoices.deleteVoiceTitle,
    ],
  );

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
          activeRoute="myVoices"
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
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AudioCard
            item={item}
            nextItem={myPosts[index + 1]}
            sharedNextSoundRef={sharedNextSoundRef}
            onDelete={() => confirmDelete(item.id)}
            deleting={deletingPostId === item.id}
          />
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: usableHeight,
          offset: usableHeight * index,
          index,
        })}
      />
      <FloatingMic
        activeRoute="myVoices"
        accentColor={activeTheme.primary}
        onPressFeed={() => router.push("/")}
        onPressMyVoices={() => router.push("/my-voices")}
        onPressRecord={() => router.push("/record")}
        onPressSaved={() => router.push("/saved")}
      />
    </View>
  );
}
