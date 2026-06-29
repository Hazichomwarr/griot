// src/components/FloatingMic.tsx

import { getStrings } from "@/src/lib/i18n/strings";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  activeRoute: "feed" | "myVoices" | "saved";
  accentColor?: string;
  onPressFeed: () => void;
  onPressMyVoices: () => void;
  onPressRecord: () => void;
  onPressSaved: () => void;
};

export default function FloatingMic({
  activeRoute,
  accentColor = "#E6B566",
  onPressFeed,
  onPressMyVoices,
  onPressRecord,
  onPressSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const t = getStrings();
  const isCompact = SCREEN_WIDTH < 390;
  const sideItemWidth = 64;
  const micSlotWidth = isCompact ? 78 : 96;
  const micSize = isCompact ? 64 : 80;

  const scale = useSharedValue(1);
  const glow = useSharedValue(0.7);

  // 🫀 breathing loop
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.03, { duration: 2200 }), -1, true);

    glow.value = withRepeat(withTiming(0.9, { duration: 2200 }), -1, true);
  }, []);

  // 🎨 animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale.value * 1.1 }],
  }));

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 items-center z-50"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      <View
        className="rounded-[28px] border border-white/15 bg-black/75 flex-row items-center justify-between"
        style={{
          width: "92%",
          paddingHorizontal: isCompact ? 10 : 32,
          paddingVertical: isCompact ? 10 : 12,
        }}
      >
        <Pressable
          onPress={onPressFeed}
          className="items-center"
          style={{ width: sideItemWidth }}
        >
          <Text
            className="text-xl"
            style={{ color: activeRoute === "feed" ? accentColor : "#8A8A8A" }}
          >
            ⌂
          </Text>
          <Text
            className="text-xs mt-1"
            style={{ color: activeRoute === "feed" ? accentColor : "#B8B8B8" }}
          >
            {t.floatingMic.feed}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPressMyVoices}
          className="items-center"
          style={{ width: sideItemWidth }}
        >
          <Text
            className="text-xl"
            style={{
              color: activeRoute === "myVoices" ? accentColor : "#8A8A8A",
            }}
          >
            ●
          </Text>
          <Text
            className="text-xs mt-1"
            style={{
              color: activeRoute === "myVoices" ? accentColor : "#B8B8B8",
            }}
          >
            {t.floatingMic.myVoices}
          </Text>
        </Pressable>

        <View className="items-center" style={{ width: micSlotWidth }}>
          <Animated.View
            className="absolute rounded-full"
            style={[
              glowStyle,
              {
                width: micSize,
                height: micSize,
                backgroundColor: `${accentColor}24`,
              },
            ]}
          />

          <Animated.View style={animatedStyle}>
            <Pressable
              onPressIn={() => {
                scale.value = withSpring(0.9);
              }}
              onPressOut={() => {
                scale.value = withSpring(1.05);
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPressRecord();
              }}
              className="rounded-full items-center justify-center"
              style={{
                width: micSize,
                height: micSize,
                backgroundColor: accentColor,
                shadowColor: accentColor,
                shadowOpacity: 0.9,
                shadowRadius: 25,
                elevation: 12,
              }}
            >
              <Text className="text-black text-2xl">🎤</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Pressable
          onPress={onPressSaved}
          className="items-center"
          style={{ width: sideItemWidth }}
        >
          <Text
            className="text-xl"
            style={{
              color: activeRoute === "saved" ? accentColor : "#8A8A8A",
            }}
          >
            ▰
          </Text>
          <Text
            className="text-xs mt-1"
            style={{
              color: activeRoute === "saved" ? accentColor : "#B8B8B8",
            }}
          >
            {t.floatingMic.saved}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
