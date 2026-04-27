// src/store/useRecordingStore.ts
import { create } from "zustand";

console.log("STORE INIT");

export type Category = "social" | "security" | "vente";

export type Reactions = {
  "😂": number;
  "🚨": number;
  "👍": number;
};

export type AudioPost = {
  id: string;
  uri: string;
  duration?: number; // audio duration

  views: number;
  reactions: Reactions;

  username: string;
  avatar: string;
  neighborhood: string;
  town: string;
  country?: string;
  category: Category;

  distance?: string; // "2 blocks away"
  timestamp?: string; // Tonight
};

type Store = {
  recordings: AudioPost[];
  activeId: string | null;

  stopAllAudioFlag: number;
  triggerStopAllAudio: () => void;

  setActive: (id: string) => void;
  addRecording: (uri: string, category: Category) => AudioPost;
  deleteRecording: (id: string) => void;

  incrementViews: (id: string) => void;
  addReaction: (id: string, emoji: keyof Reactions) => void;
};

export const useRecordingStore = create<Store>((set) => ({
  recordings: [],
  activeId: null,
  stopAllAudioFlag: 0,

  triggerStopAllAudio: () =>
    set((state) => ({ stopAllAudioFlag: state.stopAllAudioFlag + 1 })),

  setActive: (id) => set({ activeId: id }),

  addRecording: (uri, category) => {
    const newItem: AudioPost = {
      id: Date.now().toString(),
      uri,
      username: "Hamza", // temp
      avatar: "https://i.pravatar.cc/150?img=1",
      neighborhood: "Karpala",
      town: "Ouagadougou",
      views: 0,
      category,
      reactions: {
        "😂": 0,
        "🚨": 0,
        "👍": 0,
      },
    };
    set((state) => ({
      recordings: [newItem, ...state.recordings],
    }));
    return newItem;
  },

  deleteRecording: (id) =>
    set((state) => ({
      recordings: state.recordings.filter((r) => r.id !== id),
    })),

  incrementViews: (id) =>
    set((state) => ({
      recordings: state.recordings.map((r) =>
        r.id === id ? { ...r, views: r.views + 1 } : r,
      ),
    })),
  addReaction: (id, emoji) =>
    set((state) => ({
      recordings: state.recordings.map((r) =>
        r.id === id
          ? {
              ...r,
              reactions: { ...r.reactions, [emoji]: r.reactions[emoji] + 1 },
            }
          : r,
      ),
    })),
}));
