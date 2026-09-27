import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import RadialVoiceWave from "./RadialVoiceWave";

type Props = {
  progress: number;
  playing: boolean;
  accentColor: string;
  onToggle: () => void;
  accessibilityLabel: string;
};

export default function CircularAudioProgress({
  progress,
  playing,
  accentColor,
  onToggle,
  accessibilityLabel,
}: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(264, Math.max(240, width - 112));

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <View
        pointerEvents="none"
        className="absolute rounded-full"
        style={{
          width: size * 0.58,
          height: size * 0.58,
          backgroundColor: `${accentColor}12`,
          shadowColor: accentColor,
          shadowOpacity: playing ? 0.42 : 0.2,
          shadowRadius: playing ? 24 : 14,
        }}
      />

      <RadialVoiceWave size={size} accentColor={accentColor} progress={progress} />

      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: playing }}
        className="absolute rounded-full border items-center justify-center"
        style={{
          width: size * 0.49,
          height: size * 0.49,
          borderColor: `${accentColor}CC`,
          backgroundColor: "rgba(5, 7, 12, 0.8)",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: playing ? 40 : 38, marginLeft: playing ? 0 : 5 }}>
          {playing ? "Ⅱ" : "▶"}
        </Text>
      </Pressable>
    </View>
  );
}
