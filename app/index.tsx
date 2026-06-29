// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import NowLiveToast from "@/src/components/NowLiveToast";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { getPosts } from "@/src/services/postService";
import type { AudioPost, Category } from "@/src/store/useRecordingStore";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type CategoryFilter = "all" | Category;

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const t = getStrings();

  const posts = useRecordingStore((s) => s.posts);
  const setPosts = useRecordingStore((s) => s.setPosts);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const incrementViews = useRecordingStore((s) => s.incrementViews);

  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>("all");
  const filteredPosts = useMemo(
    () =>
      selectedFilter === "all"
        ? posts
        : posts.filter((post) => post.category === selectedFilter),
    [posts, selectedFilter],
  );
  const activePost = filteredPosts.find((p) => p.id === activeId);
  const activeTheme = getCategoryTheme(activePost?.category);
  const filterOptions: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: t.categories.all },
    { key: "moments", label: t.categories.moments },
    { key: "around_you", label: t.categories.aroundYou },
  ];

  const [showToast, setShowToast] = useState(false);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<AudioPost>>(null);

  //console.log("recordings:", posts);

  useEffect(() => {
    if (sharedNextSoundRef.current) {
      sharedNextSoundRef.current.unloadAsync().catch(() => {});
      sharedNextSoundRef.current = null;
    }
  }, [selectedFilter]);

  useEffect(() => {
    async function loadPosts() {
      const posts = await getPosts();
      console.log("Loaded UI posts:", posts);
      setPosts(posts);
    }

    loadPosts();
  }, [setPosts]);

  // AutoPlay when app opens or filter changes
  useEffect(() => {
    if (filteredPosts.length === 0) return;

    const activePostIsVisible = filteredPosts.some(
      (post) => post.id === activeId,
    );

    if (!activePostIsVisible) {
      setActive(filteredPosts[0].id);
    }
  }, [filteredPosts, activeId, setActive]);

  // Auto Scroll to next Audio
  useEffect(() => {
    if (!activeId) return;

    const index = filteredPosts.findIndex((p) => p.id === activeId);
    if (index === -1) return;

    const scrollTimeout = setTimeout(() => {
      if (index >= filteredPosts.length) return;

      listRef.current?.scrollToIndex({ index, animated: true });
    }, 50); //slight delay to wait for Flatlist

    return () => clearTimeout(scrollTimeout);
  }, [activeId, filteredPosts]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item?: AudioPost }[] }) => {
      if (!viewableItems.length) return;

      const item = viewableItems[0]?.item;
      if (item?.id) {
        setActive(item.id);
        incrementViews(item.id);
      }
    },
    [incrementViews, setActive],
  );
  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 80 }),
    [],
  );
  return (
    <View className="flex-1">
      {filteredPosts.length > 0 ? (
        <FlatList<AudioPost>
          ref={listRef}
          data={filteredPosts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <AudioCard
              item={item}
              nextItem={filteredPosts[index + 1]}
              sharedNextSoundRef={sharedNextSoundRef}
              showCategoryHeader={false}
            />
          )}
          onScrollToIndexFailed={(info) => {
            if (info.index >= filteredPosts.length) return;

            setTimeout(() => {
              if (info.index >= filteredPosts.length) return;

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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: usableHeight,
            offset: usableHeight * index,
            index,
          })}
        />
      ) : (
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-white text-2xl font-semibold text-center">
            {t.feed.emptyTitle}
          </Text>
          <Text className="text-white/65 text-base text-center mt-3">
            {t.feed.emptyBody}
          </Text>
        </View>
      )}

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center z-40"
        style={{ top: insets.top + 44 }}
      >
        <View className="flex-row rounded-full bg-black/45 border border-white/10 p-1">
          {filterOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSelectedFilter(option.key)}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor:
                  selectedFilter === option.key
                    ? activeTheme.primary
                    : "transparent",
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: selectedFilter === option.key ? "#000000" : "#FFFFFF",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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
