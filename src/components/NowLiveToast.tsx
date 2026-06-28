// src/components/NowLiveToast.tsx

import { getStrings } from "@/src/lib/i18n/strings";
import { Pressable, Text, View } from "react-native";

export default function NowLiveToast({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = getStrings();

  if (!visible) return null;

  return (
    <View className="absolute bottom-28 self-center bg-black/80 px-5 py-3 rounded-xl flex-row items-center">
      <Text className="text-yellow-400 mr-2">✨</Text>

      <Text className="text-white">
        {t.toast.voiceIsNowPartOf}{" "}
        <Text className="text-yellow-400">{t.toast.place}</Text>
      </Text>

      <Pressable
        onPress={onClose}
        className="ml-3"
        accessibilityLabel={t.toast.close}
      >
        <Text className="text-white">✕</Text>
      </Pressable>
    </View>
  );
}
