// src/components/NowLiveToast.tsx

import { Pressable, Text, View } from "react-native";

export default function NowLiveToast({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <View className="absolute bottom-28 self-center bg-black/80 px-5 py-3 rounded-xl flex-row items-center">
      <Text className="text-yellow-400 mr-2">✨</Text>

      <Text className="text-white">
        Your voice is now part of{" "}
        <Text className="text-yellow-400">Hoboken</Text>
      </Text>

      <Pressable onPress={onClose} className="ml-3">
        <Text className="text-white">✕</Text>
      </Pressable>
    </View>
  );
}
