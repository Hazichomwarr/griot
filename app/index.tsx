// app/index.tsx
import AudioCard from "@/src/components/AudioCard";
import { useRecordingStore } from "@/src/store/useRecordingStore";
import { router } from "expo-router";
import { useRef } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";

export default function App() {
  const recordings = useRecordingStore((s) => s.recordings);
  const setActive = useRecordingStore((s) => s.setActive);

  console.log("recordings:", recordings);
  const { height } = Dimensions.get("window");

  // async function play(uri: string) {
  //   const { sound } = await Audio.Sound.createAsync({ uri });
  //   await sound.replayAsync();

  //   // cleanup after playback
  //   sound.setOnPlaybackStatusUpdate((status) => {
  //     if (status.isLoaded && status.didJustFinish) {
  //       sound.unloadAsync();
  //     }
  //   });
  // }
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActive(viewableItems[0].item.id);
    }
  });
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  return (
    <View>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioCard item={item} />}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
      <Pressable
        onPress={() => router.push("/record")}
        className="mt-4 bg-black px-4 py-2 rounded"
      >
        <Text className="text-white">Go to Record</Text>
      </Pressable>
    </View>
  );
}
