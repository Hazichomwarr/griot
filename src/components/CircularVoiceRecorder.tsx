import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import RadialVoiceWave from "./RadialVoiceWave";

type Props = {
  size: number;
  state: "idle" | "recording" | "preview";
  playing?: boolean;
  progress?: number;
  primaryLabel: string;
  secondaryLabel?: string;
  elapsedLabel?: string;
};

export default function CircularVoiceRecorder({
  size,
  state,
  playing = false,
  progress = 0,
  primaryLabel,
  secondaryLabel,
  elapsedLabel,
}: Props) {
  const isRecording = state === "recording";
  const isPreview = state === "preview";
  const centerSize = size * 0.55;
  const iconName = isPreview ? (playing ? "pause" : "play") : "microphone-outline";

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <View
        pointerEvents="none"
        className="absolute rounded-full"
        style={{
          width: size * 0.64,
          height: size * 0.64,
          backgroundColor: "rgba(235,172,53,0.10)",
          shadowColor: "#F5B820",
          shadowOpacity: isRecording ? 0.42 : 0.2,
          shadowRadius: isRecording ? 24 : 14,
        }}
      />
      <RadialVoiceWave
        size={size}
        accentColor="#F5B820"
        progress={progress}
        active={isRecording}
        mutedColor={isRecording ? "rgba(255,255,255,0.29)" : "rgba(255,255,255,0.22)"}
      />
      <View
        className="rounded-full border items-center justify-center"
        style={{
          width: centerSize,
          height: centerSize,
          borderColor: isRecording ? "#FFD25B" : "rgba(245,184,32,0.82)",
          backgroundColor: "rgba(5,7,12,0.82)",
        }}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={isPreview ? 42 : 48}
          color="#FFFFFF"
          style={{ marginLeft: isPreview && !playing ? 4 : 0 }}
        />
        <Text className="text-white/75 text-base font-medium" style={{ marginTop: 10 }}>
          {primaryLabel}
        </Text>
        {secondaryLabel ? (
          <Text className="text-white/45 text-xs" style={{ marginTop: 5 }}>
            {secondaryLabel}
          </Text>
        ) : null}
      </View>
      {elapsedLabel ? (
        <Text className="absolute text-white/90 text-lg font-medium" style={{ bottom: -26 }}>
          {elapsedLabel}
        </Text>
      ) : null}
    </View>
  );
}
