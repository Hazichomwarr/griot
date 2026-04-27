// src/components/FloatingMic.tsx

import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingMic() {
  const insets = useSafeAreaInsets();

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
      {/* NAV */}
      <View className="w-full flex-row justify-between px-10 mb-2">
        <Text className="text-yellow-400 text-xs">Voices</Text>
        <Text className="text-white text-xs opacity-60">Saved</Text>
      </View>

      {/* GLOW LAYER */}
      <Animated.View
        style={glowStyle}
        className="absolute w-20 h-20 rounded-full bg-yellow-400/10"
      />

      {/* MAIN MIC */}
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            scale.value = withSpring(1.05);
          }}
          onPress={() => router.push("/record")}
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{
            backgroundColor: "#E6B566",
            shadowColor: "#E6B566",
            shadowOpacity: 0.9,
            shadowRadius: 25,
            elevation: 12,
          }}
        >
          <Text className="text-black text-2xl">🎤</Text>
        </Pressable>
      </Animated.View>

      {/* LABEL */}
      <Text className="text-yellow-400 mt-2 text-sm">Share your voice</Text>
    </View>
  );
}
