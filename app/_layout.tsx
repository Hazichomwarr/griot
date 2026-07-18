import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-url-polyfill/auto";
import { useRecordingStore } from "../src/store/useRecordingStore";
import "../global.css";

export default function RootLayout() {
  const hydrateSaved = useRecordingStore((s) => s.hydrateSaved);

  useEffect(() => {
    void hydrateSaved();
  }, [hydrateSaved]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
