// components/VoiceFragment.tsx
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function VoiceFragment({ voice }: { voice: any }) {
  const { text, meta, x, y } = voice;
  const glow = useSharedValue(0.6);

  glow.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + glow.value * 0.2 }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        // TODO: start playback
      }}
      onPressOut={() => {
        // TODO: stop playback
      }}
      style={{
        position: "absolute",
        left: x,
        top: y,
      }}
    >
      <Animated.View
        style={[
          {
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: "#f5d6a3",
            marginBottom: 6,
          },
          animatedStyle,
        ]}
      />

      <View style={{ maxWidth: 200 }}>
        <Text style={{ color: "#f5e6c8", fontSize: 16 }}>“{text}”</Text>
        <Text style={{ color: "#c2a97a", fontSize: 12 }}>{meta}</Text>
      </View>
    </Pressable>
  );
}
