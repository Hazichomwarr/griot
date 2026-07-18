import AudioCard from "@/src/components/AudioCard";
import FloatingMic from "@/src/components/FloatingMic";
import ReportVoiceModal from "@/src/components/ReportVoiceModal";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { getStrings } from "@/src/lib/i18n/strings";
import { reportPost } from "@/src/services/postService";
import type { ReportReason } from "@/src/services/postService";
import type { AudioPost } from "@/src/store/useRecordingStore";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Saved() {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const t = getStrings();

  const posts = useRecordingStore((s) => s.posts);
  const savedIds = useRecordingStore((s) => s.saved);
  const savedHydrated = useRecordingStore((s) => s.savedHydrated);
  const savedHydrating = useRecordingStore((s) => s.savedHydrating);
  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);
  const myPostIds = useRecordingStore((s) => s.myPostIds);
  const hasReportedPost = useRecordingStore((s) => s.hasReportedPost);
  const markPostReported = useRecordingStore((s) => s.markPostReported);

  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  const savedPosts = useMemo(
    () => posts.filter((r) => savedIds.includes(r.id)),
    [posts, savedIds],
  );
  const activePost = savedPosts.find((post) => post.id === activeId);
  const activeTheme = getCategoryTheme(activePost?.category);

  const sharedNextSoundRef = useRef<Audio.Sound | null>(null);
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item?: AudioPost }[] }) => {
      const item = viewableItems[0]?.item;
      if (item?.id && item.id !== useRecordingStore.getState().activeId) {
        setActive(item.id);
      }
    },
    [setActive],
  );
  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 80 }),
    [],
  );

  const triggerStopAllAudio = useRecordingStore((s) => s.triggerStopAllAudio);
  useEffect(() => {
    triggerStopAllAudio();
  }, [triggerStopAllAudio]);

  useEffect(() => {
    const desiredId = savedPosts[0]?.id;

    if (desiredId && desiredId !== activeId && !activePost) {
      setActive(desiredId);
    }
  }, [savedPosts, activeId, activePost, setActive]);

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

  if (
    !savedHydrated ||
    savedHydrating ||
    (savedIds.length > 0 && posts.length === 0)
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white/70 text-base">{t.saved.loading}</Text>
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
            onReport={
              myPostIds.includes(item.id) ? undefined : () => openReport(item.id)
            }
            reported={hasReportedPost(item.id)}
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
        activeRoute="saved"
        accentColor={activeTheme.primary}
        onPressFeed={() => router.push("/")}
        onPressMyVoices={() => router.push("/my-voices")}
        onPressRecord={() => router.push("/record")}
        onPressSaved={() => router.push("/saved")}
      />
      <ReportVoiceModal
        visible={reportingPostId !== null}
        submitting={submittingReport}
        onClose={closeReport}
        onSubmit={submitReport}
      />
    </View>
  );
}
