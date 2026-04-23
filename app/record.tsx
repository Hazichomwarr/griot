// app/record.tsx
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Record() {
  const addRecording = useRecordingStore((s) => s.addRecording);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setRecording(null);

    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      addRecording(uri);
    }
  }

  async function playSound() {
    if (sound) {
      await sound.replayAsync();
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white gap-4">
      <Text className="text-2xl font-bold">Record Voice</Text>

      <Pressable
        onPress={recording ? stopRecording : startRecording}
        className="bg-black px-6 py-3 rounded"
      >
        <Text className="text-white">
          {recording ? "Stop Recording" : "Start Recording"}
        </Text>
      </Pressable>

      <Pressable onPress={playSound} className="bg-gray-700 px-6 py-3 rounded">
        <Text className="text-white">Play Recording</Text>
      </Pressable>
    </View>
  );
}
