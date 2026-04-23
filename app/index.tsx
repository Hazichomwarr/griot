// app/index.tsx
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function App() {
  const recordings = useRecordingStore((s) => s.recordings);
  console.log("recordings:", recordings);

  async function play(uri: string) {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.replayAsync();

    // cleanup after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  }
  return (
    <View className="flex-1 bg-white p-4">
      {recordings.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => play(item.uri)}
          className="bg-black p-4 rounded mb-3"
        >
          <Text className="text-white font-bold">Play Recording</Text>

          {/* Waveform */}
          <View className="flex-row gap-[2px] mt-2">
            {[...Array(25)].map((_, i) => (
              <View
                key={i}
                className="w-[2px] bg-white"
                style={{ height: Math.random() * 20 + 5 }}
              />
            ))}
          </View>
        </Pressable>
      ))}
      <Pressable
        onPress={() => router.push("/record")}
        className="mt-4 bg-black px-4 py-2 rounded"
      >
        <Text className="text-white">Go to Record</Text>
      </Pressable>
    </View>
  );
}
