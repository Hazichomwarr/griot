import React from "react";
import { View } from "react-native";

type Props = {
  size: number;
  accentColor: string;
  progress?: number;
  active?: boolean;
  mutedColor?: string;
};

const BAR_COUNT = 60;
const BAR_WIDTH = 3;

// Static, deterministic geometry: this visual language is not presented as
// an analysis of the recorded audio.
const WAVEFORM_AMPLITUDES = Array.from({ length: BAR_COUNT }, (_, index) => {
  const value =
    0.58 + Math.sin(index * 1.71) * 0.2 + Math.sin(index * 0.47) * 0.14;

  return Math.max(0.28, Math.min(1, value));
});

export default function RadialVoiceWave({
  size,
  accentColor,
  progress = 0,
  active = false,
  mutedColor = "rgba(255,255,255,0.2)",
}: Props) {
  const center = size / 2;
  const ringRadius = size * 0.39;
  const safeProgress = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const highlightedBars = Math.floor(safeProgress * BAR_COUNT);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {WAVEFORM_AMPLITUDES.map((amplitude, index) => {
        const angle = (index / BAR_COUNT) * 360;
        const radians = (angle * Math.PI) / 180;
        const length = 9 + amplitude * 24;
        const x = center + Math.cos(radians) * ringRadius;
        const y = center + Math.sin(radians) * ringRadius;
        const highlighted = active ? index < Math.max(1, highlightedBars) : index < highlightedBars;

        return (
          <View
            key={index}
            className="absolute"
            style={{
              width: BAR_WIDTH,
              height: length,
              left: x - BAR_WIDTH / 2,
              top: y - length / 2,
              borderRadius: BAR_WIDTH,
              backgroundColor: highlighted ? accentColor : mutedColor,
              transform: [{ rotate: `${angle + 90}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}
