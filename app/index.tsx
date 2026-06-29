// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import NowLiveToast from "@/src/components/NowLiveToast";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getPosts } from "@/src/services/postService";
import type {
  AudioPost,
  Category,
  Reactions,
} from "@/src/store/useRecordingStore";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type DbPost = {
  id: string;
  audio_url: string;
  duration?: number;
  views?: number;
  reactions?: Reactions;
  username?: string;
  avatar?: string;
  neighborhood?: string;
  town?: string;
  country?: string;
  category?: Category;
  transcript?: string;
  created_at?: string;
};

function mapDbPostToAudioPost(post: DbPost): AudioPost {
  return {
    id: post.id,
    uri: post.audio_url,
    duration: post.duration,
    views: post.views ?? 0,
    reactions: post.reactions ?? {
      "😂": 0,
      "🚨": 0,
      "👍": 0,
    },
    username: post.username ?? "",
    avatar: post.avatar ?? "",
    neighborhood: post.neighborhood ?? "",
    town: post.town ?? "",
    country: post.country,
    category: post.category ?? "moments",
    timestamp: post.created_at,
    transcript: post.transcript ?? "",
  };
}

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const posts = useRecordingStore((s) => s.posts);
  const setPosts = useRecordingStore((s) => s.setPosts);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const incrementViews = useRecordingStore((s) => s.incrementViews);

  const activePost = posts.find((p) => p.id === activeId);
  const activeTheme = getCategoryTheme(activePost?.category);

  const [showToast, setShowToast] = useState(false);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<any>>(null);

  //console.log("recordings:", posts);

  useEffect(() => {
    async function loadPosts() {
      const posts = await getPosts();
      console.log("Loaded UI posts:", posts);
      setPosts(posts);
    }

    loadPosts();
  }, [setPosts]);

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
        activeRoute="feed"
        accentColor={activeTheme.primary}
        onPressFeed={() => router.push("/")}
        onPressMyVoices={() => router.push("/my-voices")}
        onPressRecord={() => router.push("/record")}
        onPressSaved={() => router.push("/saved")}
      />

      {/* FEEDBACK */}
      <NowLiveToast visible={showToast} onClose={() => setShowToast(false)} />
    </View>
  );
}
