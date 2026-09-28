import type { Category } from "@/src/store/useRecordingStore";
import React from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

// Keep these as null until the corresponding local files are supplied:
// - assets/backgrounds/griot-contes.jpg
// - assets/backgrounds/griot-around-you.jpg
//
// Once present, replace each null with a static require so Metro bundles the
// files, for example: require("../../assets/backgrounds/griot-contes.jpg").
const BACKGROUND_ASSETS: Record<Category, ImageSourcePropType | null> = {
  around_you: null,
  contes: null,
};

function VoiceAtmosphere({ category }: { category: Category }) {
  const isNearby = category === "around_you";
  const deep = isNearby ? "#061522" : "#1A1105";
  const categoryTint = isNearby ? "rgba(24, 105, 128, 0.13)" : "rgba(185, 107, 20, 0.13)";
  const source = BACKGROUND_ASSETS[category];

  return (
    <View pointerEvents="none" className="absolute inset-0" style={{ backgroundColor: deep }}>
      {source ? <Image source={source} resizeMode="cover" style={StyleSheet.absoluteFill} /> : null}
      <View className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.54)" }} />
      <View
        className="absolute left-0 right-0 top-0"
        style={{ height: "32%", backgroundColor: "rgba(0,0,0,0.34)" }}
      />
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: "38%", backgroundColor: "rgba(0,0,0,0.55)" }}
      />
      <View className="absolute inset-0" style={{ backgroundColor: categoryTint }} />
    </View>
  );
}

export default React.memo(VoiceAtmosphere);
