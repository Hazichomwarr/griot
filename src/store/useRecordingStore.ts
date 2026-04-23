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
  addRecording: (uri: string) => void;
};

export const useRecordingStore = create<Store>((set) => ({
  recordings: [],
  activeId: null,

  setActive: (id) => set({ activeId: id }),

  addRecording: (uri) =>
    set((state) => ({
      recordings: [
        {
          id: Date.now().toString(),
          uri,
          username: "Hamza", // temp
          avatar: "https://i.pravatar.cc/150?img=1",
          neighborhood: "Karpala",
          town: "Ouagadougou",
          category: "social",
        },
        ...state.recordings,
      ],
    })),
}));
