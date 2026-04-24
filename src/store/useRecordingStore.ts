// src/store/useRecordingStore.ts
import { create } from "zustand";

console.log("STORE INIT");

export type Category = "social" | "security" | "vente";

export type AudioPost = {
  id: string;
  uri: string;
  username: string;
  avatar: string;
  neighborhood: string;
  town: string;
  country?: string;
  category: Category;
};

type Store = {
  recordings: AudioPost[];
  activeId: string | null;
  setActive: (id: string) => void;
  addRecording: (uri: string) => AudioPost;
  deleteRecording: (id: string) => void;
};

export const useRecordingStore = create<Store>((set) => ({
  recordings: [],
  activeId: null,

  setActive: (id) => set({ activeId: id }),

  addRecording: (uri) => {
    const newItem: AudioPost = {
      id: Date.now().toString(),
      uri,
      username: "Hamza", // temp
      avatar: "https://i.pravatar.cc/150?img=1",
      neighborhood: "Karpala",
      town: "Ouagadougou",
      category: "social",
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
}));
