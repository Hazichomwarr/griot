// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import NowLiveToast from "@/src/components/NowLiveToast";
import ReportVoiceModal from "@/src/components/ReportVoiceModal";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { getPosts, reportPost } from "@/src/services/postService";
import type { ReportReason } from "@/src/services/postService";
import type { AudioPost, Category } from "@/src/store/useRecordingStore";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type CategoryFilter = "all" | Category;

type Coordinates = {
  latitude: number;
  longitude: number;
};

async function getCurrentFeedLocation(): Promise<Coordinates | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      console.log("nearby sorting skipped: location unavailable");
      return null;
    }

    const lastKnownLocation = await Location.getLastKnownPositionAsync({
      maxAge: 60_000,
    });

    if (lastKnownLocation) {
      return {
        latitude: lastKnownLocation.coords.latitude,
        longitude: lastKnownLocation.coords.longitude,
      };
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).catch((err) => {
      console.log("nearby sorting location capture failed:", err);
      return null;
    });

    if (!currentLocation) return null;

    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  } catch (err) {
    console.log("nearby sorting skipped:", err);
    return null;
  }
}

export default function App() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const t = getStrings();

  const posts = useRecordingStore((s) => s.posts);
  const setPosts = useRecordingStore((s) => s.setPosts);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);
  const myPostIds = useRecordingStore((s) => s.myPostIds);
  const hasReportedPost = useRecordingStore((s) => s.hasReportedPost);
  const markPostReported = useRecordingStore((s) => s.markPostReported);

  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>("all");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
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
  const [refreshing, setRefreshing] = useState(false);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<AudioPost>>(null);
  const skipNextAutoScrollRef = useRef(false);

  //console.log("recordings:", posts);

  const loadFeedPosts = useCallback(async () => {
    const userLocation = await getCurrentFeedLocation();
    const posts = await getPosts({ userLocation, throwOnError: true });

    console.log("Loaded UI posts:", posts);
    setPosts(posts);
  }, [setPosts]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    skipNextAutoScrollRef.current = true;

    try {
      await loadFeedPosts();
    } catch (err) {
      skipNextAutoScrollRef.current = false;
      console.log("refresh feed error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadFeedPosts, refreshing]);

  const openReport = useCallback(
    (postId: string) => {
      if (myPostIds.includes(postId) || hasReportedPost(postId)) return;

      setReportingPostId(postId);
    },
    [hasReportedPost, myPostIds],
  );

  const closeReport = useCallback(() => {
    if (submittingReport) return;

    setReportingPostId(null);
  }, [submittingReport]);

  const submitReport = useCallback(
    async (reason: ReportReason, details: string) => {
      if (!reportingPostId || submittingReport) return;

      if (myPostIds.includes(reportingPostId)) {
        console.log("Report skipped for own post:", reportingPostId);
        return;
      }

      setSubmittingReport(true);

      try {
        await reportPost({
          postId: reportingPostId,
          reason,
          details,
        });
        markPostReported(reportingPostId);
        Alert.alert(t.report.reportSubmitted);
      } catch (error) {
        console.log("report voice error:", error);
        throw error;
      } finally {
        setSubmittingReport(false);
      }
    },
    [
      markPostReported,
      myPostIds,
      reportingPostId,
      submittingReport,
      t.report.reportSubmitted,
    ],
  );

  useEffect(() => {
    if (sharedNextSoundRef.current) {
      sharedNextSoundRef.current.unloadAsync().catch(() => {});
      sharedNextSoundRef.current = null;
    }
  }, [selectedFilter]);

  useEffect(() => {
    async function loadPosts() {
      try {
        await loadFeedPosts();
      } catch (err) {
        console.log("initial feed load error:", err);
      }
    }

    loadPosts();
  }, [loadFeedPosts]);

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

    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false;
      return;
    }

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
      }
    },
    [setActive],
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
              onReport={
                myPostIds.includes(item.id)
                  ? undefined
                  : () => openReport(item.id)
              }
              reported={hasReportedPost(item.id)}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
      <ReportVoiceModal
        visible={reportingPostId !== null}
        submitting={submittingReport}
        onClose={closeReport}
        onSubmit={submitReport}
      />
    </View>
  );
}
