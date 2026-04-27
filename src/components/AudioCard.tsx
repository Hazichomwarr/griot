// // src/components/AudioCard.tsx
// import { safeAudioCleanup } from "@/lib/safeAudioCleanup";
// import { Audio } from "expo-av";
// import React, { useEffect, useRef, useState } from "react";
// import { Dimensions, Pressable, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   AudioPost,
//   Category,
//   Reactions,
//   useRecordingStore,
// } from "../store/useRecordingStore";

// const categoryMap: Record<Category, string> = {
//   social: "😂",
//   security: "🚨",
//   vente: "🛒",
// };
// const bgMap = {
//   social: "bg-black",
//   security: "bg-red-900/20",
//   vente: "bg-green-900/20",
// };

// type Props = {
//   item: AudioPost;
//   nextItem?: AudioPost;
//   sharedNextSoundRef: React.MutableRefObject<Audio.Sound | null>;
// };

// const emojis: (keyof Reactions)[] = ["😂", "🚨", "👍"];

// const SCREEN_HEIGHT = Dimensions.get("window").height;

// export default function AudioCard({
//   item,
//   nextItem,
//   sharedNextSoundRef,
// }: Props) {
//   const insets = useSafeAreaInsets();
//   const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

//   const stopAllAudioFlag = useRecordingStore((s) => s.stopAllAudioFlag);
//   useEffect(() => {
//     if (soundRef.current) {
//       safeAudioCleanup(soundRef.current);
//       soundRef.current = null;
//     }
//   }, [stopAllAudioFlag]);

//   const setActive = useRecordingStore((s) => s.setActive);
//   const activeId = useRecordingStore((s) => s.activeId);
//   const addReaction = useRecordingStore((s) => s.addReaction);

//   const soundRef = useRef<Audio.Sound | null>(null);
//   const nextSoundRef = sharedNextSoundRef; //for preloading

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progress, setProgress] = useState(0);

// async function handlePlayback() {
//   try {
//     // 👉 ACTIVE CARD
//     if (activeId === item.id) {
//       // 🎧 PLAY CURRENT (reuse preload if available)
//       if (!soundRef.current) {
//         let sound: Audio.Sound | null = null;

//         // 1. Try to reuse preloaded sound
//         if (nextSoundRef.current) {
//           const preloaded = nextSoundRef.current;
//           const status = await preloaded.getStatusAsync();

//           if (status.isLoaded) {
//             sound = preloaded;
//             nextSoundRef.current = null;
//           }
//         }

//         // 2. Fallback → create fresh sound
//         if (!sound) {
//           const result = await Audio.Sound.createAsync(
//             { uri: item.uri },
//             { shouldPlay: false },
//           );
//           sound = result.sound;
//         }

//         soundRef.current = sound;

//         // 🎯 Attach listener ONCE
//         sound.setOnPlaybackStatusUpdate((status) => {
//           if (!status.isLoaded) return;

//           setIsPlaying(status.isPlaying);

//           if (status.durationMillis) {
//             setProgress(status.positionMillis / status.durationMillis);
//           }

//           if (status.didJustFinish) {
//             // Reset UI
//             setIsPlaying(false);
//             setProgress(0);

//             // AUTO-ADVANCE with tiny delay smoother flow
//             setTimeout(() => {
//               if (nextItem?.id) {
//                 setActive(nextItem.id);
//               }
//             }, 120);
//           }
//         });

//         // ▶️ Safe play
//         const status = await sound.getStatusAsync();
//         if (status.isLoaded) {
//           await sound.playAsync();
//         }
//       }

//       // ⚡ PRELOAD NEXT (non-blocking)
//       if (nextItem && !nextSoundRef.current) {
//         Audio.Sound.createAsync({ uri: nextItem.uri }, { shouldPlay: false })
//           .then(({ sound }) => {
//             nextSoundRef.current = sound;
//           })
//           .catch(() => {});
//       }
//     }

//     // 👉 NOT ACTIVE → CLEANUP
//     else {
//       if (soundRef.current) {
//         try {
//           await soundRef.current.setVolumeAsync(0); // smooth fade out
//         } catch {}
//         await safeAudioCleanup(soundRef.current);
//         soundRef.current = null;
//       }
//     }
//   } catch (err) {
//     console.log("handlePlayback error:", err);
//   }
// }

//   useEffect(() => {
//     handlePlayback();

//     return () => {
//       if (soundRef.current) {
//         soundRef.current.unloadAsync().catch(() => {});
//       }

//       if (nextSoundRef.current) {
//         nextSoundRef.current.unloadAsync().catch(() => {});
//       }
//     };
//   }, [activeId]);

//   //Tap to pause / resume
//   async function togglePlay() {
//     if (!soundRef.current) return;

//     const status = await soundRef.current.getStatusAsync();
//     if (!status.isLoaded) return;

//     if (status.isPlaying) {
//       await soundRef.current.pauseAsync();
//     } else {
//       //if finished -> restart from 0
//       if (status.positionMillis === status.durationMillis) {
//         await soundRef.current.setPositionAsync(0);
//       }
//       await soundRef.current.playAsync();
//     }
//   }

//   return (
//     <Pressable
//       onPress={togglePlay}
//       style={{ height: usableHeight }}
//       className={`${bgMap[item.category]} justify-between px-6 py-12`}
//     >
//       {/* TOP */}
//       <View>
//         <Text className="text-white text-xl font-semibold">
//           {item.neighborhood}
//         </Text>
//         <Text className="text-neutral-500 text-sm">{item.town}</Text>
//       </View>

//       {/* CENTER */}
//       <View className="items-center">
//         <View
//           className={`w-32 h-32 rounded-full bg-neutral-800 items-center justify-center mb-10 ${
//             isPlaying ? "scale-105" : "scale-100"
//           }`}
//         >
//           <Text className="text-white text-3xl">{isPlaying ? "⏸" : "▶"}</Text>
//         </View>

//         {/* Progress */}
//         <View className="w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
//           <View
//             className="h-full bg-white"
//             style={{ width: `${progress * 100}%` }}
//           />
//         </View>
//       </View>
//       <View className="absolute top-1/3 w-full px-8">
//         <Text className="text-white text-3xl leading-10 text-center font-medium">
//           I had a rough day…
//         </Text>
//       </View>

//       {/* BOTTOM */}
//       <View>
//         <Text className="text-gray-500 text-xs mb-4">{item.views} écoutes</Text>

//         <View className="flex-row justify-around">
//           {emojis.map((emoji) => (
//             <Pressable
//               key={emoji}
//               onPress={() => addReaction(item.id, emoji)}
//               className="items-center"
//             >
//               <Text className="text-2xl">{emoji}</Text>
//               <Text className="text-gray-500 text-xs mt-1">
//                 {item.reactions[emoji]}
//               </Text>
//             </Pressable>
//           ))}
//         </View>
//       </View>
//     </Pressable>
//   );
// }

import { safeAudioCleanup } from "@/lib/safeAudioCleanup";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioPost, useRecordingStore } from "../store/useRecordingStore";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  item: AudioPost;
  nextItem?: AudioPost;
  sharedNextSoundRef: React.MutableRefObject<Audio.Sound | null>;
};

export default function AudioCard({
  item,
  nextItem,
  sharedNextSoundRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const usableHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const stopAllAudioFlag = useRecordingStore((s) => s.stopAllAudioFlag);
  useEffect(() => {
    if (soundRef.current) {
      safeAudioCleanup(soundRef.current);
      soundRef.current = null;
    }
  }, [stopAllAudioFlag]);

  const activeId = useRecordingStore((s) => s.activeId);
  const setActive = useRecordingStore((s) => s.setActive);

  const soundRef = useRef<Audio.Sound | null>(null);
  const nextSoundRef = sharedNextSoundRef;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🎧 PLAYBACK ENGINE
  async function handlePlayback() {
    try {
      // 👉 ACTIVE CARD
      if (activeId === item.id) {
        // 🎧 PLAY CURRENT (reuse preload if available)
        if (!soundRef.current) {
          let sound: Audio.Sound | null = null;

          // 1. Try to reuse preloaded sound
          if (nextSoundRef.current) {
            const preloaded = nextSoundRef.current;
            const status = await preloaded.getStatusAsync();

            if (status.isLoaded) {
              sound = preloaded;
              nextSoundRef.current = null;
            }
          }

          // 2. Fallback → create fresh sound
          if (!sound) {
            const result = await Audio.Sound.createAsync(
              { uri: item.uri },
              { shouldPlay: false },
            );
            sound = result.sound;
          }

          soundRef.current = sound;

          // 🎯 Attach listener ONCE
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;

            setIsPlaying(status.isPlaying);

            if (status.durationMillis) {
              setProgress(status.positionMillis / status.durationMillis);
            }

            if (status.didJustFinish) {
              // Reset UI
              setIsPlaying(false);
              setProgress(0);

              // AUTO-ADVANCE with tiny delay smoother flow
              setTimeout(() => {
                if (nextItem?.id) {
                  setActive(nextItem.id);
                }
              }, 120);
            }
          });

          // ▶️ Safe play
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.playAsync();
          }
        }

        // ⚡ PRELOAD NEXT (non-blocking)
        if (nextItem && !nextSoundRef.current) {
          Audio.Sound.createAsync({ uri: nextItem.uri }, { shouldPlay: false })
            .then(({ sound }) => {
              nextSoundRef.current = sound;
            })
            .catch(() => {});
        }
      }

      // 👉 NOT ACTIVE → CLEANUP
      else {
        if (soundRef.current) {
          try {
            await soundRef.current.setVolumeAsync(0); // smooth fade out
          } catch {}
          await safeAudioCleanup(soundRef.current);
          soundRef.current = null;
        }
      }
    } catch (err) {
      console.log("handlePlayback error:", err);
    }
  }

  useEffect(() => {
    handlePlayback();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [activeId]);

  // 🎛 toggle
  async function togglePlay() {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  return (
    <Pressable
      onPress={togglePlay}
      style={{ height: usableHeight }}
      className="bg-black"
    >
      {/* 🌆 BACKGROUND */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade", // placeholder
        }}
        blurRadius={40}
        className="flex-1"
      >
        {/* DARK OVERLAY */}
        <View className="flex-1 bg-black/70 px-6">
          {/* TOP BAR */}
          <View
            style={{ paddingTop: insets.top + 10 }}
            className="items-center"
          >
            <Text className="text-yellow-400 tracking-[6px] text-lg">
              GRIOT
            </Text>

            <View className="mt-3 px-4 py-2 bg-white/10 rounded-full">
              <Text className="text-white text-sm">📍 {item.town}, BF</Text>
            </View>
          </View>

          {/* CENTER — VOICE */}
          <View className="flex-1 justify-center items-center px-6 pb-32">
            <Text className="text-white text-3xl text-center leading-10 font-medium">
              {item.transcript ||
                "La deguê à côté de la Creamière n'est plus bon..."}
            </Text>

            <Text className="text-neutral-400 mt-4 text-sm">
              {item.neighborhood} • now
            </Text>

            {/* PLAYER */}
            <View className="items-center">
              {/* PLAY BUTTON */}
              <View className="w-24 h-24 rounded-full border border-yellow-400 items-center justify-center mb-6">
                <Text className="text-yellow-400 text-2xl">
                  {isPlaying ? "⏸" : "▶"}
                </Text>
              </View>

              {/* FAKE WAVEFORM (visual only for now) */}
              <View className="flex-row items-end gap-[2px] h-10 mb-2">
                {[...Array(40)].map((_, i) => (
                  <View
                    key={i}
                    className="w-[2px] bg-yellow-400"
                    style={{
                      height: Math.random() * 30 + 5,
                      opacity: i / 40,
                    }}
                  />
                ))}
              </View>

              {/* PROGRESS */}
              <View className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-yellow-400"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
