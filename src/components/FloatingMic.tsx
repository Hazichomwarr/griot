// src/components/FloatingMic.tsx

import { getStrings } from "@/src/lib/i18n/strings";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export const FLOATING_NAV_BAR_HEIGHT = 64;
export const FLOATING_NAV_BOTTOM_OFFSET = 6;
export const FLOATING_NAV_CENTER_RAISE = 18;
export const FLOATING_NAV_CONTENT_BREATHING_ROOM = 16;

export function getFloatingNavContentInset(bottomSafeAreaInset: number) {
  return (
    bottomSafeAreaInset +
    FLOATING_NAV_BOTTOM_OFFSET +
    FLOATING_NAV_BAR_HEIGHT +
    FLOATING_NAV_CENTER_RAISE +
    FLOATING_NAV_CONTENT_BREATHING_ROOM
  );
}

type Props = {
  activeRoute: "feed" | "myVoices" | "record" | "saved";
  showRecordLabel?: boolean;
  accentColor?: string;
  onPressFeed: () => void;
  onPressMyVoices: () => void;
  onPressRecord: () => void;
  onPressSaved: () => void;
};

export default function FloatingMic({
  activeRoute,
  showRecordLabel = false,
  accentColor = "#E6B566",
  onPressFeed,
  onPressMyVoices,
  onPressRecord,
  onPressSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const t = getStrings();
  const isCompact = SCREEN_WIDTH < 390;
  const sideItemWidth = 58;
  const micSlotWidth = isCompact ? 66 : 74;
  const micSize = isCompact ? 54 : 58;
  const isRecordActive = activeRoute === "record";

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
      style={{ paddingBottom: insets.bottom + FLOATING_NAV_BOTTOM_OFFSET }}
    >
      <View
        className="rounded-[28px] border border-white/15 bg-black/75 flex-row items-center justify-between"
        style={{
          width: "90%",
          height: FLOATING_NAV_BAR_HEIGHT,
          paddingHorizontal: isCompact ? 8 : 18,
        }}
      >
        <Pressable
          onPress={onPressFeed}
          className="items-center"
          style={{ width: sideItemWidth, height: 52, justifyContent: "center" }}
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
          style={{ width: sideItemWidth, height: 52, justifyContent: "center" }}
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

        <View className="items-center" style={{ width: micSlotWidth, height: FLOATING_NAV_BAR_HEIGHT }}>
          <Animated.View
            className="absolute rounded-full items-center"
            style={[
              glowStyle,
              {
                width: micSize,
                height: micSize,
                backgroundColor: `${accentColor}24`,
                top: -FLOATING_NAV_CENTER_RAISE,
              },
            ]}
          />

          <Animated.View style={[animatedStyle, { position: "absolute", top: -FLOATING_NAV_CENTER_RAISE }]}>
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
              <MaterialCommunityIcons name="microphone" size={27} color="#16110A" />
            </Pressable>
          </Animated.View>
          {showRecordLabel || isRecordActive ? (
            <Text className="absolute text-xs" style={{ color: accentColor, top: 44 }}>
              {t.floatingMic.record}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onPressSaved}
          className="items-center"
          style={{ width: sideItemWidth, height: 52, justifyContent: "center" }}
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
